from flask import Blueprint, request, jsonify, current_app
import requests
import io

from myapp.agents.dalle_agent import generate_image

images = Blueprint('images', __name__)

def authenticate_request(id_token=None):
    firebase_service = current_app.firebase_service
    if id_token:
        decoded_token = firebase_service.verify_id_token(id_token)
        if not decoded_token:
            return None
        return decoded_token['uid']
    
    # Handle the case when idToken is not provided (e.g., for fetch requests)
    id_token = request.headers.get('Authorization')
    decoded_token = firebase_service.verify_id_token(id_token)
    if not decoded_token:
        return None
    return decoded_token['uid']

@images.route('/images/get_saved', methods=['GET'])
def get_saved_images():
    uid = authenticate_request()
    user_service = current_app.user_service
    images_list = user_service.fetch_all_from_dalle_images(uid)
    return jsonify(images_list), 200

@images.route('/images/delete', methods=['POST'])
def delete_image_from_firebase_storage():
    user_service = current_app.user_service
    path = request.get_json()
    user_service.delete_generated_image_from_firebase_storage(path)

    return jsonify({'message': 'Image deleted successfully'}), 200

@images.route('/images/generate', methods=['POST'])
def get_messages():
    authenticate_request()
    image_request = request.get_json()
    image_url = generate_image(image_request)

    return jsonify(image_url), 200

@images.route('/images/upload', methods=['POST'])
def upload_image():
    uid = authenticate_request()
    data = request.get_json()
    url = data.get('image')  

    response = requests.get(url, timeout=10)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch image'}), 400

    image_data = response.content
    image_blob = io.BytesIO(image_data)
    user_service = current_app.user_service
    image_url = user_service.upload_generated_image_to_firebase_storage(image_blob, uid)

    return jsonify(image_url), 200