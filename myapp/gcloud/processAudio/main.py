import requests
from pydub import AudioSegment
from io import BytesIO

from myapp.utils.token_counter import token_counter


def process_audio():
    """
    Takes in wav file from external device. 
    """
    
    wav_data = request.data
    if not wav_data:
        return {'message': 'No audio data provided'}, 400
    
    # Load audio file
    audio_data = BytesIO(request.data)
    audio = AudioSegment.from_file(audio_data, format="wav")

    # Increase the volume by 10 dB
    increased_audio = audio + 10
    new_wav = BytesIO()
    increased_audio.export(new_wav, format="wav")
    new_wav.seek(0)

    headers = {
        'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
        'Content-Type': 'application/json',
    }
    data = {
        'file': new_wav.read(),
        'model': 'whisper-1',
        'language': 'en',  
        'prompt': '',  
    }

    response = requests.post('https://api.openai.com/v1/audio/transcriptions', headers=headers, files=data, timeout=60)

    if response.status_code == 200:
        transcription = response.json()

    count = 0
    transcriptions = []
    while count < 5:
        # concate transcriptions into one text file
        transcriptions.append(transcription)
        count += 1

    transcriptions = ' '.join(transcriptions)

    token_count = token_counter(transcriptions, model="gpt-4-0125-preview")

    return {'message': 'Audio processed successfully', 'token_count': token_count}, 200
    


