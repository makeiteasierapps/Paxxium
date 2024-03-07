import os
from dotenv import load_dotenv
from firebase_admin import firestore, credentials, initialize_app

load_dotenv()
cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    from .user_services import UserService
    from .message_service import MessageService
    from .debate_service import DebateService
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    from user_services import UserService
    from message_service import MessageService
    from debate_service import DebateService
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
message_service = MessageService(db)

def debate_manager(request):
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

    if request.path == '/create':
        data = request.get_json()
        role1 = data.get('role_1')
        role2 = data.get('role_2')
        topic = data.get('topic')

        new_debate_id = DebateService.create_debate(db, uid)

        debate_data = {
            'id': new_debate_id,
            'role1': role1,
            'role2': role2,
            'topic': topic,
            'chat_name': 'Debate',
            'agent_model': 'AgentDebate',
            'is_open': True,
        }
        
        return (debate_data, 200, headers)

    if request.path == '/run-debate':
        data = request.get_json()
        turn = data.get('turn')
        chat_id = data.get('chat_id')
        role1 = data.get('role_1')
        role2 = data.get('role_2')
        topic = data.get('topic')
        debate_service = DebateService(db=db, uid=uid, chat_id=chat_id, user_service=user_service, message_service=message_service, role1=role1, role2=role2)

        response_content, has_more_turns, agent_responding = debate_service.run_debate(topic, turn)

        
        debate_data = {'hasMoreTurns': has_more_turns,
        'message': {
                'content': response_content,
                'message_from': agent_responding,
                'agent_model': 'AgentDebate',
                'topic': topic,
                'id': chat_id,
                'user_id': uid,
            }}
        return (debate_data, 200, headers)

