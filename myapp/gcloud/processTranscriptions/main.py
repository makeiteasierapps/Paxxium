import json
from openai import OpenAI
from firebase_admin import firestore, credentials, initialize_app

cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'paxxiumv1',
})
db = firestore.client()
client = OpenAI()

def process_transcripts(request):
    """
    Retrieves up to 1000 tokens worth of transcript entries in chronological order,
    concatenates them, and sends the result to OpenAI. Marks transcripts as processed.
    """
    docs = db.collection('recordings').where('processed', '==', False).order_by('created_at',).limit(10).stream()
    concatenated_transcript = ''
    total_tokens = 0
    processed_docs = []
    for doc in docs:
        data = doc.to_dict()
        transcript = data.get('transcript', '')
        token_count = data.get('token_count', 0)

        if total_tokens + token_count > 1000:
            break

        concatenated_transcript += transcript
        total_tokens += token_count
        processed_docs.append({'ref': doc.reference, 'transcript': transcript})

    print(concatenated_transcript)
    
    # Now, concatenated_transcript contains up to 1000 tokens worth of entries.
    # You can send this to OpenAI with your prompt instructions.
    response = client.chat.completions.create(
        model="gpt-4-0125-preview",
        messages=[
            {"role": "system", "content": '''
            These transcripts contain information about your user. 
            Your task is to organize the information in a way that makes sense to you.
            Your response must be in json format with the three following keys: "summary", "topics".
            '''},
            {"role": "user", "content": f'''{concatenated_transcript}\n\nGiven the information about the user,
            a summary, and the topics discussed\n.
            *** Summary must be a brief overview of the transcript.\n\n
            *** Topics must be a list of topics that were discussed in the transcript, include topics not mentioned but that relate to the topics discussed.\n\n
             '''}
            ],
        response_format={"type": "json_object"}
    )

    response_data = json.loads(response.model_dump()['choices'][0]['message']['content'])
    print(response_data)

    # Assuming responseData is a dictionary that contains 'summary' and 'topics'
    summary = response_data['summary']
    topics = response_data['topics']

    transcript_and_metadata = {}

    for doc in processed_docs:
        response = client.chat.completions.create(
            model='gpt-4-0125-preview',
            messages=[
                {
                    "role": "system",
                    "content": '''This is a transcript that contains information about your user.\n 
                        Your task is to organize the information in a way that makes sense to you.\n
                        Your response must be in json format with the three following keys: "verbose_version", "topics".'''
                },
                {
                    "role": "user",
                    "content": f'''{doc['transcript']}\n\nGiven the information about the user,
                        provide a verbose version of the transcript, and the topics discussed\n.
                        *** Verbose version must include all the information in the original transcript, but in a more verbose manner.\n
                        *** Topics must be a list of topics that were discussed in the transcript, include topics not mentioned but that relate to the topics discussed.\n\n'''
                }
            ],
            response_format={"type": "json_object"}
        )
        response_data = json.loads(response.model_dump()['choices'][0]['message']['content'])
        print(response_data)

        transcript_and_metadata[doc['ref'].id] = {
            "raw_text": doc['transcript'],
            'verbose_version': response_data['verbose_version'],
            'topics': response_data['topics'],
            "summary": f'This is an summary of the broader conversation so you have more context {summary}',
        }


     
    for id, metadata in transcript_and_metadata.items():
        joined_topics = metadata['topics'] + topics
        topics_str = ', '.join(joined_topics)
        flattened_data = f"Raw Text: {metadata['raw_text']}, Verbose Version: {metadata['verbose_version']}, Topics: {topics_str}, Summary: {metadata['summary']}."

        embeddings_response = client.embeddings.create(
            model='text-embedding-3-small',
            input=flattened_data
        )
        embeddings = embeddings_response.data[0].embedding
        print(embeddings)



    # Mark documents as processed
    for doc in processed_docs:
        doc['ref'].update({'processed': True})

    return response_data, transcript_and_metadata