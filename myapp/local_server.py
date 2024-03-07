from flask import Flask, request
from functions.auth_check.main import check_authorization
from functions.chat.main import chat_manager
from functions.debate.main import debate_manager
from functions.images.main import images_manager
from functions.profile.main import profile_manager
from functions.messages.main import messages_manager
from functions.news.main import news_manager
from functions.signup.main import signup_manager

app = Flask(__name__)

@app.route('/auth_check', methods=['GET', 'POST'])
def handle_auth_check():
    return check_authorization(request)

@app.route('/chat', methods=['GET', 'POST'])
def handle_chat():
    return chat_manager(request)

@app.route('/debate', methods=['GET', 'POST'])
def handle_debate():
    return debate_manager(request)

@app.route('/images', methods=['GET', 'POST'])
def handle_images():
    return images_manager(request)

@app.route('/profile', methods=['GET', 'POST'])
def handle_profile():
    return profile_manager(request)

@app.route('/messages', methods=['GET', 'POST'])
def handle_messages():
    return messages_manager(request)

@app.route('/news', methods=['GET', 'POST'])
def handle_news():
    return news_manager(request)

@app.route('/signup', methods=['GET', 'POST'])
def handle_signup():
    return signup_manager(request)

if __name__ == '__main__':
    app.run(debug=True, port=8080, host='0.0.0.0')

