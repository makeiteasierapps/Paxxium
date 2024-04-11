from datetime import datetime
from bson import ObjectId

class ChatService:
    def __init__(self, db):
        self.db = db

    def create_chat_in_db(self, uid, chat_name, agent_model, system_prompt, chat_constants, use_profile_data, project_id=None):
        """
        Creates a new chat in the database
        """
        new_chat = {
            'uid': uid,
            'chat_name': chat_name,
            'agent_model': agent_model,
            'system_prompt': system_prompt,
            'chat_constants': chat_constants,
            'use_profile_data': use_profile_data,
            'is_open': True,
            'created_at': datetime.utcnow()
        }
        
        result = self.db['chats'].insert_one(new_chat)
        return str(result.inserted_id)

    def get_all_chats(self, uid):
        """
        Returns a list of dictionaries with chat ids for a given user, including all fields from the document
        """

        # Query the conversations collection for conversations belonging to the user
        chats_cursor = self.db['chats'].find({'uid': uid}).sort('created_at', -1)
        
        # Function to recursively convert ObjectId to string
        def convert_objectid(obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            elif isinstance(obj, list):
                return [convert_objectid(item) for item in obj]
            elif isinstance(obj, dict):
                return {k: convert_objectid(v) for k, v in obj.items()}
            else:
                return obj

        # Create a list of dictionaries with all fields, converting ObjectId to string
        chats = []
        for conv in chats_cursor:
            chat = convert_objectid(conv)
            chat['chatId'] = chat.pop('_id')  # Rename '_id' to 'chatId'
            chats.append(chat)
        
        return chats
    
    def get_single_chat(self, uid, chat_id):
        """
        Returns a dictionary of chat data for a given user and chat id
        """
        chat = self.db['chats'].find_one({'_id': ObjectId(chat_id), 'uid': uid})
        return chat if chat else None
    
    def update_visibility(self, uid, chat_id, is_open):
        """
        Updates the visibility of a chat in the database
        """
        self.db['chats'].update_one({'_id': ObjectId(chat_id), 'uid': uid}, {'$set': {'is_open': is_open}})

    def delete_conversation(self, uid, chat_id):
        """
        Deletes a conversation from the database
        """
        self.db['chats'].delete_one({'_id': ObjectId(chat_id), 'uid': uid})

    def update_settings(self, uid, chat_id, chat_name, agent_model, system_prompt, chat_constants, use_profile_data):
        """
        Updates a chat in the database
        """
        update_result = self.db['chats'].update_one(
            {'_id': ObjectId(chat_id), 'uid': uid},
            {'$set': {
                'chat_name': chat_name,
                'agent_model': agent_model,
                'system_prompt': system_prompt,
                'chat_constants': chat_constants,
                'use_profile_data': use_profile_data
            }}
        )
        return update_result