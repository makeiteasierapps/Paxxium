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

        concatenated_transcript += f" {transcript}"
        total_tokens += token_count
        processed_docs.append(doc.reference)

    # Mark documents as processed
    for doc_ref in processed_docs:
        doc_ref.update({'processed': True})

    print(concatenated_transcript)
    
    # Now, concatenated_transcript contains up to 1000 tokens worth of entries.
    # You can send this to OpenAI with your prompt instructions.
    response = client.chat.completions.create(
        model="gpt-4-0125-preview",
        messages=[
            {"role": "system", "content": '''
            These are transcripts contain information about your user. 
            Your task is to organize the information in a way that makes sense to you.
            Your response must be in json format with the three following keys: "corrected_version", "summary", "topics".
            '''},
            {"role": "user", "content": f'''{concatenated_transcript}\n\nGiven the information about the user,
             please provide a corrected version of the transcript, a summary, and the topics discussed\n.
             *** Corrected Version must maintain the same information as the original transcript, but in a more coherent manner.\n
             -- Remove repetive tokens - FOR EXAMPLE: "I am a student. I am a student." should be "I am a student."\n
             -- Check for gramatical errors and spelling mistakes.\n\n
            *** Summary must be a brief overview of the transcript.\n\n
            *** Topics must be a list of topics that were discussed in the transcript.\n\n
             '''}
            ],
        response_format={"type": "json_object"}
    )

    # embeddings = client.embeddings.create(
    #     input=
    #     model="text-embedding-3-small"
    # )
    
    response_data = response.choices[0].message.content
    return response_data

