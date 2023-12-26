
# # Loads chat history from the database. Counts tokens to get the maximum content possible, 
# # then starts a new thread and adds the previous conversation history to it.
# # Threads manage the context window so there is no need to have a buffer window.

# import openai
# # Function to count tokens in a message
# from tiktoken import Tokenizer
# tokenizer = Tokenizer()

# def count_tokens(text):
#     return len(list(tokenizer.tokenize(text)))

# # Load previous conversation history from your database
# previous_conversation = load_conversation_from_database(user_id)

# # Calculate total tokens in the previous conversation
# total_tokens = sum(count_tokens(message) for message in previous_conversation)

# # Maximum tokens allowed for gpt-4.0-turbo
# max_tokens = 4096

# # Leave some room for new messages in the session
# buffer_tokens = 100

# # If the total tokens exceed the limit, truncate the conversation history
# if total_tokens > max_tokens - buffer_tokens:
#     truncated_conversation = []
#     tokens_left = max_tokens - buffer_tokens

#     # Start from the end of the conversation history and work backwards
#     for message in reversed(previous_conversation):
#         message_tokens = count_tokens(message)

#         if message_tokens <= tokens_left:
#             truncated_conversation.append(message)
#             tokens_left -= message_tokens
#         else:
#             break

#     # Reverse the truncated conversation to maintain the original order
#     previous_conversation = list(reversed(truncated_conversation))

# # Start a new thread and include the previous conversation history
# thread = {
#     'messages': previous_conversation
# }

# # During the session, add new messages to the thread
# thread['messages'].append({
#     'role': 'user',
#     'content': 'Hello, assistant!'
# })

# # The model will consider all messages in the thread when generating a response
# response = openai.ChatCompletion.create(model="gpt-4.0-turbo", messages=thread['messages'])

# # Don't forget to save the updated conversation history to your database at the end of the session
# save_conversation_to_database(user_id, thread['messages'])