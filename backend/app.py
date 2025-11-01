import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

load_dotenv()

from brain_of_the_doctor import encode_image, analyze_image_with_query
from voice_of_the_patient import transcribe_with_groq
from voice_of_the_doctor import text_to_speech_with_gtts, text_to_speech_with_elevenlabs

app = Flask(__name__, static_folder='static', static_url_path='')

# Configure CORS to allow requests from Next.js frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Store chat history (in production, use database or session storage)
chat_sessions = {}

# System prompt for the AI doctor
SYSTEM_PROMPT = """You are MediChat – a professional medical AI health assistant. Your job is to help users by analyzing symptoms, medications, health questions, images, and voice input.

✅ CORE ABILITIES:

1. Accept symptoms from:
   - Text input
   - Voice-to-text input
   - User-uploaded images (skin issues, wounds, rashes)
   - Multiple symptoms combined together

2. Provide comprehensive health guidance:
   - Possible causes / conditions
   - Personalized daily routine
   - Diet and nutrition suggestions
   - Do's and Don'ts for their condition
   - Simple exercises or stretches (if safe)
   - Water intake and sleep recommendations
   - Preventive care tips
   - When to see a doctor
   - Emergency red-flag warnings
   - Home remedies and OTC medicines

3. Medication Information:
   - Dosage guidance (general non-prescription info)
   - Side effects & interactions
   - Who should NOT take the medicine
   - Safer alternatives when applicable

✅ PERSONALIZATION:
   - If user provides age, gender, or symptoms, personalize the plan
   - Tailor diet, routine, and exercises to their specific situation
   - Consider their lifestyle and capabilities

✅ RESPONSE FORMAT (for health advice, always follow this structure):

1. **Summary of the Issue**
   - Brief understanding of their condition

2. **Diet Plan**
   - Morning: What to eat/drink
   - Afternoon: Meal suggestions
   - Night: Dinner recommendations
   - Foods to avoid

3. **Daily Routine Schedule**
   - Wake-up time and morning routine
   - Afternoon activities
   - Evening routine
   - Sleep schedule
   - Water intake recommendations

4. **Exercises / Activities**
   - Safe exercises or stretches
   - Duration and frequency
   - Activities to avoid
   - Rest periods

5. **Home Remedies** (if safe)
   - Natural remedies
   - Self-care tips
   - Do's and Don'ts

6. **Warning Signs - When to See a Doctor**
   - Red flags to watch for
   - Emergency symptoms
   - When to seek immediate medical help

✅ RESPONSE STYLE:
   - Keep language simple and clear
   - Use short paragraphs and bullet points
   - No fear-creating words
   - No actual prescriptions – only guidance
   - Always include: "If symptoms worsen, consult a doctor."

✅ IMAGE ANALYSIS:
   - If the user uploads an image (rash, wound, swelling, acne), analyze visible signs and provide possibilities
   - Do not claim guaranteed diagnosis, only probabilities

✅ VOICE INPUT:
   - If user speaks, transcribe and respond normally

✅ SYMPTOM COMBINATION:
   If user enters multiple symptoms, analyze them together.
   Example: Headache + fever + body aches → possible flu, dengue, viral infection

✅ LANGUAGE SUPPORT:
   - Detect user language automatically (Kannada, Hindi, English, or any other)
   - Reply in same language
   - If user requests a different language, switch immediately

✅ SAFETY RULES:
   - No guaranteed diagnosis or prescriptions
   - No harmful recommendations
   - If serious symptoms – suggest urgent medical help
   - Avoid giving strict medical diagnosis; give guidance only

IMPORTANT: Respond as a knowledgeable health assistant. Always match the user's language automatically. Provide comprehensive, personalized health guidance following the 6-point format above."""

@app.route('/api/process', methods=['POST'])
def process_api():
    """
    Unified endpoint that handles all input types:
    - Text only
    - Image only
    - Voice only
    - Mixed (Image + Text, Voice + Text, Image + Voice, etc.)
    
    Automatically detects input type and language, maintains chat history
    """
    try:
        # Extract all possible inputs
        text_message = request.form.get('message', '').strip()
        image_file = request.files.get('image')
        audio_file = request.files.get('audio')
        session_id = request.form.get('session_id', 'default')
        
        # Initialize session history if not exists
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
        
        # Variables to store processed data
        transcription = None
        encoded_image = None
        query_text = ""
        input_type = []
        
        # Process voice input if present
        if audio_file:
            input_type.append("voice")
            filename = secure_filename('voice_input.wav')
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            audio_file.save(filepath)
            
            transcription = transcribe_with_groq(
                GROQ_API_KEY=os.environ.get("GROQ_API_KEY"),
                audio_filepath=filepath,
                stt_model="whisper-large-v3"
            )
            query_text += transcription + " "
        
        # Add text message if present
        if text_message:
            input_type.append("text")
            query_text += text_message + " "
        
        # Process image if present
        if image_file:
            input_type.append("image")
            filename = secure_filename(image_file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image_file.save(filepath)
            encoded_image = encode_image(filepath)
        
        # Build the query based on what we have
        if not query_text and not encoded_image:
            return jsonify({'error': 'No input provided'}), 400
        
        # Build context from chat history (last 5 messages)
        context = ""
        if len(chat_sessions[session_id]) > 0:
            context = "\n\nPrevious conversation context:\n"
            for msg in chat_sessions[session_id][-5:]:
                context += f"User: {msg['user']}\nAssistant: {msg['assistant']}\n"
        
        # Build final query with context
        if encoded_image and not query_text:
            final_query = SYSTEM_PROMPT + context + "\n\nUser sent an image. Analyze this medical image and provide a detailed assessment."
        else:
            final_query = SYSTEM_PROMPT + context + "\n\nUser query: " + query_text.strip()
        
        # Analyze with AI
        response = analyze_image_with_query(
            query=final_query,
            encoded_image=encoded_image,
            model="meta-llama/llama-4-scout-17b-16e-instruct"
        )
        
        # Store in chat history
        chat_sessions[session_id].append({
            'user': query_text.strip() or "[image]",
            'assistant': response,
            'input_type': input_type
        })
        
        # Keep only last 20 messages to prevent memory issues
        if len(chat_sessions[session_id]) > 20:
            chat_sessions[session_id] = chat_sessions[session_id][-20:]
        
        # Generate audio response
        try:
            audio_path = text_to_speech_with_elevenlabs(
                input_text=response, 
                output_filepath="static/response.mp3"
            )
        except:
            audio_path = text_to_speech_with_gtts(
                input_text=response, 
                output_filepath="static/response.mp3"
            )
        
        return jsonify({
            'transcription': transcription,
            'response': response,
            'audio_url': '/response.mp3',
            'input_type': input_type
        })
    
    except Exception as e:
        print(f"Error in process_api: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
