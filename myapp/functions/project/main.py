import os
import pprint
import json
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from firebase_admin import firestore, credentials, initialize_app

load_dotenv()
cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    cred = credentials.ApplicationDefault()

try:
    initialize_app(cred, {
        'projectId': 'paxxiumv1',
        'storageBucket': 'paxxiumv1.appspot.com'
    })
except ValueError:
    pass

db = firestore.client()
firebase_service = FirebaseService()

def project(request):
    response = {}
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE, PUT, PATCH",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)
    headers = {"Access-Control-Allow-Origin": "*"}
    id_token = request.headers.get('Authorization')
    if not id_token:
        response['message'] = 'Missing token'
        return (response, 403, headers)

    decoded_token = firebase_service.verify_id_token(id_token)
    if not decoded_token:
        response['message'] = 'Invalid token'
        return (response, 403, headers)

    uid = decoded_token['uid']

    if request.path in ('/project', '/project/scrape'):
        data = request.get_json()
        url = data.get('url')
        
        content_list = []

    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        current_section = None

        # Iterate through each tag that could contain relevant content
        for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'article', 'section', 'div', 'span']):
            text = tag.text.strip()
            if not text:
                continue  # Skip empty tags

            # Check if the tag is a heading, indicating a new section
            if tag.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                # Start a new section with the heading as the title
                current_section = {'title': text, 'content': []}
                content_list.append(current_section)
            else:
                # If there's no current section (e.g., content starts without a heading), create an unnamed section
                if current_section is None:
                    current_section = {'title': '', 'content': []}
                    content_list.append(current_section)
                
                # Add the content to the current section
                current_section['content'].append(text)

        pprint.pprint(content_list)

        return (content_list, 200, headers)
    except requests.exceptions.RequestException as e:
        return (str(e), 400, headers)
