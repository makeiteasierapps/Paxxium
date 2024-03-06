import io
from firebase_admin import firestore, credentials, initialize_app
from firebase_service import FirebaseService
from BossAgent import BossAgent
from user_services import UserService
import requests


cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'paxxiumv1',
    'storageBucket': 'paxxiumv1.appspot.com'
})
db = firestore.client()
firebase_service = FirebaseService()

user_service = UserService(db)

def images_manager(request):
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

    if request.path == '/generate':
        image_request = request.get_json()
        image_agent = BossAgent(uid, user_service)
        image_url = image_agent.generate_image(image_request)
        return (image_url, 200, headers)
    
    if request.path == '/get_saved':
        images_list = user_service.fetch_all_from_dalle_images(uid)
        return (images_list, 200, headers)
    
    if request.path == '/delete':
        path = request.get_json()
        user_service.delete_generated_image_from_firebase_storage(path)
        return ({'message': 'Image deleted successfully'}, 200, headers)

    if request.path == '/upload':
        data = request.get_json()
        url = data.get('image')  
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return ({'error': 'Failed to fetch image'}, 400, headers)
        image_data = response.content
        image_blob = io.BytesIO(image_data)
        image_url = user_service.upload_generated_image_to_firebase_storage(image_blob, uid)
        return (image_url, 200, headers)