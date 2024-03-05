from firebase_admin import firestore, credentials, initialize_app
from firebase_service import FirebaseService

cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'paxxiumv1',
})
db = firestore.client()
firebase_service = FirebaseService()

def check_authorization(request):
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
    
    user_doc = db.collection('users').document(uid).get()
        
    auth_status = user_doc.to_dict().get('authorized', False)
    response['auth_status'] = auth_status

    return (response, 200, headers)