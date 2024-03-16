import os
import json
from dotenv import load_dotenv
from firebase_admin import firestore, credentials, initialize_app

load_dotenv()
cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    from .user_services import UserService
    from .BossAgent import BossAgent
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
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

db = firestore.client()
firebase_service = FirebaseService()

user_service = UserService(db)


def profile(request):
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

    if request.path in ('/', '/profile'):
        user_profile = user_service.get_profile(uid)
        return (user_profile, 200, headers)

    if request.path in ('/answers', '/profile/answers'):
        if request.method == 'POST':
            
            data = request.get_json()
            user_service.update_profile_answers(uid, data)
            
            return ({'response': 'Profile questions/answers updated successfully'}, 200, headers)
        profile_data = user_service.load_profile_answers(uid)
        return (profile_data, 200, headers)
    
    if request.path in ('/user', '/profile/user'):
        data = request.get_json()
        user_service.update_user_profile(uid, data)
        return ({'response': 'User profile updated successfully'}, 200, headers)
    
    if request.path in ('/update_avatar', '/profile/update_avatar'):
        file = request.files['avatar']
        avatar_url = user_service.upload_profile_image_to_firebase_storage(file, uid)

        return ({'avatar_url': avatar_url}, 200, headers)

    if request.path in ('/analyze', '/profile/analyze'):

        profile_agent = BossAgent(uid, user_service, model='GPT-4')
        prompt = user_service.prepare_analysis_prompt(uid)
        response = profile_agent.pass_to_profile_agent(prompt)
        analyis_obj = json.loads(response)
        user_service.update_user_profile(uid, analyis_obj.copy())

        return (analyis_obj, 200, headers)
