from openai import OpenAI
import os
from firebase_admin import firestore, credentials, initialize_app
from datetime import datetime

from token_counter import token_counter

cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'paxxiumv1',
})
db = firestore.client()
client = OpenAI()

def process_audio(request):
    """
    Takes in wav file from external device. 
    """
    counter = 0
    wav_data = request.data
    if not wav_data:
        return {'message': 'No audio data provided'}, 400
    
    # Save the audio file to disk
    file_path = '/tmp/audio.wav'
    with open(file_path, 'wb') as audio_file:
        audio_file.write(wav_data)
    print(f'Audio data saved to {file_path}')

    try:
        # Open the file again for reading
        with open(file_path, 'rb') as audio_file:
            transcript = client.audio.transcriptions.create(model='whisper-1', file=audio_file)
        print('transcript', transcript)

        # Assuming token_counter function can handle the transcript text directly
        token_count = token_counter(transcript.text, model="gpt-4-0125-preview")
        print('token_count', token_count)

    finally:
        # Delete the file after processing
        os.remove(file_path)
        print(f'File {file_path} has been deleted')
        now = datetime.now()
        path = f"recordings/{now.strftime('%Y-%m')}/{now.strftime('%d')}/{now.strftime('%H%M%S')}"
        
        db.document(path).set({
            'transcript': transcript.text,
            'token_count': token_count,
            'created_at': firestore.firestore.SERVER_TIMESTAMP
        })

        counter += 1
        print(f'Counter: {counter}')

    return {'message': 'Audio processed successfully', 'token_count': token_count}, 200

