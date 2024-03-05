import json
from firebase_admin import firestore, credentials, initialize_app
from flask import Response
from firebase_service import FirebaseService
from message_service import MessageService
from user_services import UserService
from BossAgent import BossAgent

cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'paxxiumv1',
    'storageBucket': 'paxxiumv1.appspot.com'
})
db = firestore.client()
firebase_service = FirebaseService()
message_service = MessageService(db)
user_service = UserService(db)


def process_message(uid, chat_id, user_message, chat_settings, convo_history):
    model = chat_settings['agentModel']
    system_prompt = chat_settings['systemPrompt']
    chat_constants = chat_settings['chatConstants']
    use_profile_data = chat_settings['useProfileData']
    boss_agent = BossAgent(uid=uid, user_service=user_service, model=model, system_prompt=system_prompt, chat_constants=chat_constants, use_profile_data=use_profile_data)
    message_content = user_message['content']
    message_from = user_message['message_from']

    # Create a new message in the database
    message_service.create_message(chat_id, uid, message_from, message_content)
    
    # Pass message to Agent
    message_obj = {
        'user_message': message_content,
        'convo_history': convo_history
    }
    complete_message = ''
    for response_chunk in boss_agent.pass_to_boss_agent(message_obj):
        complete_message += response_chunk['content']
        response_chunk['chat_id'] = chat_id
        yield json.dumps(response_chunk) + '\n'
    
    message_service.create_message(chat_id, uid, 'agent', complete_message)

def messages_manager(request):
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

    if request.path == '/':
        data = request.json
        conversation_id = data.get('id')
        conversation_data = message_service.get_all_messages(uid, conversation_id)
    
        return (conversation_data, 200, headers)
    
    if request.path == '/post':
        data = request.json
        user_message = data.get('userMessage')
        convo_history = data.get('convoHistory')
        chat_settings = data.get('chatSettings')
        chat_id = chat_settings['chatId']
    
        if data.get('image_url') is not None:
            
            # Extract data from request
            message_content = data.get('content')
            message_from = data.get('message_from')
            image_url = data['image_url']
            new_message = message_service.create_message(chat_id=chat_id, uid=uid, message_content=message_content, message_from=message_from, image_url=image_url)
            boss_agent = BossAgent(uid, user_service)
            boss_agent.pass_to_vision_model(new_message)
            return
    
        generator = process_message(uid, chat_id, user_message, chat_settings, convo_history)
    
        return (Response(generator, mimetype='application/json'), 200, headers)
    
    if request.path == '/clear':
        data = request.json
        chat_id = data.get('id')
        message_service.delete_all_messages(uid, chat_id)
        return ('Memory Cleared', 200, headers)
    
    if request.path == '/utils':
        file = request.files['image']
        file_url = user_service.upload_file_to_firebase_storage(file, uid)
        return (file_url, 200, headers)


