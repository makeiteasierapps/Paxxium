import os
import certifi
from pymongo import MongoClient
from firebase_admin import credentials, initialize_app
from dotenv import load_dotenv

load_dotenv()
cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    cred = credentials.ApplicationDefault()

initialize_app(cred, {
    'projectId': 'paxxiumv1',
})

# MongoDB URI
mongo_uri = os.getenv('MONGO_URI')
# Create a new MongoClient and connect to the server
client = MongoClient(mongo_uri, tlsCAFile=certifi.where())

db = client['paxxium']

firebase_service = FirebaseService()

os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

def auth_check(request):
    """
    Checks if admin has granted access to the user
    """
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
    
    user_doc = db['users'].find_one({'_id': uid})
        
    auth_status = user_doc.get('auth_status', False)
    response['auth_status'] = auth_status

    return (response, 200, headers)