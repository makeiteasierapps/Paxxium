import os
from datetime import datetime
from openai import OpenAI

from firebase_admin import firestore, credentials, initialize_app
from token_counter import token_counter

cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'paxxiumv1',
})
db = firestore.client()
client = OpenAI()

def transcribe_audio(request):
    """
    Takes in wav file from external device. 
    """
    wav_data = request.data
    if not wav_data:
        return {'message': 'No audio data provided'}, 400
    
    # Save the audio file to disk
    file_path = '/tmp/audio.wav'
    with open(file_path, 'wb') as audio_file:
        audio_file.write(wav_data)
    print(f'Audio data saved to {file_path}')

    token_count = 0
    try:
        # Open the file again for reading
        with open(file_path, 'rb') as audio_file:
            transcript = client.audio.transcriptions.create(model='whisper-1', file=audio_file)
        token_count = token_counter(transcript.text, model="gpt-4-0125-preview")

    finally:
        os.remove(file_path)
        now = datetime.now()
        month_text = now.strftime('%B')
        day_digit = now.strftime('%d')

        db.collection('recordings').add({
            'transcript': transcript.text,
            'token_count': token_count,
            'created_at': firestore.firestore.SERVER_TIMESTAMP,
            'processed': False,
            'month': month_text,
            'day': day_digit
        })

    return {'message': 'Audio processed successfully', 'token_count': token_count}, 200

