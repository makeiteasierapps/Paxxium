import os
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
import pprint
from flask import jsonify
from firebase_admin import credentials, initialize_app

headers = {"Access-Control-Allow-Origin": "*"}
load_dotenv()

cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    from .user_services import UserService
    from .project_services import ProjectServices
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    from user_services import UserService
    from project_services import ProjectServices
    cred = credentials.ApplicationDefault()

try:
    initialize_app(cred, {
        'projectId': 'paxxiumv1',
        'storageBucket': 'paxxiumv1.appspot.com'
    })
except ValueError:
    pass

# MongoDB URI
mongo_uri = os.getenv('MONGO_URI')
# Create a new MongoClient and connect to the server
client = MongoClient(mongo_uri, tlsCAFile=certifi.where())

db = client['paxxium']
firebase_service = FirebaseService()
user_service = UserService(db)
project_services = ProjectServices(db)

def cors_preflight_response():
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE, PUT, PATCH",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "3600",
    }
    return ("", 204, cors_headers)

def verify_request_token(request):
    id_token = request.headers.get('Authorization')
    if not id_token:
        return None  # Token missing
    
    decoded_token = firebase_service.verify_id_token(id_token)
    if not decoded_token:
        return None  # Token invalid
    
    return decoded_token['uid']  # Return UID if successful

def generate_token_error_response(request):
    message = 'Missing token' if 'Authorization' not in request.headers else 'Invalid token'
    return jsonify({'message': message}), 403, headers

def handle_fetch_projects(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    project_list = project_services.get_projects(uid)
    return jsonify({'projects': project_list}), 200, headers

def handle_scrape(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)

    data = request.get_json()
    urls = data.get('urls')
    print(f"Scraping URLs: {urls}")
    project_name = data.get('projectName')
    project_id = data.get('projectId')
    if not urls or not isinstance(urls, list) or not all(urls):
        return jsonify({'message': 'URLs are required and must be a non-empty list'}), 400, headers

    for url in urls:
        project_services.scrape_url(uid, url, project_name, project_id)
        
    return jsonify({'message': 'Scraped and added to project'}), 200, headers

def handle_extract(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    
    file = request.files.get('file')
    
    if not file:
        return jsonify({'message': 'No file part'}), 400, headers

    project_name = request.form.get('projectName')
    project_id = request.form.get('projectId')

    if not project_name:
        return jsonify({'message': 'Project name is required'}), 400, headers

    # Check if the file is a PDF
    if not file.filename.endswith('.pdf'):
        return jsonify({'message': 'File is not a PDF'}), 400, headers
    
    try:
        text = project_services.extract_pdf(uid, file, project_name, project_id)
        
        return jsonify({'message': 'Extracted', 'text': text}), 200, headers
    
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return jsonify({'message': 'Failed to extract text'}), 500, headers
    
def create_new_project(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    print(f"Creating new project: {name}, {description}")
    new_project_id = project_services.create_new_project(uid, name, description)
    return jsonify({'message': 'Project created', 'project_id': new_project_id, 'project_name': name}), 200, headers

def projects(request):
    if request.method == "OPTIONS":
        return cors_preflight_response()
    
    if request.path in ('/', '/projects'):
        return handle_fetch_projects(request)
    
    if request.path in ('/scrape', '/projects/scrape'):
        return handle_scrape(request)

    if request.path in ('/extract', '/projects/extract'):
        return handle_extract(request)
    
    if request.path in ('/create', '/projects/create'):
        return create_new_project(request)