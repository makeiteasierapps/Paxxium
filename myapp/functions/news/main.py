import os
from dotenv import load_dotenv
from firebase_admin import firestore, credentials, initialize_app

load_dotenv()
cred = None
if os.getenv('LOCAL_DEV') == 'True':
    from .firebase_service import FirebaseService
    from .news_service import NewsService
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
else:
    from firebase_service import FirebaseService
    from news_service import NewsService
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


def news(request):
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
    news_service = NewsService(db, uid)

    if request.path == '/':
        news_data = news_service.get_all_news_articles(uid)
        return (news_data, 200, headers)

    if request.path == '/query':
        data = request.get_json()
        query = data['query']
        urls = news_service.get_article_urls(query)
        news_data = news_service.summarize_articles(urls)
        news_service.upload_news_data(uid, news_data)

        return (news_data, 200, headers)
    
    if request.path == '/get-news-topics':
        news_topics = news_service.get_user_news_topics(uid)
        return (news_topics, 200, headers)
    
    if request.path == '/news_articles':
        data = request.get_json()
        doc_id = data['articleId']
        if request.method == 'PUT':
            news_service.mark_is_read(uid, doc_id)
            return ({"message": "Updated successfully"}, 200, headers) 
        if request.method == 'DELETE':
            news_service.delete_news_article(uid, doc_id)
            return ({"message": "Deleted successfully"}, 200, headers)