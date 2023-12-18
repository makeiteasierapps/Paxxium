from flask import Blueprint, request, jsonify, current_app

profile = Blueprint('profile', __name__)

def authenticate_request():
    firebase_service = current_app.firebase_service
    id_token = request.headers.get('Authorization')
    decoded_token = firebase_service.verify_id_token(id_token)
    
    if not decoded_token:
        return None
    return decoded_token['uid']

@profile.route('/profile/questions', methods=['GET', 'POST'])
def handle_questions():
    """
    Handle profile questions data in the users collection
    """
    uid = authenticate_request()
    ps = current_app.profile_service

    # Updating profile questions
    if request.method == 'POST':
        ps.update_profile_questions(uid, request.get_json())
        return {'response': 'Profile questions updated successfully'}, 200
        

    # Handling a GET request
    profile_data = ps.load_profile_questions(uid)
    return jsonify(profile_data), 200

@profile.route('/profile', methods=['GET'])
def get_profile():
    """
    Get profile data from the users collection
    """
    uid = authenticate_request()
    us = current_app.user_service
    
    profile_data = us.get_profile(uid)
    
    return jsonify(profile_data), 200

@profile.route('/profile/user', methods=['POST'])
def update_user():
    """
    Update profile data in the users collection
    """
    us = current_app.user_service
    uid = authenticate_request()

    data = request.get_json()

    us.update_user_profile(uid, data)
    
    return {'response': 'Profile updated successfully'}, 200

@profile.route('/profile/update_avatar', methods=['POST'])
def update_avatar():
    """
    Update profile data in the users collection
    """
    us = current_app.user_service
    uid = authenticate_request()
    print(request.files)
    file = request.files['avatar']
    avatar_url = us.upload_avatar_picture(file, uid)

    return {'avatarUrl': avatar_url}, 200

@profile.route('/profile/analyze', methods=['GET', 'POST'])
def analyze_profile():
    """
    Update profile data in the users collection
    """
    uid = authenticate_request()
    us = current_app.user_service

    if request.method == 'POST':
        parsed_analysis = us.analyze_profile(uid)
        us.update_user_profile(uid, parsed_analysis)

        if 'news_topics' in parsed_analysis:
            parsed_analysis['news_topics'] = parsed_analysis['news_topics'].values

        return jsonify(parsed_analysis), 200
    
    # GET request
    profile_analysis = us.get_profile_analysis(uid)
    return jsonify(profile_analysis), 200