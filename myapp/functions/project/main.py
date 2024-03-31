import os
from dotenv import load_dotenv
import pprint
from datetime import datetime
from canopy.tokenizer import Tokenizer
from canopy.models.data_models import Document
from canopy.knowledge_base import KnowledgeBase
from canopy.knowledge_base.record_encoder import OpenAIRecordEncoder
from flask import jsonify
from firebase_admin import firestore, credentials, initialize_app
from pinecone import Pinecone

headers = {"Access-Control-Allow-Origin": "*"}
load_dotenv()
Tokenizer.initialize()
tokenizer = Tokenizer()
pinecone = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    from .BossAgent import BossAgent
    from .user_services import UserService
    from .ContentScraper import ContentScraper
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    from BossAgent import BossAgent
    from user_services import UserService
    from ContentScraper import ContentScraper
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
user_service = UserService(db)

def cors_preflight_response():
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE, PUT, PATCH",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "3600",
    }
    return ("", 204, headers)

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
    
    projects_ref = db.collection('users').document(uid).collection('projects')
    projects = projects_ref.get()
    project_list = [{'id': project.id, **project.to_dict()} for project in projects]
    return jsonify({'projects': project_list}), 200, headers

def handle_scrape(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)

    data = request.get_json()
    url = data.get('url')
    project_name = data.get('projectName')
    project_id = data.get('projectId')
    if not url:
        return jsonify({'message': 'URL is required'}), 400, headers

    soup = ContentScraper.scrape_site(url)
    content = ContentScraper.extract_content(soup)

    num_tokens = tokenizer.token_count(content)

    # Storing the entire text in firestore along with the token count. For certain token counts it might be better
    # to feed the raw text. Either way storing the raw text allows for flexibility in the future.
    url_collection_ref = db.collection('users').document(uid).collection('projects').document(project_id).collection('urls')
    url_collection_ref.add({'url': url, 'content': content, 'created_at': datetime.utcnow(), 'token_count': num_tokens})
    
    # add to pinecone
    encoder = OpenAIRecordEncoder(model_name="text-embedding-3-small")
    kb = KnowledgeBase(index_name=project_name, record_encoder=encoder)
    kb.connect()
    docs = [Document(id='doc1', text=content, metadata={'url': url})]
    kb.upsert(docs)
    
    return jsonify({'message': 'Scraped and added to project'}), 200, headers

def handle_extract(request):
    uid = verify_request_token(request)
    if uid is None:
        return generate_token_error_response(request)
    
    file = request.files.get('file')
    
    if not file:
        return jsonify({'message': 'No file part'}), 400, headers

    file_name = file.filename

    project_name = request.form.get('projectName')
    project_id = request.form.get('projectId')

    if not project_name:
        return jsonify({'message': 'Project name is required'}), 400, headers

    # Check if the file is a PDF
    if not file.filename.endswith('.pdf'):
        return jsonify({'message': 'File is not a PDF'}), 400, headers
    
    try:
        text = ContentScraper.extract_text_from_pdf(file)
        num_tokens = tokenizer.token_count(text)

        # Storing data in firestoree
        doc_collection_ref = db.collection('users').document(uid).collection('projects').document(project_id).collection('docs')
        doc_collection_ref.add({'content': text, 'name': file_name, 'token_count': num_tokens, 'created_at': datetime.utcnow()})
        
        # Encode and add to pinecone
        encoder = OpenAIRecordEncoder(model_name="text-embedding-3-small")
        kb = KnowledgeBase(index_name=project_name, record_encoder=encoder)
        kb.connect()
        docs = [Document(id='doc1', text=text, metadata={'title': file_name})]
        kb.upsert(docs)
        
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
    

    encoder = OpenAIRecordEncoder(model_name="text-embedding-3-small")
    kb = KnowledgeBase(index_name=name, record_encoder=encoder)
    kb.create_canopy_index()
    index_name = kb.index_name
    # Create a new document in firebase firestore
    project_details = {
            'name': index_name,
            'description': description,
            'created_at': datetime.utcnow()
        }
    new_project_ref = db.collection('users').document(uid).collection('projects').add(project_details)
    new_project_id = new_project_ref[1].id
    return jsonify({'message': 'Project created', 'project_id': new_project_id, 'project_name': index_name}), 200, headers

def project(request):
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