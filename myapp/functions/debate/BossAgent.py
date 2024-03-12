from openai import OpenAI
import logging
import tiktoken

class BossAgent:
    def __init__(self, uid, user_service, model='', system_prompt="You are a friendly but genuine AI Agent. Don't be annoyingly nice, but don't be rude either.", chat_constants=None, use_profile_data=False):
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
        chat_history = message_obj['chat_history']

        new_chat_history = self.manage_chat(chat_history, new_user_message)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=new_chat_history,
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
    
    def pass_to_profile_agent(self, message):
        print(f"Message: {message}")
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": '''
                    You are an expert in identify the personality traits of your user.
                    Your response must be in json format with the following structure:
                    - analysis: provide a personality analysis of the user based on their answers to the questions. Do not simply summarize the answers, but provide a unique analysis of the user.
                    - news_topics: Should be a list of queries that are one or two words and be a good query parameter for calling a news API. Your topics should be derived from your analyis. Example formats: 2 words - Rock climbing - 1 word -AI
                    '''
                },
                {
                'role': 'user',
                'content': f'''{message}''',
                }
                
            ],
            response_format="json",
        )
        return response.choices[0].message.content

    # This hasn't been refactored yet
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
    # This hasn't been refactored yet
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
    
    def manage_chat(self, chat_history, new_user_message):
        """
        Takes a chat object extracts x amount of tokens and returns a message
        object ready to pass into OpenAI chat completion
        """

        formatted_messages = [{
                "role": "system",
                "content": self.system_prompt,
            },
        ]
        token_limit = 500
        token_count = 0
        for message in chat_history:
            if token_count > token_limit:
                break
            if message['message_from'] == 'user':
                token_count += self.token_counter(message['content'])
                formatted_messages.append({
                    "role": "user",
                    "content": message['content'],
                })
            else:
                token_count += self.token_counter(message['content'])
                formatted_messages.append({
                    "role": "assistant",
                    "content": message['content'],
                })

        message_parts = []
        if self.user_analysis:
            message_parts.append(f"***USER ANALYSIS***\n{self.user_analysis}\n**************")
        if self.chat_constants:
            message_parts.append(f"***THINGS TO REMEMBER***\n{self.chat_constants}\n**************")
        message_parts.append(new_user_message)
        message_content = "\n".join(message_parts)
        
        formatted_messages.append({
            "role": "user",
            "content": message_content,
        })
        
        return formatted_messages

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
    
    def token_counter(self, message):
        """Return the number of tokens in a string."""
        try:
            encoding = tiktoken.encoding_for_model(self.model)
        except KeyError:
            print("Warning: model not found. Using cl100k_base encoding.")
            encoding = tiktoken.get_encoding("cl100k_base")
        
        tokens_per_message = 3
        num_tokens = 0
        num_tokens += tokens_per_message
        num_tokens += len(encoding.encode(message))
        num_tokens += 3  # every reply is primed with <|im_start|>assistant<|im_sep|>
        return num_tokens