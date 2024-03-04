from flask import Blueprint, request, jsonify, current_app, Response
from ..agents.BossAgent import BossAgent
import json

messages = Blueprint('messages', __name__)

def authenticate_request(id_token=None):
    firebase_service = current_app.firebase_service
    if id_token:
        decoded_token = firebase_service.verify_id_token(id_token)
        if not decoded_token:
            return None
        return decoded_token['uid']
    
    # Handle the case when idToken is not provided (e.g., for fetch requests)
    id_token = request.headers.get('Authorization')
    decoded_token = firebase_service.verify_id_token(id_token)
    if not decoded_token:
        return None
    return decoded_token['uid']


@messages.route('/<string:conversation_id>/messages', methods=['POST'])
def get_messages(conversation_id):
    uid = authenticate_request()
    message_service = current_app.message_service
    conversation_data = message_service.get_all_messages(uid, conversation_id)
    
    return jsonify(conversation_data), 200


@messages.route('/messages', methods=['POST'])
def handle_message_http():
    id_token = request.headers.get('Authorization')
    uid = authenticate_request(id_token)

    data = request.json
    print(data)
    user_message = data.get('userMessage')
    convo_history = data.get('convoHistory')
    chat_settings = data.get('chatSettings')
    chat_id = chat_settings['chatId']
    
    if data.get('image_url') is not None:
        message_service = current_app.message_service
        # Extract data from request
        message_content = data.get('content')
        message_from = data.get('message_from')
        image_url = data['image_url']
        new_message = message_service.create_message(conversation_id=chat_id, message_content=message_content, message_from=message_from, user_id=uid, image_url=image_url)
        boss_agent = BossAgent(uid, current_app.user_service)
        boss_agent.pass_to_vision_model(new_message)
        return
    
    generator = process_message(uid, chat_id, user_message, chat_settings, convo_history, current_app.message_service, current_app.user_service)
    
    return Response(generator, mimetype='application/json')
    

def process_message(uid, chat_id, user_message, chat_settings, convo_history, message_service, user_service):
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
        print(response_chunk['content'])
        response_chunk['chat_id'] = chat_id
        yield json.dumps(response_chunk) + '\n'
    
    message_service.create_message(chat_id, uid, 'agent', complete_message)

@messages.route('/<string:conversation_id>/messages/clear', methods=['DELETE'])
def clear_memory(conversation_id):
    uid = authenticate_request()
    message_service = current_app.message_service
    message_service.delete_all_messages(uid, conversation_id)
    return {'message': 'Memory cleared'}, 200

@messages.route('/messages/utils', methods=['POST'])
def upload_to_firebase_storage():
    uid = authenticate_request()
    user_service = current_app.user_service
    file = request.files['image']
    file_url = user_service.upload_file_to_firebase_storage(file, uid)
    return {'fileUrl': file_url}, 200