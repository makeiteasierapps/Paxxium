import os
from dotenv import load_dotenv
import hashlib
from canopy.tokenizer import Tokenizer
from datetime import datetime
from canopy.models.data_models import Document
from canopy.knowledge_base import KnowledgeBase
from canopy.knowledge_base.record_encoder import OpenAIRecordEncoder
from pinecone import Pinecone
if os.getenv('LOCAL_DEV') == 'True':
    from .ContentScraper import ContentScraper
else:
    from ContentScraper import ContentScraper

load_dotenv()
Tokenizer.initialize()
tokenizer = Tokenizer()
pinecone = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
class ProjectServices:
    def __init__(self, db):
        self.db = db

    def get_projects(self, uid):
        
        projects_ref = self.db.collection('users').document(uid).collection('projects')
        projects = projects_ref.get()
        project_list = [{'id': project.id, **project.to_dict()} for project in projects]
        return project_list

    def scrape_url(self, uid, url, project_name, project_id):
        content_scraper = ContentScraper(url)
        content = content_scraper.extract_content()
        print(content)
        num_tokens = tokenizer.token_count(content)

        # Storing the entire text in firestore along with the token count.
        url_collection_ref = self.db.collection('users').document(uid).collection('projects').document(project_id).collection('urls')
        url_collection_ref.add({'url': url, 'content': content, 'created_at': datetime.utcnow(), 'token_count': num_tokens})
        
        # Normalize and hash the URL to use as a document ID
        normalized_url = self.normalize_url(url)
        url_hash = hashlib.sha256(normalized_url.encode()).hexdigest()

        # Add to pinecone with the hashed URL as the document ID
        encoder = OpenAIRecordEncoder(model_name="text-embedding-3-small")
        kb = KnowledgeBase(index_name=project_name, record_encoder=encoder)
        kb.connect()
        docs = [Document(id=url_hash, text=content, metadata={'url': url})]
        kb.upsert(docs)

    def normalize_url(self, url):
        # Example normalization process
        url = url.lower()
        if url.startswith("http://"):
            url = url[7:]
        elif url.startswith("https://"):
            url = url[8:]
        url = url.split('#')[0]  # Remove fragment
        url = url.split('?')[0]  # Remove query
        if url.endswith('/'):
            url = url[:-1]
        return url

    def extract_pdf(self, uid, file, project_name, project_id):
        text = ContentScraper.extract_text_from_pdf(file)
        num_tokens = tokenizer.token_count(text)

        file_name = file.filename

        # Storing data in firestoree
        doc_collection_ref = self.db.collection('users').document(uid).collection('projects').document(project_id).collection('docs')
        doc_collection_ref.add({'content': text, 'name': file_name, 'token_count': num_tokens, 'created_at': datetime.utcnow()})
        
        # Encode and add to pinecone
        encoder = OpenAIRecordEncoder(model_name="text-embedding-3-small")
        kb = KnowledgeBase(index_name=project_name, record_encoder=encoder)
        kb.connect()
        docs = [Document(id='doc1', text=text, metadata={'title': file_name})]
        kb.upsert(docs)
        return text

    def create_new_project(self, uid, name, description):
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
        new_project_ref = self.db.collection('users').document(uid).collection('projects').add(project_details)
        new_project_id = new_project_ref[1].id
        return new_project_id, index_name
