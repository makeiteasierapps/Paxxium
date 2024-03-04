import logging
from firebase_admin import firestore, credentials, initialize_app
from firebase_service import FirebaseService
from chat_services import ChatService

cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'paxxiumv1',
})
db = firestore.client()
firebase_service = FirebaseService()
chat_service = ChatService(db)
logging.basicConfig(level=logging.INFO)

def chat_manager(request):

    # Initialize response dictionary and headers
    response = {}
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Max-Age': '3600'
    }

    if request.method == 'OPTIONS':
        return ('', 204, headers)

    id_token = request.headers.get('Authorization')
    if not id_token:
        response['message'] = 'Missing token'
        return (response, 403, headers)

    decoded_token = firebase_service.verify_id_token(id_token)
    if not decoded_token:
        response['message'] = 'Invalid token'
        return (response, 403, headers)

    uid = decoded_token['uid']

    chat_data_list = chat_service.get_all_chats(uid)
    logging.info('chat_data_list: %s', chat_data_list)
    
    return (chat_data_list, 200, headers)

    
