import os
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
from flask import jsonify
from firebase_admin import credentials, initialize_app

headers = {"Access-Control-Allow-Origin": "*"}
load_dotenv()

cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    from .project_services import ProjectServices
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    from project_services import ProjectServices
    cred = credentials.ApplicationDefault()

try:
    initialize_app(cred, {
        'projectId': 'paxxiumv1',
        'storageBucket': 'paxxiumv1.appspot.com'
    })
except ValueError:
    pass

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri, tlsCAFile=certifi.where())

db = client['paxxium']
firebase_service = FirebaseService()
project_services = ProjectServices(db)

def cors_preflight_response():
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE, PUT, PATCH",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, Project-ID",
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

def handle_delete_project(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    data = request.get_json()
    project_id = data.get('projectId')
    if not project_id:
        return jsonify({'message': 'Project ID is required'}), 400, headers
    project_services.delete_project_by_id(project_id)
    return jsonify({'message': 'Project deleted'}), 200, headers

def handle_fetch_documents(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    project_id = request.headers.get('Project-ID')
    if not project_id:
        return jsonify({'message': 'Project ID is required'}), 400, headers
    
    documents = project_services.get_docs_by_projectId(project_id)
    return jsonify({'documents': documents}), 200, headers  

def handle_delete_document(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    data = request.get_json()
    print(request.data)
    doc_id = data.get('docId')
    if not doc_id:
        return jsonify({'message': 'Doc ID is required'}), 400, headers
    
    project_services.delete_doc_by_id(doc_id)
    return jsonify({'message': 'Document deleted'}), 200, headers

def handle_scrape(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)

    data = request.get_json()
    crawl_entire_site = data.get('crawlEntireSite')
    if crawl_entire_site:
        urls = data.get('urls')
        project_id = data.get('projectId')
        name = data.get('projectName')
        if not urls:
            return jsonify({'message': 'URL is required'}), 400, headers
        new_docs = project_services.crawl_site(urls[0], project_id)
        return jsonify({'docs': new_docs}), 200, headers
    urls = data.get('urls')
    project_id = data.get('projectId')
    name = data.get('projectName')
    if not urls or not isinstance(urls, list) or not all(urls):
        return jsonify({'message': 'URLs are required and must be a non-empty list'}), 400, headers

    docs = []
    for url in urls:
        new_doc = project_services.scrape_url(url, project_id)
        docs.append(new_doc)

    return jsonify({'docs': docs}), 200, headers

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
        text = project_services.extract_pdf(file, project_id)
        
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
    objective = data.get('objective')
    
    new_project_details, new_chat_details = project_services.create_new_project(uid, name, objective)
    return jsonify({'new_project': new_project_details, 'new_chat': new_chat_details}), 200, headers

def handle_save_text_doc(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    
    data = request.get_json()
    project_id = data.get('projectId')
    text = data.get('text')
    category = data.get('category').lower()
    highlights = data.get('highlights')
    doc_id = data.get('docId')

    result = project_services.save_text_doc(project_id, category, text, highlights, doc_id)
    
    if result == 'not_found':
        return jsonify({'message': 'Document not found'}), 404, headers
    else:
        return jsonify({'message': 'Text doc saved', 'docId': result}), 200, headers

def handle_embed(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    
    data = request.get_json()
    doc = data.get('doc')
    highlights = data.get('highlights')
    doc_id = data.get('docId')
    project_id = data.get('projectId')

    project_services.embed_text_doc(doc_id, project_id, doc, highlights)

def handle_get_text_doc(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    
    project_id = request.args.get('projectId')
    doc = project_services.get_text_doc(project_id)
    return doc, 200, headers

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
    
    if request.path in ('/documents', '/projects/documents'):
        return handle_fetch_documents(request)
    
    if request.path in ('/documents/delete', '/projects/documents/delete'):
        return handle_delete_document(request)
    
    if request.path in ('/delete', '/projects/delete'):
        return handle_delete_project(request)
    
    if request.path in ('/save_text_doc', '/projects/save_text_doc'):
        return handle_save_text_doc(request)
    
    if request.path in ('/text_doc', '/projects/text_doc'):
        return handle_get_text_doc(request)
    
    if request.path in ('/embed', '/projects/embed'):
        return handle_embed(request)