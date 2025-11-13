import os
import time
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

load_dotenv()

from brain_of_the_doctor import encode_image, analyze_image_with_query
from voice_of_the_patient import transcribe_with_groq
from voice_of_the_doctor import text_to_speech_with_gtts, text_to_speech_with_elevenlabs
from database import db
from severity_classifier import severity_classifier
from question_generator import question_generator

app = Flask(__name__, static_folder='static', static_url_path='')

# Configure CORS to allow requests from Next.js frontend
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",  # Alternative port
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Store chat history (in production, use database or session storage)
chat_sessions = {}

# System prompt
SYSTEM_PROMPT = """You are MediChat, a professional medical AI assistant. Analyze symptoms and provide comprehensive medical guidance.

IMPORTANT: Read the full conversation history to understand what information you already have.

YOUR TASK:
1. Review what the user has told you so far
2. If you have enough info (symptoms + severity/duration), provide the FULL SUMMARY immediately
3. If critical info is missing, ask ALL missing info in ONE combined question

WHEN ASKING QUESTIONS:
- Combine multiple questions into ONE sentence
- Example: "On a scale of 1-10, how severe is it, when did it start, and are you taking any medications?"
- Ask about: severity (1-10 scale), timing (when started), other symptoms, current medications
- Keep it conversational and brief

PROVIDE FULL SUMMARY when you know:
- What the symptoms are
- How severe they are (or how long they've lasted)

SUMMARY FORMAT:
**DIAGNOSIS SUMMARY:**
Condition: [Most likely condition]
Severity: [Mild/Moderate/Severe]

**RECOMMENDED MEDICATIONS:**
• Primary: [Medicine name, dosage, frequency, duration]
• Alternative: [If primary not available]

**LIFESTYLE RECOMMENDATIONS:**
• [3-4 specific recommendations for diet, rest, activities]

**WARNING SIGNS - Seek immediate care if:**
• [List red flag symptoms]

**FOLLOW-UP:**
• See doctor if: [conditions]
• Expected recovery: [timeline]

Be efficient: combine questions. Be detailed in summaries."""

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify backend is running
    Returns server status and basic information
    """
    import time
    return jsonify({
        'status': 'ok',
        'message': 'MediChat backend is running',
        'timestamp': int(time.time() * 1000),
        'version': '1.0.0'
    }), 200

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
    start_time = time.time()
    
    try:
        # Extract all possible inputs
        text_message = request.form.get('message', '').strip()
        image_file = request.files.get('image')
        audio_file = request.files.get('audio')
        session_id = request.form.get('session_id', 'default')
        
        # Create session in database
        db.create_session(session_id)
        
        # Initialize session history if not exists
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
        
        # Variables to store processed data
        transcription = None
        encoded_image = None
        query_text = ""
        input_type = []
        severity_info = None
        
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
        
        # Disable automatic severity classification
        severity_level = 'UNKNOWN'
        severity_score = 0
        matched_keywords = []
        severity_info = None
        
        # Save user message to database without severity
        db.save_message(session_id, 'user', query_text.strip() or "[image]", 
                       ','.join(input_type), None)
        
        # Extract and save symptoms automatically (only if text is provided)
        if query_text:
            symptom_keywords = ['pain', 'ache', 'fever', 'cough', 'headache', 'nausea', 'vomit', 
                               'diarrhea', 'constipation', 'dizzy', 'fatigue', 'tired', 'weak',
                               'sore', 'swelling', 'rash', 'itch', 'burn', 'bleed', 'hurt']
            query_lower = query_text.lower()
            for keyword in symptom_keywords:
                if keyword in query_lower:
                    # Extract severity if mentioned
                    severity = None
                    if any(word in query_lower for word in ['severe', 'bad', 'terrible', 'worst']):
                        severity = 'severe'
                    elif any(word in query_lower for word in ['mild', 'slight', 'little']):
                        severity = 'mild'
                    elif any(word in query_lower for word in ['moderate', 'medium']):
                        severity = 'moderate'
                    
                    db.save_symptom(session_id, keyword, severity)
                    break  # Only save primary symptom
        
        # Get full conversation context - NEED THIS TO UNDERSTAND REPLIES
        history = db.get_session_history(session_id, limit=10)
        
        # Get session memory (past symptoms, diagnoses, medications)
        try:
            session_memory = db.get_session_memory(session_id)
        except Exception as e:
            print(f"Error getting session memory: {e}")
            session_memory = {'has_history': False}
        
        # Build session memory context if user has history
        memory_context = ""
        if session_memory.get('has_history'):
            memory_context = "\n\nPATIENT MEDICAL HISTORY (from this session):\n"
            
            # Add past symptoms
            if session_memory.get('past_symptoms'):
                memory_context += "Previous Symptoms:\n"
                for symptom in session_memory['past_symptoms'][:5]:  # Last 5 symptoms
                    memory_context += f"  • {symptom['symptom']}"
                    if symptom.get('severity'):
                        memory_context += f" (severity: {symptom['severity']})"
                    memory_context += f" - reported {symptom['when']}\n"
            
            # Add past diagnoses
            if session_memory.get('past_diagnoses'):
                memory_context += "\nPrevious Diagnoses:\n"
                for diagnosis in session_memory['past_diagnoses'][:2]:  # Last 2 diagnoses
                    # Extract just the condition line from summary
                    summary = diagnosis['summary']
                    if 'Condition:' in summary:
                        condition_line = summary.split('Condition:')[1].split('\n')[0].strip()
                        memory_context += f"  • {condition_line} - diagnosed {diagnosis['when']}\n"
            
            # Add mentioned medications
            if session_memory.get('mentioned_medications'):
                memory_context += "\nMedications Mentioned:\n"
                for med in session_memory['mentioned_medications'][:3]:  # Last 3 mentions
                    memory_context += f"  • {med['message'][:100]}...\n"
            
            memory_context += "\nIMPORTANT: Consider this history when providing advice. If this is a follow-up about a previous condition, acknowledge it.\n"
        
        # Build conversation context for AI
        conversation_context = memory_context + "\n\nCURRENT CONVERSATION:\n"
        for msg in history:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role == 'user':
                conversation_context += f"Patient: {content}\n"
            else:
                conversation_context += f"You: {content}\n"
        
        # Add current message
        conversation_context += f"Patient: {query_text.strip()}\n"
        
        # Analyze what info we have
        missing_info = question_generator.get_missing_info(query_text, history)
        
        # Count conversation turns
        turn_count = len([m for m in history if m.get('role') == 'user'])
        
        # Determine if we should generate summary
        has_symptoms = len(query_text) > 10
        has_severity = missing_info.get('severity')
        has_duration = missing_info.get('duration') or missing_info.get('onset_time')
        
        # Build instruction based on completeness
        if (has_symptoms and (has_severity or has_duration)) or turn_count >= 2:
            instruction = "\n\nYou have enough information. Provide the COMPLETE MEDICAL SUMMARY now using the format above."
        else:
            # List what's missing
            missing_items = []
            if not missing_info.get('severity'):
                missing_items.append("severity (1-10 scale)")
            if not missing_info.get('onset_time') and not missing_info.get('duration'):
                missing_items.append("when it started")
            if not missing_info.get('medications'):
                missing_items.append("any medications you're taking")
            if not missing_info.get('associated_symptoms'):
                missing_items.append("any other symptoms")
            
            if missing_items:
                missing_str = ", ".join(missing_items)
                instruction = f"\n\nAsk about these in ONE combined question: {missing_str}. Keep it conversational."
            else:
                instruction = "\n\nAsk ONE brief question to clarify the symptoms."
        
        # Build final query
        if encoded_image and not query_text:
            final_query = SYSTEM_PROMPT + conversation_context + "\n\nImage received. Describe what you see and ask about symptoms."
        else:
            final_query = SYSTEM_PROMPT + conversation_context + instruction
        
        # Analyze with AI
        response = analyze_image_with_query(
            query=final_query,
            encoded_image=encoded_image,
            model="meta-llama/llama-4-scout-17b-16e-instruct"
        )
        
        # No automatic severity warnings
        
        # Save assistant response to database
        db.save_message(session_id, 'assistant', response, None, None)
        
        # Store in chat history (memory)
        chat_sessions[session_id].append({
            'user': query_text.strip() or "[image]",
            'assistant': response,
            'input_type': input_type,
            'severity': severity_level
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
        
        # Calculate response time
        response_time = time.time() - start_time
        
        # Save ML metrics
        db.save_ml_metric('response_time', response_time, response_time, None)
        db.save_ml_metric('query_processed', 1, response_time, None)
        
        return jsonify({
            'transcription': transcription,
            'response': response,
            'audio_url': '/response.mp3',
            'input_type': input_type,
            'severity': severity_info,
            'response_time': round(response_time, 3)
        })
    
    except Exception as e:
        print(f"Error in process_api: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Get ML performance metrics"""
    try:
        metrics = db.get_ml_metrics_summary()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health-trends/<session_id>', methods=['GET'])
def get_health_trends(session_id):
    """Get health trends for continuous monitoring"""
    try:
        trends = db.get_health_trends(session_id)
        symptoms_history = db.get_symptoms_history(session_id)
        
        return jsonify({
            'trends': trends,
            'symptoms_history': symptoms_history
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/session-history/<session_id>', methods=['GET'])
def get_session_history(session_id):
    """Get complete session history"""
    try:
        history = db.get_session_history(session_id, limit=50)
        return jsonify({'history': history}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    """Analyze multiple symptoms for severity"""
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        
        if not symptoms:
            return jsonify({'error': 'No symptoms provided'}), 400
        
        analysis = severity_classifier.analyze_symptom_combination(symptoms)
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
