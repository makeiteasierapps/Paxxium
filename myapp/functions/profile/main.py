from firebase_admin import firestore, credentials, initialize_app
from firebase_service import FirebaseService
from profile_service import ProfileService
from user_services import UserService

cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'paxxiumv1',
    'storageBucket': 'paxxiumv1.appspot.com'
})
db = firestore.client()
firebase_service = FirebaseService()

user_service = UserService(db)
profile_service = ProfileService()

def profile_manager(request):
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
        if request.method == 'GET':
            user_profile = user_service.get_profile(uid)
            return (user_profile, 200, headers)

    if request.path == '/questions':
        if request.method == 'POST':
            
            data = request.get_json()
            profile_service.update_profile_questions(uid, data, db)
            
            return ({'response': 'Profile questions updated successfully'}, 200, headers)

        profile_data = profile_service.load_profile_questions(uid, db)
        return (profile_data, 200, headers)
    
    if request.path == '/user':
        data = request.get_json()
        user_service.update_user_profile(uid, data)
        return ({'response': 'User profile updated successfully'}, 200, headers)
    
    if request.path == '/avatar':
        file = request.files['avatar']
        avatar_url = user_service.upload_profile_image_to_firebase_storage(file, uid)

        return ({'avatar_url': avatar_url}, 200, headers)
    
    if request.path == '/analyze':
        if request.method == 'POST':
            parsed_analysis = user_service.analyze_profile(uid)
            user_service.update_user_profile(uid, parsed_analysis)

            if 'news_topics' in parsed_analysis:
                parsed_analysis['news_topics'] = list(parsed_analysis['news_topics'].values())

            return (parsed_analysis, 200, headers)
        # GET request
        profile_analysis = user_service.get_profile_analysis(uid)
        return (profile_analysis, 200, headers)

