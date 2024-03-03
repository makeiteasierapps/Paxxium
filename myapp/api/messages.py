from flask import Blueprint, request, jsonify, current_app
from ..agents.BossAgent import BossAgent

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
    data = request.json
    id_token = data.get('idToken')
    chat_id = data.get('chatId')
    uid = authenticate_request(id_token)
    boss_agent = BossAgent(uid)
    
    if data.get('image_url') is not None:
        message_service = current_app.message_service
        # Extract data from request
        message_content = data.get('content')
        message_from = data.get('message_from')
        image_url = data['image_url']
        new_message = message_service.create_message(conversation_id=chat_id, message_content=message_content, message_from=message_from, user_id=uid, image_url=image_url)
        boss_agent.pass_to_vision_model(new_message, chat_id, uid)
        return
    
    response_from_llm = process_message(data, uid, chat_id)
    
    return jsonify(response_from_llm), 200
    

def process_message(data, uid, chat_id):
    message_service = current_app.message_service
    boss_agent = BossAgent(uid)

    message_content = data.get('content')
    message_from = data.get('message_from')

    # Create a new message in the database
    new_message = message_service.create_message(conversation_id=chat_id, message_content=message_content, message_from=message_from, user_id=uid)
    
    # Pass message to Agent
    response_from_llm = boss_agent.pass_to_boss_agent(message_obj=new_message, conversation_id=chat_id, user_id=uid)
    
    # Convert the timestamp to a string and add it back to the dictionary
    response_from_llm['time_stamp'] = str(response_from_llm['time_stamp'])

    return response_from_llm

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