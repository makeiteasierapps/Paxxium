from flask import current_app
from datetime import datetime
from google.cloud import firestore


class MessageService:
    def __init__(self, db):
        self.db = db
        
    def select_model(self, agent_model):
        # Choose the appropriate model based on the bot_name
        if agent_model == 'GPT-4':
            model = 'gpt-4-0613'
        elif agent_model == 'GPT-3.5':
            model = 'gpt-3.5-turbo-0613'
        else:
            raise ValueError("Invalid bot name")

        return model

    def create_message(
            self,
            chat_id,
            uid,
            message_from,
            message_content,
            image_url=None
            ):
        new_message = {
            'message_from': message_from,
            'content': message_content,
            'image_url': image_url,
            'type': 'database',
            'time_stamp': datetime.utcnow()
        }
        self.db.collection('users').document(uid).collection('conversations').document(chat_id).collection('messages').add(new_message)
        return new_message

    def get_all_messages(self, user_id, conversation_id):
        conversation_ref = self.db.collection('users').document(user_id).collection('conversations').document(conversation_id)
        conversation = conversation_ref.get()
        agent_model = conversation.get('agent_model') if conversation.exists else None
        messages = conversation_ref.collection('messages').order_by('time_stamp', direction=firestore.Query.ASCENDING).stream()
        
        return {"agent_model": agent_model, "messages": [msg.to_dict() for msg in messages]}
    
    def delete_all_messages(self, user_id, conversation_id):
        messages_ref = self.db.collection('users').document(user_id).collection('conversations').document(conversation_id).collection('messages')
        
        batch = self.db.batch()
        for doc in messages_ref.stream():
            batch.delete(doc.reference)
        batch.commit()
