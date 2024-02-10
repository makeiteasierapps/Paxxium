from flask import Blueprint, request, current_app
from pydub import AudioSegment
from io import BytesIO


handle_audio = Blueprint('handle_audio', __name__)

def authenticate_request():
    firebase_service = current_app.firebase_service
    id_token = request.headers.get('Authorization')
    decoded_token = firebase_service.verify_id_token(id_token)
    
    if not decoded_token:
        return None
    return decoded_token['uid']

@handle_audio.route('/process_audio', methods=['POST'])
def process_audio():
    """
    Takes in wav file from external device. 
    """
    uid = authenticate_request()
    if not uid:
        return {'message': 'Invalid token'}, 403
    
    wav_data = request.data
    if not wav_data:
        return {'message': 'No audio data provided'}, 400
    
    # Load audio file
    audio_data = BytesIO(request.data)
    audio = AudioSegment.from_file(audio_data, format="wav")

    # Increase the volume by 10 dB
    increased_audio = audio + 10

    # Example: Filtering out noise (simple approach)
    # Note: For more advanced noise reduction, consider using libraries like noisereduce or scipy
    # Export the processed audio to a new BytesIO object to pass along
    new_wav = BytesIO()
    increased_audio.export(new_wav, format="wav")
    new_wav.seek(0)
    
    return {'message': 'Audio processed successfully'}, 200
    


