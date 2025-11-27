# if you dont use pipenv uncomment the following:
# from dotenv import load_dotenv
# load_dotenv()

#Step1: Setup GROQ API key
import os

GROQ_API_KEY=os.environ.get("GROQ_API_KEY")

#Step2: Convert image to required format
import base64


#image_path="acne.jpg"

def encode_image(image_path):   
    image_file=open(image_path, "rb")
    return base64.b64encode(image_file.read()).decode('utf-8')

#Step3: Setup Multimodal LLM 
from groq import Groq

query="Is there something wrong with my face?"
#model = "meta-llama/llama-4-maverick-17b-128e-instruct"
model="meta-llama/llama-4-scout-17b-16e-instruct"
#model = "meta-llama/llama-4-scout-17b-16e-instruct"
#model="llama-3.2-90b-vision-preview" #Deprecated

def analyze_image_with_query(query, model, encoded_image=None, system_prompt=None):
    """
    Analyze image and/or text query using Groq's multimodal LLM
    
    Args:
        query: The user's question or the full prompt (if no system_prompt provided)
        model: The model to use
        encoded_image: Base64 encoded image (optional)
        system_prompt: System instructions (optional, recommended for proper AI behavior)
    
    Returns:
        AI response text
    """
    client=Groq()
    
    # If system_prompt is provided, separate system and user messages
    # Otherwise, treat query as the full prompt (backward compatibility)
    if system_prompt:
        # Extract user message from query (everything after system prompt)
        user_message = query.replace(system_prompt, "").strip()
        
        # Build messages with proper system/user separation
        messages = [
            {
                "role": "system",
                "content": system_prompt
            }
        ]
        
        # Build user content based on whether image is provided
        if encoded_image:
            user_content = [
                {
                    "type": "text", 
                    "text": user_message
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{encoded_image}",
                    },
                },
            ]
        else:
            user_content = user_message
        
        messages.append({
            "role": "user",
            "content": user_content
        })
    else:
        # Legacy mode: treat query as full prompt
        if encoded_image:
            content = [
                {
                    "type": "text", 
                    "text": query
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{encoded_image}",
                    },
                },
            ]
        else:
            content = [
                {
                    "type": "text", 
                    "text": query
                }
            ]
        
        messages = [
            {
                "role": "user",
                "content": content,
            }
        ]
    
    chat_completion=client.chat.completions.create(
        messages=messages,
        model=model
    )

    return chat_completion.choices[0].message.content
