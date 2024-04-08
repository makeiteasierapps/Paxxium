import json
import os
from pymongo import MongoClient
from openai import OpenAI
import certifi
from canopy.tokenizer import Tokenizer

from dotenv import load_dotenv
from firebase_admin import credentials, initialize_app
from flask import Response

load_dotenv()
Tokenizer.initialize()
cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    from .message_service import MessageService
    from .user_services import UserService
    from .BossAgent import BossAgent
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    from message_service import MessageService
    from user_services import UserService
    from BossAgent import BossAgent
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
message_service = MessageService(db)
user_service = UserService(db)

def query_project_index(query, project_id):
    open_client = OpenAI()
    response = open_client.embeddings.create(input=query, model='text-embedding-3-small')
    embeddings = response.data[0].embedding
    pipeline = [
        {
            '$vectorSearch': {
                'index': 'vector_index',
                'path': 'values',
                'queryVector': embeddings,
                'numCandidates': 100,
                'limit': 10,
                'filter': {
                    'project_id': project_id
                }
            }
        }, {
            '$project': {
                '_id': 0,
                'text': 1,
                'source': 1,
                'score': {
                    '$meta': 'vectorSearchScore'
                }
            }
        }
    ]

    results = db["chunks"].aggregate(pipeline)
    return results
        
def prepare_response_for_llm(query_results):
    text = []
    sources = []
    
    for item in query_results:
        if item['score'] > 0.5:
            print(item)
            text.append(item['text'])
            sources.append(item['source'])

    combined_text = ' '.join(text)
    project_query_instructions = f'''
    \nAnswer the users question based off of the knowledge base provided below, provide 
    a detailed response that is relevant to the users question.\n
    KNOWLEDGE BASE: {combined_text}
    '''
    return project_query_instructions

def process_message(uid, chat_id, user_message, chat_settings, chat_history, image_url=None):
    model = chat_settings['agentModel']
    system_prompt = chat_settings['systemPrompt']
    chat_constants = chat_settings['chatConstants']
    use_profile_data = chat_settings['useProfileData']
    boss_agent = BossAgent(uid=uid, user_service=user_service, model=model, system_prompt=system_prompt, chat_constants=chat_constants, use_profile_data=use_profile_data)
    message_content = user_message['content']
    message_from = user_message['message_from']
    image_url = user_message['image_url']

    # Create a new message in the database
    message_service.create_message(chat_id, message_from, message_content, image_url)

    # Pass message to Agent
    message_obj = {
        'user_message': message_content,
        'chat_history': chat_history
    }

    if image_url is not None:
        message_obj['image_url'] = image_url
        complete_message = ''
        for response_chunk in boss_agent.pass_to_vision_model(message_obj):
            complete_message += response_chunk['content']
            response_chunk['chat_id'] = chat_id
            yield json.dumps(response_chunk) + '\n'
    else:
        complete_message = ''
        for response_chunk in boss_agent.pass_to_boss_agent(message_obj):
            complete_message += response_chunk['content']
            response_chunk['chat_id'] = chat_id
            yield json.dumps(response_chunk) + '\n'
    
    message_service.create_message(chat_id, 'agent', complete_message)

def messages(request):
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
    
    if request.path in ('/post', '/messages/post'):
        data = request.json
        user_message = data.get('userMessage')
        chat_history = data.get('chatHistory')
        chat_settings = data.get('chatSettings')
        project_id = chat_settings.get('projectId')  
        chat_id = chat_settings.get('chatId')  
        system_prompt = chat_settings.get('systemPrompt')  

        if project_id is not None:
            query_results = query_project_index(user_message['content'], project_id)
            instructions_to_add = prepare_response_for_llm(query_results)
            system_prompt += instructions_to_add
            chat_settings['systemPrompt'] = system_prompt

        image_url = None
    
        if data.get('image_url') is not None:
            image_url = data['image_url']
    
        generator = process_message(uid, chat_id, user_message, chat_settings, chat_history, image_url)
    
        return (Response(generator, mimetype='application/json'), 200, headers)
    
    if request.path in ('/clear', '/messages/clear'):
        data = request.json
        chat_id = data.get('chatId')
        message_service.delete_all_messages(chat_id)
        return ('Memory Cleared', 200, headers)
    
    if request.path in ('/utils', '/messages/utils'):
        file = request.files['image']
        file_url = user_service.upload_file_to_firebase_storage(file, uid)
        return (json.dumps({'fileUrl': file_url}), 200, headers)


