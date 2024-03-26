import os
import pprint
import json
from flask import jsonify
import traceback
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


class ContentScraper:
    @staticmethod
    def scrape_site(url):
        try:
            response = requests.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'lxml')
        except Exception as e:
            print(f"Error scraping site: {e}")
            return None

    @staticmethod
    def extract_content(soup):
        if soup is None:
            return ""
        # Try to detect and use the main content area to reduce nav/footer content.
        main_content_selectors = ['main', 'article', 'div#content', 'div.content']
        main_content = None
        for selector in main_content_selectors:
            main_content = soup.select_one(selector)
            if main_content:
                break  # Stop if we find a main content area
        
        if not main_content:
            main_content = soup  # Fallback to entire soup if no main content detected

        content_list = []  # Store all sections
        current_section = None
        all_content_str = ""  # For final single string output
        encountered_content = set()  # Track encountered content to avoid duplicates

        # Focus on tags that are less likely to be nested or contain duplicates
        for tag in main_content.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'span']):
            # Skip likely nav/footer tags based on their class or id
            if any(keyword in ' '.join(tag.get('class', [])) + tag.get('id', '') for keyword in ['nav', 'footer']):
                continue

            # Create a hash of the tag's text and name to check for duplicates
            tag_content_hash = hash((tag.name, tag.get_text(separator=' ', strip=True)))
            if tag_content_hash in encountered_content:
                continue
            encountered_content.add(tag_content_hash)

            # Process text and links if any
            text = tag.get_text(separator=' ', strip=True)
            href = tag.get('href', '')
            full_text = f'{text} {href}'.strip() if href else text

            if full_text:
                if tag.name.startswith('h') and tag.name[1:].isdigit():
                    current_section = {'title': full_text, 'content': []}
                    content_list.append(current_section)
                    all_content_str += "\n\n" + full_text + "\n"  # New section in final string
                else:
                    if current_section is None:
                        current_section = {'title': 'General', 'content': []}
                        content_list.append(current_section)
                    current_section['content'].append(full_text)
                    all_content_str += full_text + " "  # Continue current section content
                    
        print(all_content_str)
        return all_content_str

def cors_preflight_response():
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE, PUT, PATCH",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "3600",
    }
    return ("", 204, headers)

def handle_request(request):
    headers = {"Access-Control-Allow-Origin": "*"}
    id_token = request.headers.get('Authorization')
    if not id_token:
        return jsonify({'message': 'Missing token'}), 403, headers
    
    decoded_token = firebase_service.verify_id_token(id_token)
    if not decoded_token:
        return jsonify({'message': 'Invalid token'}), 403, headers

    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'message': 'URL is required'}), 400, headers

    soup = ContentScraper.scrape_site(url)
    content = ContentScraper.extract_content(soup)
    return jsonify({'content': content}), 200, headers

def project(request):
    if request.method == "OPTIONS":
        return cors_preflight_response()
    return handle_request(request)
