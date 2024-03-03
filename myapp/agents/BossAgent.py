from openai import OpenAI
from flask import current_app
from flask_socketio import join_room




# Stream resonse shape
token_stream = {'message_from': 'agent', 'content': 'token', 'chat_id': 'chat_id', 'type': 'stream',}
 

class BossAgent:
    def __init__(self, uid, model="gpt-3.5-turbo-0125", system_prompt="You are a friendly but genuine AI Agent. Don't be annoyingly nice, but don't be rude either.", chat_constants='', user_analysis=''):
        user_service = current_app.user_service
        encrypted_openai_key, encrypted_serp_key = user_service.get_keys(uid)
        self.uid = uid
        self.openai_api_key = user_service.decrypt(encrypted_openai_key)
        self.serp_key = user_service.decrypt(encrypted_serp_key)
        self.model = model
        self.system_prompt = system_prompt
        self.chat_constants = chat_constants
        self.user_analysis = user_analysis

    def __repr__(self):
        return f"<BossAgent id={self.uid}>"

    def update_chat_settings(self, model, system_prompt):
        self.model = model
        self.system_prompt = system_prompt
        
    
    def pass_to_boss_agent(self, message_obj, conversation_id, user_id):
        content = message_obj['content']
        message_content = f'***USER ANALYSIS***\n{self.user_analysis}\n***THINGS TO REMEMBER***\n{self.chat_constants}\n**************\n{content}'
        response = self.master_ai.run(message_content)                                 
        
        return response
    
    def pass_to_vision_model(self, new_message, conversation_id, uid):
        from myapp import socketio
        client = OpenAI()

        image_url = new_message['image_url']
        user_message = new_message['content']
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_message},
                        {
                            "type": "image_url",
                            "image_url": image_url,
                        },
                    ],
                }
            ],
            max_tokens=300,
            stream=True,
        )

        complete_response = ""
        join_room(conversation_id)
        for chunk in response:
            for choice in chunk.choices:
                if choice.delta.content is None:
                    continue
                complete_response += choice.delta.content
                socketio.emit('token', {'message_from': 'agent', 'content': choice.delta.content, 'chat_id': self.chat_id, 'type': 'stream',}, room=self.chat_id)
                socketio.sleep(0)
        
        response_obj = self.message_service.create_message(conversation_id=conversation_id, message_from='agent', user_id=uid, message_content=complete_response)
        # add memory to agent
        self.memory.save_context({"input": new_message['content']}, {"output": complete_response})
        return response_obj
    
    def pass_to_debateAI(self, message_obj):
        message_content = message_obj['content']
        response = self.master_ai.run(message_content)
        return response

        
    
    def load_history_to_memory(self, conversation):
        """
        Takes a conversation object extracts x amount of tokens and returns a message
        object ready to pass into OpenAI chat completion
        """
        
        return
                
        


