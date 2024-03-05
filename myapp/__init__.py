import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from firebase_admin import firestore, credentials
import firebase_admin
from myapp.services.message_service import MessageService
from myapp.services.user_services import UserService
from myapp.services.chat_services import ChatService
from myapp.services.firebase_service import FirebaseService
from myapp.services.news_service import NewsService
from myapp.services.profile_services import ProfileService


# Initialize Firebase
cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_SDK'))
firebase_admin.initialize_app(cred, {
    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
})

def create_app():

    load_dotenv()
    frontend_url = os.getenv('FRONTEND_URL')
    
    # Create the Flask application
    app = Flask(__name__)

    # Configure CORS
    CORS(app, origins='*', supports_credentials=True, allow_headers=['Content-Type', 'Authorization'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])

    # Create the Firestore client
    db = firestore.client()

    # app config settings
    app.config['db'] = db
    app.message_service = MessageService(db)
    app.user_service = UserService(db)
    app.firebase_service = FirebaseService()
    app.chat_service = ChatService(db)
    app.news_service = NewsService(db)
    app.profile_service = ProfileService()

    # Register blueprints
    from myapp import views
    views.register_blueprints(app)

    return app

