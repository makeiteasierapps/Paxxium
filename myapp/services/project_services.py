import os
from dotenv import load_dotenv
from openai import OpenAI
import hashlib
from canopy.tokenizer import Tokenizer
from datetime import datetime
from canopy.models.data_models import Document
from canopy.knowledge_base import KnowledgeBase
from canopy.knowledge_base.models import KBEncodedDocChunk
from canopy.knowledge_base.record_encoder import OpenAIRecordEncoder
from canopy.knowledge_base.chunker.recursive_character import RecursiveCharacterChunker

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
        # Query the 'projects' collection for all projects with the matching 'uid'
        projects_cursor = self.db['projects'].find({'uid': uid})
        # Convert the cursor to a list of dictionaries, adding an 'id' field from the '_id' field
        project_list = [{'id': str(project['_id']), **project} for project in projects_cursor]
        # Remove the MongoDB '_id' from the dictionary to avoid serialization issues
        for project in project_list:
            project.pop('_id', None)
        return project_list

    def chunkify(self, doc):
        # Generate a unique ID for the document using its content
        doc_id = hashlib.sha256(doc.encode('utf-8')).hexdigest()
        chunker = RecursiveCharacterChunker(chunk_size=450)
        chunks = chunker.chunk_single_document(Document(id=doc_id, text=doc))
        return chunks
    
    def embed_chunks(self, chunks):
        client = OpenAI()
        encoded_chunks = []
        for chunk in chunks:
            # Assuming `chunk` is an instance of `KBDocChunk`
            response = client.embeddings.create(input=chunk.text, model='text-embedding-3-small')
            embeddings = response.data[0].embedding
            # Wrap the KBDocChunk in a KBEncodedDocChunk with embeddings
            encoded_chunk = KBEncodedDocChunk(
                id=chunk.id,
                text=chunk.text,
                document_id=chunk.document_id,  # Ensure this is set in your KBDocChunk
                values=embeddings,  # The embeddings you obtained
                metadata=chunk.metadata if hasattr(chunk, 'metadata') else {},  # Optional metadata
                source=chunk.source if hasattr(chunk, 'source') else None  # Optional source
            )
            
            record = encoded_chunk.to_db_record()
            encoded_chunks.append(record)
        return encoded_chunks

    def scrape_url(self, uid, url, project_name, project_id):
        content_scraper = ContentScraper(url)
        content = content_scraper.extract_content()
        num_tokens = tokenizer.token_count(content)
        print(num_tokens)
        chunks = self.chunkify(content)
        embeddings = self.embed_chunks(chunks)
        print(embeddings)
        print(len(chunks))

        # Storing the entire text in firestore along with the token count.
        # url_collection_ref = self.db.collection('users').document(uid).collection('projects').document(project_id).collection('urls')
        # url_collection_ref.add({'url': url, 'content': content, 'created_at': datetime.utcnow(), 'token_count': num_tokens})
        
        # Normalize and hash the URL to use as a document ID
        normalized_url = self.normalize_url(url)
        url_hash = hashlib.sha256(normalized_url.encode()).hexdigest()

        # Add to pinecone with the hashed URL as the document ID
        # encoder = OpenAIRecordEncoder(model_name="text-embedding-3-small")
        # kb = KnowledgeBase(index_name=project_name, record_encoder=encoder)
        # kb.connect()
        # docs = [Document(id=url_hash, text=content, metadata={'url': url})]
        # kb.upsert(docs)

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
        # encoder = OpenAIRecordEncoder(model_name="text-embedding-3-small")
        # kb = KnowledgeBase(index_name=name, record_encoder=encoder)
        # kb.create_canopy_index()
        # index_name = kb.index_name
        # Create a new document in firebase firestore
        project_details = {
                'name': name,
                'uid': uid,
                'description': description,
                'objective': '',
                'documents': [],
                'urls': [],
                'created_at': datetime.utcnow()
            }
        
        new_project = self.db['projects'].insert_one(project_details)
        # Retrieve the ID of the newly inserted document
        new_project_id = new_project.inserted_id
        return new_project_id
