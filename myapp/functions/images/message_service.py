from datetime import datetime
from bson.objectid import ObjectId

class MessageService:
    def __init__(self, db):
        self.db = db
        
    def select_model(self, agent_model):
        # Choose the appropriate model based on the bot_name
        if agent_model == 'GPT-4':
            model = 'gpt-4-turbo'
        elif agent_model == 'GPT-3.5':
            model = 'gpt-3.5-turbo'
        else:
            raise ValueError("Invalid bot name")

        return model

    def create_message(self, chat_id, message_from, message_content, image_url=None):
        new_message = {
            '_id': ObjectId(),
            'message_from': message_from,
            'content': message_content,
            'image_url': image_url,
            'type': 'database',
            'time_stamp': datetime.utcnow()
        }
        # Update the chat document to append the new message to the 'messages' array
        self.db.chats.update_one(
            {'_id': ObjectId(chat_id)}, 
            {'$push': {'messages': new_message}}
        )
        return new_message

    def delete_all_messages(self, chat_id):
        # Update the chat document to clear the 'messages' array
        self.db.chats.update_one(
            {'_id': ObjectId(chat_id)},
            {'$set': {'messages': []}}  # Set the 'messages' field to an empty list
        )
