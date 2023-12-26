from openai import OpenAI
from dotenv import load_dotenv
import os
load_dotenv()
os.getenv('OPENAI_API_KEY')
client = OpenAI()

def generate_image(request):
    prompt = request['prompt']
    size=request['size'].lower()
    quality=request['quality'].lower()
    style=request['style'].lower()
    

    response = client.images.generate(
      model="dall-e-3",
      prompt=prompt,
      n=1,
      size=size,
      quality=quality,
      style=style,
    )

    return response.data[0].url
    

