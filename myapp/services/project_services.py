import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from canopy.tokenizer import Tokenizer
from canopy.models.data_models import Document
from canopy.knowledge_base.models import KBEncodedDocChunk
from canopy.knowledge_base.chunker.recursive_character import RecursiveCharacterChunker

if os.getenv('LOCAL_DEV') == 'True':
    from .ContentScraper import ContentScraper
else:
    from ContentScraper import ContentScraper

load_dotenv()
Tokenizer.initialize()
tokenizer = Tokenizer()

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

    def chunkify(self, doc, url):
        # Generate a unique ID for the document using its content
        doc_id = str(uuid.uuid4())
        chunker = RecursiveCharacterChunker(chunk_size=450)
        chunks = chunker.chunk_single_document(Document(id=doc_id, text=doc, source=url))
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

    def scrape_url(self, url, project_id):
        content_scraper = ContentScraper(url)
        content = content_scraper.extract_content()

        chunks = self.chunkify(content, url)
        embeddings = self.embed_chunks(chunks)

        # Normalize and hash the URL to use as a document ID
        normalized_url = self.normalize_url(url)

        # First, insert the project_doc without the chunks to get the doc_id
        project_doc = {
            'type': 'url',
            'chunks': [],  # Temporarily leave this empty
            'value': content,
            'project_id': project_id,
            'token_count': tokenizer.token_count(content),
            'url': normalized_url
        }
        inserted_doc = self.db['project_docs'].insert_one(project_doc)
        doc_id = str(inserted_doc.inserted_id)

        # Now, insert each chunk with the doc_id included
        chunk_ids = []
        for chunk in embeddings:
            # Unpack the metadata to extract 'text' and 'source' directly
            metadata_text = chunk['metadata']['text']
            metadata_source = chunk['metadata']['source']
            # Prepare the chunk without the 'metadata' field but with 'text' and 'source' directly
            chunk_to_insert = {
                **chunk,
                'text': metadata_text,
                'source': metadata_source,
                'doc_id': doc_id,
                'project_id': project_id
            }
            # Remove the original 'metadata'/ id fields
            chunk_to_insert.pop('metadata', None)
            chunk_to_insert.pop('id', None)
            inserted_chunk = self.db['chunks'].insert_one(chunk_to_insert)
            chunk_ids.append(inserted_chunk.inserted_id)

        # Finally, update the project_doc with the list of chunk_ids
        self.db['project_docs'].update_one({'_id': doc_id}, {'$set': {'chunks': chunk_ids}})

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

    def extract_pdf(self, file, project_id):
        text = ContentScraper.extract_text_from_pdf(file)
        num_tokens = tokenizer.token_count(text)

        file_name = file.filename

        # Chunkify the extracted text
        chunks = self.chunkify(text, file_name)
        # Embed the chunks
        embeddings = self.embed_chunks(chunks)

        # Insert the project_doc without the chunks to get the doc_id
        project_doc = {
            'type': 'pdf',
            'chunks': [],  # Temporarily leave this empty
            'value': text,
            'project_id': project_id,
            'token_count': num_tokens,
            'file_name': file_name
        }
        inserted_doc = self.db['project_docs'].insert_one(project_doc)
        doc_id = inserted_doc.inserted_id

        # Now, insert each chunk with the doc_id included
        chunk_ids = []
        for chunk in embeddings:
            # Unpack the metadata to extract 'text' and 'source' directly
            metadata_text = chunk['metadata']['text']
            metadata_source = chunk['metadata']['source']
            # Prepare the chunk without the 'metadata' field but with 'text' and 'source' directly
            chunk_to_insert = {
                **chunk,
                'text': metadata_text,
                'source': metadata_source,
                'doc_id': doc_id
            }
            # Remove the original 'metadata'/ id fields
            chunk_to_insert.pop('metadata', None)
            chunk_to_insert.pop('id', None)
            inserted_chunk = self.db['chunks'].insert_one(chunk_to_insert)
            chunk_ids.append(inserted_chunk.inserted_id)

        # Finally, update the project_doc with the list of chunk_ids
        self.db['project_docs'].update_one({'_id': doc_id}, {'$set': {'chunks': chunk_ids}})

    def create_new_project(self, uid, name, description):
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
        project_details['_id'] = str(new_project.inserted_id)
        return project_details
