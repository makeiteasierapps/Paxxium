from openai import OpenAI
import logging

class BossAgent:
    def __init__(self, uid, user_service, model='', system_prompt="You are a friendly but genuine AI Agent. Don't be annoyingly nice, but don't be rude either.", chat_constants='', use_profile_data=False):
        encrypted_openai_key, encrypted_serp_key = user_service.get_keys(uid)
        self.uid = uid
        self.openai_api_key = user_service.decrypt(encrypted_openai_key)
        self.client = OpenAI(api_key=self.openai_api_key)
        self.serp_key = user_service.decrypt(encrypted_serp_key)
        self.system_prompt = system_prompt
        self.chat_constants = chat_constants
        self.user_analysis = ""
        
        if model == 'GPT-4':
            self.model = 'gpt-4-0125-preview'
        else:
            self.model = 'gpt-3.5-turbo-0125'

        if use_profile_data:
            profile_data = user_service.get_profile_analysis(uid)
            self.user_analysis = profile_data['user_analysis']

    def __repr__(self):
        return f"<BossAgent id={self.uid}>"        
    
    def pass_to_boss_agent(self, message_obj):
        new_user_message = message_obj['user_message']
        convo_history = message_obj['convo_history']
        print(f"Convo History: {convo_history}")

        new_convo_history = self.manage_memory(convo_history, new_user_message)

        messages = [
            {
                "role": "system",
                "content": self.system_prompt,
            },
        ]
        print("new_user_message: ", new_user_message)
        message_content = f'***USER ANALYSIS***\n{self.user_analysis}\n***THINGS TO REMEMBER***\n{self.chat_constants}\n**************\n{new_user_message}'
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": message_content,
                }
            ],
            stream=True,
        )
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                stream_obj = {
                    'message_from': 'agent',
                    'content': chunk.choices[0].delta.content,
                    'type': 'stream',
                }
                logging.info(stream_obj)
                yield stream_obj
    
    def pass_to_vision_model(self, new_message):
        
        image_url = new_message['image_url']
        user_message = new_message['content']
        response = self.client.chat.completions.create(
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
            stream=True,
        )

        complete_response = ""
        
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                complete_response += chunk.choices[0].delta.content

        # Need to return the stream here
        
        # add memory to agent
        return complete_response
    
    def pass_to_debateAI(self, message_obj):
        message_content = message_obj['content']
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": 
                        {"type": "text", "text": message_content},
                }
            ],
            stream=True,
        )
        return response

    def pass_to_news_agent(self, article_to_summarize):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": article_to_summarize,
                }
            ],
        )

        return response.choices[0].message.content
    
    def manage_memory(self, conversation, user_message):
        """
        Takes a conversation object extracts x amount of tokens and returns a message
        object ready to pass into OpenAI chat completion
        """
        history = []
        
        return history

    def generate_image(self, request):
        prompt = request['prompt']
        size=request['size'].lower()
        quality=request['quality'].lower()
        style=request['style'].lower()
        

        response = self.client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            size=size,
            quality=quality,
            style=style,
        )

        return response.data[0].url