import os
from dotenv import load_dotenv
from firebase_admin import firestore, credentials, initialize_app

load_dotenv()
cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    from .user_services import UserService
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    from user_services import UserService
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

def signup_manager(request):
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
        req_data = request.get_json()
        username = req_data.get('username')
        uid = req_data.get('uid')
        openai_api_key = req_data.get('openAiApiKey')
        serp_api_key = req_data.get('serpApiKey')
        authorized = req_data.get('authorized')

        updates = {   
            'username': username,
            'open_key': openai_api_key,
            'serp_key': serp_api_key,
            'authorized': authorized}
      
        user_service.update_user_profile(uid, updates)

        return ({'message': 'User added successfully'}, 200, headers)

