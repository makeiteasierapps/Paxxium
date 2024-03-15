import os
import logging
from dotenv import load_dotenv
from firebase_admin import firestore, credentials, initialize_app

load_dotenv()
cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    from .chat_services import ChatService
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    from chat_services import ChatService
    cred = credentials.ApplicationDefault()

try:
    initialize_app(cred, {
        'projectId': 'paxxiumv1',
    })
except ValueError:
    pass

db = firestore.client()
firebase_service = FirebaseService()
chat_service = ChatService(db)
logging.basicConfig(level=logging.INFO)

def chat(request):
    print('request.path', request.path)
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

    if request.path in ('/', '/chat'):
        chat_data_list = chat_service.get_all_chats(uid)
        return (chat_data_list, 200, headers)
    
    if request.path in ('/create', '/chat/create'):
        data = request.get_json()
        chat_name = data['chatName']
        agent_model = data['agentModel']
        system_prompt = data['systemPrompt']
        chat_constants = data['chatConstants']
        use_profile_data = data['useProfileData']
        chat_id = chat_service.create_chat_in_db(uid, chat_name, agent_model, system_prompt, chat_constants, use_profile_data)
        chat_data = {
            'chatId': chat_id,
            'chat_name': chat_name,
            'agent_model': agent_model,
            'system_prompt': system_prompt,
            'chat_constants': chat_constants,
            'use_profile_data': use_profile_data,
            'is_open': True
        }
        return (chat_data, 200, headers)
    
    if request.path in ('/delete', '/chat/delete'):
        data = request.get_json()
        chat_id = data['chatId']
        chat_service.delete_conversation(uid, chat_id)
        return ('Conversation deleted', 200, headers)
    
    if request.path in ('/update_visibility', '/chat/update_visibility'):
        data = request.get_json()
        chat_id = data['chatId']
        is_open = data['is_open']
        chat_service.update_visibility(uid, chat_id, is_open)
        return ('Chat visibility updated', 200, headers)
    
    if request.path in ('/update_settings', '/chat/update_settings'):
        data = request.get_json()
        use_profile_data = data.get('use_profile_data')
        chat_name = data.get('chat_name')
        chat_id = data.get('id')
        agent_model = data.get('agent_model')
        system_prompt = data.get('system_prompt')
        chat_constants = data.get('chat_constants')
        chat_service.update_settings(uid, chat_id, chat_name, agent_model, system_prompt, chat_constants, use_profile_data)
        return ('Chat settings updated', 200, headers)
    

    
    
    

    
