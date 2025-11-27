import os
import warnings
import logging

# Suppress specific warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow logs (1=INFO, 2=WARNING, 3=ERROR)
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN optimization messages

# Suppress warnings
warnings.filterwarnings("ignore", module="pydub.utils")
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Configure logging to suppress TensorFlow and other library logs
logging.getLogger('tensorflow').setLevel(logging.ERROR)
logging.getLogger('h5py').setLevel(logging.ERROR)
logging.getLogger('numpy').setLevel(logging.ERROR)

import time
import json
import logging
import numpy as np
from datetime import datetime
import httpx
from flask import Flask, render_template, request, jsonify, send_from_directory, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from typing import List, Dict, Any, Optional, Generator

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Optional imports for RAG (lazy loading to speed up startup)
try:
    from sklearn.neighbors import NearestNeighbors
    from sentence_transformers import SentenceTransformer
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    logger.warning("RAG dependencies not available. RAG features will be disabled.")

from brain_of_the_doctor import encode_image, analyze_image_with_query
from voice_of_the_patient import transcribe_with_groq
from voice_of_the_doctor import text_to_speech_with_gtts, text_to_speech_with_elevenlabs
from database import db
from severity_classifier import severity_classifier
from question_generator import question_generator
from auth_system import auth_system

# Import new feature modules
from session_memory import session_manager
from response_cache import response_cache, symptom_tree
from rash_detector import rash_detector
from positive_messaging import positive_messaging
from weekly_monitor import weekly_monitor
from medicine_suggester import medicine_suggester
from report_generator import report_generator
from question_flow import question_flow
from system_prompt import get_system_prompt, get_personalized_context
from emergency_detection import detect_emergency, get_emergency_guidance
from safety_guardrails import check_safety, validate_medication_info

# ✅ Import REAL AI Dynamic Symptom Engine (Conference-Ready)
from dynamic_symptom_engine import dynamic_engine

# Helper function to determine options for any question
def get_options_for_question(question: str) -> list:
    """Determine appropriate options based on question content"""
    q_lower = question.lower()
    
    # Standard questions
    if 'age' in q_lower and 'your age' in q_lower:
        return ['Under 18', '18-30', '31-45', '46-60', 'Over 60']
    elif 'scale' in q_lower or ('severe' in q_lower and '1-10' in q_lower):
        return ['1-3 (Mild)', '4-6 (Moderate)', '7-10 (Severe)']
    elif 'medication' in q_lower or 'medicine' in q_lower:
        return ['None', 'Paracetamol', 'Ibuprofen', 'Aspirin', 'Other']
    elif 'other symptom' in q_lower:
        return ['Fever', 'Fatigue', 'Body pain', 'Weakness', 'None', 'Other']
    
    # Location/Duration questions
    elif 'where' in q_lower and 'located' in q_lower:
        return ['Forehead', 'One side', 'Back of head', 'Top of head', 'All over']
    elif 'how long' in q_lower:
        if 'cough' in q_lower:
            return ['1-3 days', '4-7 days', '1-2 weeks', 'More than 2 weeks']
        else:
            return ['Less than 1 hour', '1-6 hours', '6-24 hours', '1-3 days', 'More than 3 days']
    elif 'how many days' in q_lower:
        return ['1-2 days', '3-5 days', '6-7 days', 'More than a week']
    
    # Pain/Pattern questions
    elif 'constant' in q_lower or 'comes and goes' in q_lower:
        return ['Constant', 'Comes and goes', 'Pulsating/Throbbing']
    elif 'painful to swallow' in q_lower:
        return ['Very painful', 'Moderately painful', 'Slightly painful', 'No']
    
    # Associated symptoms
    elif 'nausea' in q_lower or 'vomiting' in q_lower:
        return ['Yes, nausea', 'Yes, vomiting', 'Both', 'No']
    elif 'sensitivity' in q_lower and ('light' in q_lower or 'sound' in q_lower):
        return ['Light sensitivity', 'Sound sensitivity', 'Both', 'No']
    elif 'dizziness' in q_lower or 'vision' in q_lower:
        return ['Dizziness', 'Blurred vision', 'Both', 'No']
    elif 'stress' in q_lower or 'sleep' in q_lower:
        return ['Yes, stressed', 'Yes, lack of sleep', 'Both', 'No']
    
    # Respiratory questions
    elif 'dry' in q_lower and 'wet' in q_lower:
        return ['Dry cough', 'Wet cough with phlegm', 'Both types']
    elif 'sore throat' in q_lower:
        return ['Yes', 'No', 'Mild']
    elif 'breathlessness' in q_lower or 'chest tightness' in q_lower:
        return ['Yes, severe', 'Yes, mild', 'No']
    elif 'blocked' in q_lower or 'runny' in q_lower:
        return ['Blocked nose', 'Runny nose', 'Both']
    elif 'sneezing' in q_lower:
        return ['Yes, frequently', 'Yes, occasionally', 'No']
    elif 'watery eyes' in q_lower:
        return ['Yes', 'No']
    elif 'loss of smell' in q_lower or 'loss of taste' in q_lower:
        return ['Yes, complete loss', 'Yes, partial loss', 'No']
    elif 'worse at night' in q_lower or 'during the day' in q_lower:
        return ['Worse at night', 'Worse during day', 'Same all day']
    
    # Fever/Temperature questions
    elif 'temperature' in q_lower or 'how high' in q_lower:
        return ['Below 100°F', '100-102°F', '102-104°F', 'Above 104°F', 'Not measured']
    elif 'chills' in q_lower or 'shivering' in q_lower:
        return ['Yes, severe', 'Yes, mild', 'No']
    
    # Throat questions
    elif 'white patches' in q_lower:
        return ['Yes', 'No', 'Not sure']
    elif 'neck glands' in q_lower or 'swollen glands' in q_lower:
        return ['Yes, very swollen', 'Yes, slightly swollen', 'No']
    
    # History questions
    elif 'similar' in q_lower or 'before' in q_lower:
        return ['Yes, frequently', 'Yes, occasionally', 'First time', 'Not sure']
    
    # Generic fallback
    else:
        return ['Yes', 'No', 'Not sure']

# RAG Configuration
class RAGConfig:
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    VECTOR_DIM = 384
    DOCUMENTS = [
        {"text": "Common cold symptoms include runny nose, sore throat, and cough.", "metadata": {"source": "general_medical"}},
        {"text": "For fever above 102°F, consider taking acetaminophen or ibuprofen.", "metadata": {"source": "medication_guide"}},
        {"text": "COVID-19 symptoms may include fever, cough, and difficulty breathing.", "metadata": {"source": "cdc_guidelines"}}
    ]

# Initialize RAG components lazily
rag_embedder = None
rag_nn = None
_rag_initialized = False

def initialize_rag():
    """Lazy initialization of RAG components"""
    global rag_embedder, rag_nn, _rag_initialized
    
    if _rag_initialized:
        return
    
    try:
        logger.info("Initializing RAG components...")
        rag_embedder = SentenceTransformer(RAGConfig.EMBEDDING_MODEL)
        
        # Encode documents
        document_texts = [doc["text"] for doc in RAGConfig.DOCUMENTS]
        document_embeddings = rag_embedder.encode(document_texts)
        
        # Initialize and fit NearestNeighbors
        rag_nn = NearestNeighbors(n_neighbors=min(3, len(document_texts)), metric='cosine')
        rag_nn.fit(document_embeddings)
        
        _rag_initialized = True
        logger.info(f"Initialized RAG with {len(RAGConfig.DOCUMENTS)} documents")
    except Exception as e:
        logger.error(f"Failed to initialize RAG: {str(e)}")
        rag_embedder = None
        rag_nn = None

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# RAG Utility Functions
def retrieve_relevant_documents(query: str, k: int = 3) -> List[Dict[str, Any]]:
    """Retrieve relevant documents using semantic search"""
    # Initialize RAG on first use
    if not _rag_initialized:
        initialize_rag()
    
    if rag_embedder is None or rag_nn is None:
        logger.warning("RAG not properly initialized")
        return []
    
    try:
        # Encode the query
        query_embedding = rag_embedder.encode([query])
        
        # Find nearest neighbors
        distances, indices = rag_nn.kneighbors(query_embedding)
        
        # Get the most relevant documents
        results = []
        for idx, score in zip(indices[0], distances[0]):
            if 0 <= idx < len(RAGConfig.DOCUMENTS):
                doc = RAGConfig.DOCUMENTS[idx].copy()  # Create a copy to avoid modifying the original
                doc['score'] = float(1.0 - score)  # Convert distance to similarity score
                results.append(doc)
        
        return results
    except Exception as e:
        logger.error(f"Error in retrieve_relevant_documents: {str(e)}")
        return []

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'ok',
            'message': 'Backend is running',
            'timestamp': int(time.time()),
            'version': '1.0.0'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': int(time.time())
        }), 500

# ========== Profile Management Endpoints ==========

@app.route('/api/profile/save', methods=['POST'])
def save_profile():
    """Save or update user profile"""
    try:
        data = request.get_json()
        
        # Extract profile data
        user_id = data.get('user_id', 'guest')  # For now, use guest or session-based ID
        name = data.get('name')
        age = data.get('age')
        gender = data.get('gender')
        weight = data.get('weight')
        height = data.get('height')
        blood_group = data.get('blood_group')
        allergies = data.get('allergies', '')
        conditions = data.get('conditions', '')
        medications = data.get('medications', '')
        injuries = data.get('injuries', '')
        
        # Save to database
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check if profile exists
        cursor.execute('SELECT id FROM user_profiles WHERE user_id = ?', (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing profile
            cursor.execute('''
                UPDATE user_profiles 
                SET name = ?, age = ?, gender = ?, weight_kg = ?, height_cm = ?,
                    blood_group = ?, allergies = ?, chronic_conditions = ?,
                    current_medications = ?, past_injuries = ?, updated_at = ?
                WHERE user_id = ?
            ''', (name, age, gender, weight, height, blood_group, allergies, 
                  conditions, medications, injuries, datetime.now(), user_id))
        else:
            # Insert new profile
            cursor.execute('''
                INSERT INTO user_profiles 
                (user_id, name, age, gender, weight_kg, height_cm, blood_group,
                 allergies, chronic_conditions, current_medications, past_injuries, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, name, age, gender, weight, height, blood_group,
                  allergies, conditions, medications, injuries, datetime.now(), datetime.now()))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Profile saved successfully',
            'user_id': user_id
        }), 200
        
    except Exception as e:
        logger.error(f"Error saving profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile/load', methods=['POST'])
def load_profile():
    """Load user profile"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'guest')
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT name, age, gender, weight_kg, height_cm, blood_group,
                   allergies, chronic_conditions, current_medications, past_injuries
            FROM user_profiles WHERE user_id = ?
        ''', (user_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            profile = {
                'name': row[0],
                'age': row[1],
                'gender': row[2],
                'weight': row[3],
                'height': row[4],
                'blood_group': row[5],
                'allergies': row[6] or '',
                'conditions': row[7] or '',
                'medications': row[8] or '',
                'injuries': row[9] or ''
            }
            return jsonify({
                'success': True,
                'profile': profile
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Profile not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error loading profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/report/download/<int:report_id>', methods=['GET'])
def download_health_report(report_id):
    """Download a health report"""
    try:
        # TODO: Get report from database and send file
        return jsonify({'message': 'Report download endpoint'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/report/list/<int:user_id>', methods=['GET'])
def list_user_reports(user_id):
    """Get all reports for a user"""
    try:
        conn = db.get_connection()
        reports = report_generator.get_user_reports(user_id, conn)
        conn.close()
        
        return jsonify({'reports': reports}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== Medicine Suggestion Endpoints (Module 6) ==========

@app.route('/api/medicine/search', methods=['GET'])
def search_medicine():
    """Search for a specific medicine"""
    try:
        query = request.args.get('q', '')
        
        if not query:
            return jsonify({'error': 'Search query required'}), 400
        
        result = medicine_suggester.search_medicine(query)
        
        if result:
            formatted_info = medicine_suggester.format_medicine_info(result['medicine'])
            return jsonify({
                'found': True,
                'medicine': result['medicine'],
                'category': result['category'],
                'formatted_info': formatted_info,
                'disclaimer': result['disclaimer']
            }), 200
        else:
            return jsonify({'found': False, 'message': 'Medicine not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/medicine/suggest', methods=['POST'])
def suggest_medicines():
    """Get medicine suggestions for a symptom category"""
    try:
        data = request.get_json()
        symptom_category = data.get('category')
        user_age = data.get('age')
        user_allergies = data.get('allergies', [])
        
        if not symptom_category:
            return jsonify({'error': 'Symptom category required'}), 400
        
        suggestions = medicine_suggester.suggest_medicines(
            symptom_category, user_age, user_allergies
        )
        
        formatted_response = medicine_suggester.format_suggestions(suggestions)
        
        return jsonify({
            'suggestions': suggestions,
            'formatted_response': formatted_response
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/medicine/categories', methods=['GET'])
def get_medicine_categories():
    """Get all medicine categories"""
    try:
        categories = medicine_suggester.get_all_categories()
        return jsonify({'categories': categories}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== Question Flow Endpoints (Module 5) ==========

@app.route('/api/flow/start', methods=['POST'])
def start_question_flow():
    """Start an interactive question flow"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        flow_type = data.get('flow_type')  # headache, fever, cough, etc.
        
        if not all([session_id, flow_type]):
            return jsonify({'error': 'Session ID and flow type required'}), 400
        
        first_question = question_flow.start_flow(session_id, flow_type)
        
        if first_question:
            return jsonify({
                'success': True,
                'question': first_question
            }), 200
        else:
            return jsonify({'error': 'Invalid flow type'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/flow/answer', methods=['POST'])
def answer_question():
    """Answer a question in the flow"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        answer = data.get('answer')
        
        if not all([session_id, answer]):
            return jsonify({'error': 'Session ID and answer required'}), 400
        
        result = question_flow.answer_question(session_id, answer)
        
        # Apply positive messaging if flow complete
        if result.get('status') == 'complete':
            analysis = result['result'].get('analysis', {})
            severity = analysis.get('severity', 'mild')
            result['positive_message'] = positive_messaging.reframe_message(
                "Analysis complete!", severity
            )
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/flow/progress/<session_id>', methods=['GET'])
def get_flow_progress(session_id):
    """Get progress of current flow"""
    try:
        progress = question_flow.get_flow_progress(session_id)
        
        if progress:
            return jsonify(progress), 200
        else:
            return jsonify({'message': 'No active flow'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== Cache Management Endpoints (Module 8) ==========

@app.route('/api/cache/stats', methods=['GET'])
def get_cache_stats():
    """Get cache statistics"""
    try:
        stats = response_cache.get_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear response cache"""
    try:
        response_cache.clear_cache()
        return jsonify({'success': True, 'message': 'Cache cleared'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/symptom-trees', methods=['GET'])
def get_symptom_trees():
    """Get pre-loaded symptom trees"""
    try:
        symptoms = symptom_tree.get_all_symptoms()
        return jsonify({'symptoms': symptoms}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/symptom-tree/<symptom>', methods=['GET'])
def get_specific_symptom_tree(symptom):
    """Get specific symptom decision tree"""
    try:
        tree = symptom_tree.get_tree(symptom)
        
        if tree:
            return jsonify({'symptom': symptom, 'tree': tree}), 200
        else:
            return jsonify({'error': 'Symptom tree not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== Positive Messaging Endpoint (Module 7) ==========

@app.route('/api/message/reframe', methods=['POST'])
def reframe_message():
    """Reframe a message with positive tone"""
    try:
        data = request.get_json()
        message = data.get('message')
        severity = data.get('severity', 'mild')
        
        if not message:
            return jsonify({'error': 'Message required'}), 400
        
        reframed = positive_messaging.reframe_message(message, severity)
        
        return jsonify({
            'original': message,
            'reframed': reframed,
            'severity': severity
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== 📄 REPORT GENERATION ENDPOINTS ==========

@app.route('/api/reports/generate', methods=['POST'])
def generate_report():
    """Generate a health report from session data"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'Session ID required'}), 400
        
        # Get session messages
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, metadata, created_at
            FROM messages
            WHERE session_id = ?
            AND role = 'assistant'
            ORDER BY created_at DESC
            LIMIT 1
        ''', (session_id,))
        
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return jsonify({'error': 'No assessment found for this session'}), 404
        
        content = row[0]
        metadata = json.loads(row[1]) if row[1] else {}
        created_at = row[2]
        
        # Generate report data
        report_data = {
            'report_id': f"RPT_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'session_id': session_id,
            'generated_at': datetime.now().isoformat(),
            'symptom': metadata.get('symptom', 'Unknown'),
            'severity': metadata.get('severity', 'Unknown'),
            'age': metadata.get('age', 'Unknown'),
            'analysis': content,
            'created_at': created_at
        }
        
        # Save report to database
        cursor.execute('''
            INSERT INTO reports (report_id, session_id, report_data, created_at)
            VALUES (?, ?, ?, ?)
        ''', (report_data['report_id'], session_id, json.dumps(report_data), datetime.now()))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'report': report_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/list', methods=['GET'])
def list_reports():
    """Get list of all reports"""
    try:
        user_id = request.args.get('user_id', 'guest')
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check if reports table exists, create if not
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_id TEXT UNIQUE NOT NULL,
                session_id TEXT NOT NULL,
                report_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            SELECT report_id, report_data, created_at
            FROM reports
            ORDER BY created_at DESC
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        reports = []
        for row in rows:
            try:
                report_data = json.loads(row[1])
                reports.append({
                    'report_id': row[0],
                    'symptom': report_data.get('symptom', 'Unknown'),
                    'severity': report_data.get('severity', 'Unknown'),
                    'created_at': row[2],
                    'session_id': report_data.get('session_id')
                })
            except:
                continue
        
        return jsonify({
            'success': True,
            'reports': reports,
            'count': len(reports)
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing reports: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/<report_id>', methods=['GET'])
def get_report(report_id):
    """Get a specific report"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT report_data
            FROM reports
            WHERE report_id = ?
        ''', (report_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({'error': 'Report not found'}), 404
        
        report_data = json.loads(row[0])
        
        return jsonify({
            'success': True,
            'report': report_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching report: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ========== 📊 SYMPTOM TRACKING ENDPOINTS ==========

@app.route('/api/symptoms/history', methods=['GET'])
def get_symptom_history():
    """Get symptom history for dashboard"""
    try:
        user_id = request.args.get('user_id', 'guest')
        days = int(request.args.get('days', 30))
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get symptom assessments from the last N days
        cursor.execute('''
            SELECT 
                created_at,
                content,
                metadata
            FROM messages
            WHERE session_id LIKE ? 
            AND role = 'assistant'
            AND content LIKE '%Assessment complete%'
            AND datetime(created_at) >= datetime('now', '-' || ? || ' days')
            ORDER BY created_at DESC
        ''', (f'%session-%', days))
        
        rows = cursor.fetchall()
        conn.close()
        
        symptoms = []
        for row in rows:
            try:
                # Extract symptom info from content
                content = row[1]
                metadata = json.loads(row[2]) if row[2] else {}
                
                symptoms.append({
                    'date': row[0],
                    'symptom': metadata.get('symptom', 'Unknown'),
                    'severity': metadata.get('severity', 'Unknown'),
                    'content': content[:200]  # First 200 chars
                })
            except:
                continue
        
        return jsonify({
            'success': True,
            'symptoms': symptoms,
            'count': len(symptoms)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching symptom history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/symptoms/stats', methods=['GET'])
def get_symptom_stats():
    """Get symptom statistics for dashboard"""
    try:
        user_id = request.args.get('user_id', 'guest')
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get total consultations
        cursor.execute('''
            SELECT COUNT(DISTINCT session_id)
            FROM sessions
            WHERE created_at >= datetime('now', '-30 days')
        ''')
        total_consultations = cursor.fetchone()[0]
        
        # Get total messages
        cursor.execute('''
            SELECT COUNT(*)
            FROM messages
            WHERE created_at >= datetime('now', '-30 days')
        ''')
        total_messages = cursor.fetchone()[0]
        
        # Get recent symptoms (last 7 days)
        cursor.execute('''
            SELECT COUNT(DISTINCT session_id)
            FROM sessions
            WHERE created_at >= datetime('now', '-7 days')
        ''')
        recent_consultations = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_consultations': total_consultations,
                'total_messages': total_messages,
                'recent_consultations': recent_consultations,
                'health_score': 85  # Placeholder - can be calculated based on severity trends
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching symptom stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ========== 🚀 DYNAMIC SYMPTOM ENGINE ENDPOINTS (Conference-Ready AI) ==========

@app.route('/api/dynamic/start', methods=['POST'])
def start_dynamic_assessment():
    """
    🎯 Start AI-powered symptom assessment for ANY symptom
    
    This is REAL AI - works for:
    - Common: headache, fever, cough
    - Uncommon: ear pain, sinus pressure, leg swelling
    - Rare: jaw pain, burning eyes, wound infection
    - ANYTHING a doctor might test with
    """
    try:
        data = request.get_json()
        symptom_text = data.get('symptom')
        session_id = data.get('session_id', 'default-session')
        
        if not symptom_text:
            return jsonify({'error': 'Symptom text required'}), 400
        
        logger.info(f"🚀 Starting dynamic assessment for: {symptom_text}")
        
        # Start assessment with dynamic engine
        result = dynamic_engine.start_symptom_assessment(symptom_text)
        
        if result.get('status') == 'started':
            # Store session data
            session_memory = session_manager.get_memory(session_id)
            session_memory['dynamic_assessment'] = result['session_data']
            
            return jsonify({
                'success': True,
                'status': 'started',
                'symptom': result['symptom'],
                'message': result['message'],
                'question': result['question'],
                'session_id': session_id
            }), 200
        else:
            return jsonify({'error': result.get('message', 'Failed to start assessment')}), 500
            
    except Exception as e:
        logger.error(f"❌ Error starting dynamic assessment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dynamic/answer', methods=['POST'])
def answer_dynamic_question():
    """
    🔄 Process answer and get next question or final analysis
    
    This is the core loop that:
    1. Collects universal answers (4 questions)
    2. AI generates symptom-specific questions (2-3 questions)
    3. AI generates complete medical analysis
    """
    try:
        data = request.get_json()
        answer = data.get('answer')
        session_id = data.get('session_id', 'default-session')
        
        if not answer:
            return jsonify({'error': 'Answer required'}), 400
        
        # Get session data
        session_memory = session_manager.get_memory(session_id)
        session_data = session_memory.get('dynamic_assessment')
        
        if not session_data:
            return jsonify({'error': 'No active assessment found. Please start a new assessment.'}), 400
        
        logger.info(f"📝 Processing answer: {answer}")
        
        # Process answer with dynamic engine
        result = dynamic_engine.process_answer(answer, session_data)
        
        # Update session data
        if 'session_data' in result:
            session_memory['dynamic_assessment'] = result['session_data']
        
        if result.get('status') == 'continue':
            # Return next question
            return jsonify({
                'success': True,
                'status': 'continue',
                'question': result['question'],
                'progress': result.get('progress'),
                'message': result.get('message'),
                'session_id': session_id
            }), 200
            
        elif result.get('status') == 'complete':
            # Assessment complete - return analysis
            logger.info(f"✅ Assessment complete for: {result.get('symptom')}")
            
            # Save to database with metadata
            db.create_session(session_id)
            metadata = json.dumps({
                'symptom': result.get('symptom'),
                'severity': session_data.get('universal_answers', {}).get('severity', 'Unknown'),
                'age': session_data.get('universal_answers', {}).get('age', 'Unknown')
            })
            db.save_message(session_id, 'assistant', result['formatted_response'], None, metadata)
            
            # Auto-generate report
            try:
                report_data = {
                    'report_id': f"RPT_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    'session_id': session_id,
                    'generated_at': datetime.now().isoformat(),
                    'symptom': result.get('symptom'),
                    'severity': session_data.get('universal_answers', {}).get('severity', 'Unknown'),
                    'age': session_data.get('universal_answers', {}).get('age', 'Unknown'),
                    'analysis': result['formatted_response'],
                    'created_at': datetime.now().isoformat()
                }
                
                conn = db.get_connection()
                cursor = conn.cursor()
                
                # Ensure reports table exists
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS reports (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        report_id TEXT UNIQUE NOT NULL,
                        session_id TEXT NOT NULL,
                        report_data TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                cursor.execute('''
                    INSERT INTO reports (report_id, session_id, report_data, created_at)
                    VALUES (?, ?, ?, ?)
                ''', (report_data['report_id'], session_id, json.dumps(report_data), datetime.now()))
                
                conn.commit()
                conn.close()
                
                logger.info(f"✅ Auto-generated report: {report_data['report_id']}")
            except Exception as e:
                logger.error(f"❌ Error auto-generating report: {str(e)}")
            
            # Clear session data
            session_memory.pop('dynamic_assessment', None)
            
            return jsonify({
                'success': True,
                'status': 'complete',
                'symptom': result['symptom'],
                'analysis': result['analysis'],
                'formatted_response': result['formatted_response'],
                'session_id': session_id,
                'report_generated': True
            }), 200
            
        else:
            return jsonify({'error': result.get('message', 'Unknown error')}), 500
            
    except Exception as e:
        logger.error(f"❌ Error processing answer: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dynamic/status', methods=['POST'])
def get_dynamic_status():
    """
    📊 Get current status of dynamic assessment
    """
    try:
        data = request.get_json()
        session_id = data.get('session_id', 'default-session')
        
        session_memory = session_manager.get_memory(session_id)
        session_data = session_memory.get('dynamic_assessment')
        
        if not session_data:
            return jsonify({
                'active': False,
                'message': 'No active assessment'
            }), 200
        
        return jsonify({
            'active': True,
            'symptom': session_data.get('symptom'),
            'phase': session_data.get('phase'),
            'current_question_index': session_data.get('current_question_index'),
            'started_at': session_data.get('started_at')
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting status: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ========== Old Symptom Classifier Endpoints Removed - Now Using Dynamic Engine ==========
# All symptom classification now handled by /api/dynamic/* endpoints

# ========== Simple Symptom Submit Endpoint (6-Step Headache Flow) ==========

@app.route('/symptom/submit', methods=['POST'])
def submit_symptom():
    """Submit completed symptom flow and get recommendations"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['age_range', 'location', 'pain_group', 'taking_medicine', 'other_symptom']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate conditional fields
        if data.get('taking_medicine') == 'Other' and not data.get('taking_medicine_other'):
            return jsonify({'error': 'Please provide the name of the other medicine'}), 400
        if data.get('other_symptom') == 'Other' and not data.get('other_symptom_other'):
            return jsonify({'error': 'Please describe the other symptom'}), 400
        
        # Import helper functions from simple_symptom_flow
        from simple_symptom_flow import detect_possible_cause, build_home_remedies, recommend_medicine, build_warnings, SymptomRequest, AgeRange, PainGroup
        
        # Create request object
        req = SymptomRequest(
            age_range=data['age_range'],
            location=data['location'],
            pain_group=data['pain_group'],
            taking_medicine=data['taking_medicine'],
            taking_medicine_other=data.get('taking_medicine_other'),
            other_symptom=data['other_symptom'],
            other_symptom_other=data.get('other_symptom_other'),
            notes=data.get('notes')
        )
        
        # Generate response
        cause = detect_possible_cause(req)
        remedies = build_home_remedies()
        meds = recommend_medicine(req)
        warns = build_warnings(req)
        
        summary = {
            'possible_cause': cause,
            'home_remedies': remedies,
            'recommended_medicine': meds,
            'warnings': warns,
            'raw': {
                'age_range': req.age_range,
                'location': req.location,
                'pain_group': req.pain_group,
                'taking_medicine': req.taking_medicine,
                'taking_medicine_other': req.taking_medicine_other,
                'other_symptom': req.other_symptom,
                'other_symptom_other': req.other_symptom_other,
                'notes': req.notes
            }
        }
        
        return jsonify(summary), 200
        
    except Exception as e:
        logger.error(f"Error submitting symptom: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Old /api/process endpoint - DEPRECATED (Now using /api/dynamic/* endpoints)
# @app.route('/api/process', methods=['POST'])
# def process_message():
#     """Process incoming chat messages with AI and structured symptom intake"""
    try:
        # Support both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form
            
        message = data.get('message')
        session_id = data.get('session_id', 'default-session')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Check for emergencies first
        from emergency_detection import detect_emergency
        emergency_check = detect_emergency(message)
        if emergency_check['is_emergency']:
            db.create_session(session_id)
            db.save_message(session_id, 'user', message, 'text', None)
            db.save_message(session_id, 'assistant', emergency_check['message'], None, None)
            return jsonify({
                'response': emergency_check['message'],
                'session_id': session_id,
                'is_emergency': True
            }), 200
        
        # Safety check
        safety_check = check_safety(message)
        if not safety_check['safe']:
            db.create_session(session_id)
            db.save_message(session_id, 'user', message, 'text', None)
            db.save_message(session_id, 'assistant', safety_check['message'], None, None)
            return jsonify({
                'response': safety_check['message'],
                'session_id': session_id,
                'is_emergency': False
            }), 200
        
        # Create session
        db.create_session(session_id)
        
        # Try structured symptom classification first
        from symptom_classifier import classify_symptom, format_symptom_summary, create_symptom_intake_response
        
        # Check if we're in the middle of a question flow
        session_memory = session_manager.get_memory(session_id)
        
        if 'current_symptom' in session_memory and 'follow_up_questions' in session_memory:
            # Continue existing question flow
            question_index = session_memory.get('question_index', 0)
            follow_up_questions = session_memory.get('follow_up_questions', [])
            
            # Store the answer
            if question_index > 0:
                if 'answers' not in session_memory:
                    session_memory['answers'] = {}
                prev_question = follow_up_questions[question_index - 1]
                session_memory['answers'][prev_question] = message
            
            # Move to next question
            if question_index < len(follow_up_questions):
                current_question = follow_up_questions[question_index]
                session_memory['question_index'] = question_index + 1
                
                # Determine appropriate options based on question type
                options = []
                q_lower = current_question.lower()
                
                # Standard questions
                if 'age' in q_lower and 'your age' in q_lower:
                    options = ['Under 18', '18-30', '31-45', '46-60', 'Over 60']
                elif 'scale' in q_lower or ('severe' in q_lower and '1-10' in q_lower):
                    options = ['1-3 (Mild)', '4-6 (Moderate)', '7-10 (Severe)']
                elif 'medication' in q_lower or 'medicine' in q_lower:
                    options = ['None', 'Paracetamol', 'Ibuprofen', 'Aspirin', 'Other']
                elif 'other symptom' in q_lower:
                    options = ['Fever', 'Fatigue', 'Body pain', 'Weakness', 'None', 'Other']
                
                # Headache-specific questions
                elif 'where' in q_lower and 'located' in q_lower:
                    options = ['Forehead', 'One side', 'Back of head', 'Top of head', 'All over']
                elif 'how long' in q_lower:
                    options = ['Less than 1 hour', '1-6 hours', '6-24 hours', '1-3 days', 'More than 3 days']
                elif 'constant' in q_lower or 'comes and goes' in q_lower:
                    options = ['Constant', 'Comes and goes', 'Pulsating/Throbbing']
                elif 'nausea' in q_lower or 'vomiting' in q_lower:
                    options = ['Yes, nausea', 'Yes, vomiting', 'Both', 'No']
                elif 'sensitivity' in q_lower and ('light' in q_lower or 'sound' in q_lower):
                    options = ['Light sensitivity', 'Sound sensitivity', 'Both', 'No']
                elif 'dizziness' in q_lower or 'vision' in q_lower:
                    options = ['Dizziness', 'Blurred vision', 'Both', 'No']
                elif 'stress' in q_lower or 'sleep' in q_lower:
                    options = ['Yes, stressed', 'Yes, lack of sleep', 'Both', 'No']
                elif 'similar' in q_lower or 'before' in q_lower:
                    options = ['Yes, frequently', 'Yes, occasionally', 'First time', 'Not sure']
                
                # Generic fallback
                else:
                    options = ['Yes', 'No', 'Not sure']
                
                response_text = f"Thank you. {current_question}"
                
                db.save_message(session_id, 'user', message, 'text', None)
                db.save_message(session_id, 'assistant', response_text, None, None)
                
                return jsonify({
                    'response': response_text,
                    'session_id': session_id,
                    'is_emergency': False,
                    'symptom_detected': True,
                    'question': {
                        'text': current_question,
                        'options': options,
                        'question_number': question_index + 1,
                        'total_questions': len(follow_up_questions)
                    }
                }), 200
            else:
                # All questions answered - generate medicine suggestions
                symptom = session_memory.get('current_symptom', 'your symptoms')
                answers = session_memory.get('answers', {})
                
                # Extract key information from answers
                age = None
                severity = None
                current_meds = None
                other_symptoms = []
                
                for question, answer in answers.items():
                    if 'age' in question.lower():
                        age = answer
                    elif 'scale' in question.lower() or 'severe' in question.lower():
                        severity = answer
                    elif 'medication' in question.lower() or 'medicine' in question.lower():
                        current_meds = answer
                    elif 'other symptom' in question.lower():
                        if answer not in ['None', 'No']:
                            other_symptoms.append(answer)
                
                # Analyze answers to determine possible causes
                possible_causes = []
                home_remedies = []
                medicine_suggestions = []
                warnings = []
                
                if symptom == 'headache':
                    # Determine possible causes based on answers
                    location = None
                    duration = None
                    pattern = None
                    has_nausea = False
                    has_sensitivity = False
                    has_stress = False
                    
                    for question, answer in answers.items():
                        if 'located' in question.lower():
                            location = answer
                        elif 'how long' in question.lower():
                            duration = answer
                        elif 'constant' in question.lower():
                            pattern = answer
                        elif 'nausea' in question.lower():
                            has_nausea = 'yes' in answer.lower() or 'nausea' in answer.lower()
                        elif 'sensitivity' in question.lower():
                            has_sensitivity = 'yes' in answer.lower() or 'sensitivity' in answer.lower()
                        elif 'stress' in question.lower():
                            has_stress = 'yes' in answer.lower() or 'stress' in answer.lower()
                    
                    # Determine possible causes
                    if location and 'one side' in location.lower() and has_nausea and has_sensitivity:
                        possible_causes.append("🔍 **Migraine** - One-sided headache with nausea and light sensitivity")
                    elif has_stress or (pattern and 'constant' in pattern.lower()):
                        possible_causes.append("🔍 **Tension Headache** - Often caused by stress, poor posture, or muscle tension")
                    elif location and 'forehead' in location.lower():
                        possible_causes.append("🔍 **Sinus Headache** - Pressure in forehead area, may be related to sinus congestion")
                    else:
                        possible_causes.append("🔍 **Primary Headache** - Common headache, likely tension-type or mild migraine")
                    
                    # Add home remedies
                    home_remedies.append("🏠 **Rest** - Lie down in a quiet, dark room for 20-30 minutes")
                    home_remedies.append("💧 **Hydration** - Drink 2-3 glasses of water slowly")
                    home_remedies.append("❄️ **Cold Compress** - Apply ice pack wrapped in cloth to forehead for 15 minutes")
                    home_remedies.append("☕ **Caffeine** - A small cup of coffee or tea may help (if not sensitive to caffeine)")
                    home_remedies.append("🧘 **Relaxation** - Practice deep breathing or gentle neck stretches")
                    home_remedies.append("🌿 **Peppermint Oil** - Apply diluted peppermint oil to temples (optional)")
                    
                    # Medicine suggestions based on severity
                    if severity and '1-3' in severity:
                        medicine_suggestions.append("💊 **Paracetamol 500mg** - Take 1 tablet every 6 hours (max 4 tablets/day)")
                        medicine_suggestions.append("💊 **Alternative:** Aspirin 300mg - 1 tablet with water")
                    elif severity and '4-6' in severity:
                        medicine_suggestions.append("💊 **Paracetamol 500mg** - Take 1-2 tablets every 6 hours")
                        medicine_suggestions.append("💊 **Ibuprofen 400mg** - Take 1 tablet with food (if no stomach issues)")
                        medicine_suggestions.append("💊 **Combination:** Paracetamol + Caffeine (like Saridon) - 1 tablet")
                    elif severity and '7-10' in severity:
                        warnings.append("⚠️ **SEVERE HEADACHE** - Requires immediate medical attention")
                        medicine_suggestions.append("💊 Take Paracetamol 500mg while arranging medical care")
                        warnings.append("🚨 **EMERGENCY SIGNS:** Seek immediate help if you have:")
                        warnings.append("   - Sudden severe headache (worst ever)")
                        warnings.append("   - Confusion or difficulty speaking")
                        warnings.append("   - Vision changes or loss")
                        warnings.append("   - Neck stiffness with fever")
                        warnings.append("   - Weakness or numbness")
                    
                    # Age-specific warnings
                    if age and 'Over 60' in age:
                        warnings.append("⚠️ **Age 60+:** Consult doctor before taking NSAIDs (Ibuprofen)")
                        warnings.append("⚠️ New or severe headaches in older adults need medical evaluation")
                    elif age and 'Under 18' in age:
                        warnings.append("⚠️ **Under 18:** Use age-appropriate dosages, consult pharmacist")
                    
                    # Check for drug interactions
                    if current_meds and current_meds not in ['None', 'No']:
                        warnings.append(f"⚠️ **Drug Interaction Alert:** You're taking {current_meds}")
                        warnings.append("   Check with pharmacist before taking additional medicines")
                
                # Build comprehensive response
                response_parts = [
                    f"Thank you for providing all the information about your {symptom}. Here's my analysis:",
                    f"\n📋 **Your Information:**",
                    f"- Age: {age or 'Not specified'}",
                    f"- Severity: {severity or 'Not specified'}",
                    f"- Current medications: {current_meds or 'None'}",
                ]
                
                if other_symptoms:
                    response_parts.append(f"- Other symptoms: {', '.join(other_symptoms)}")
                
                # Add possible causes
                if possible_causes:
                    response_parts.append(f"\n🔍 **Possible Causes:**")
                    response_parts.extend(possible_causes)
                
                # Add home remedies
                if home_remedies:
                    response_parts.append(f"\n🏠 **Home Remedies (Try These First):**")
                    response_parts.extend(home_remedies)
                
                # Add medicine suggestions
                if medicine_suggestions:
                    response_parts.append(f"\n💊 **Medicine Suggestions:**")
                    response_parts.extend(medicine_suggestions)
                
                # Add warnings
                if warnings:
                    response_parts.append(f"\n⚠️ **Important Warnings:**")
                    response_parts.extend(warnings)
                
                # Add general advice
                response_parts.append(f"\n⚕️ **Medical Advice:**")
                response_parts.append("- If headache persists beyond 24-48 hours, consult a doctor")
                response_parts.append("- Keep a headache diary to track patterns and triggers")
                response_parts.append("- Maintain regular sleep schedule and stay hydrated")
                response_parts.append("- This is general information only - consult healthcare professional for personalized treatment")
                
                response_text = "\n".join(response_parts)
                
                # Clear the question flow
                session_memory.pop('current_symptom', None)
                session_memory.pop('follow_up_questions', None)
                session_memory.pop('question_index', None)
                
                db.save_message(session_id, 'user', message, 'text', None)
                db.save_message(session_id, 'assistant', response_text, None, None)
                
                return jsonify({
                    'response': response_text,
                    'session_id': session_id,
                    'is_emergency': False,
                    'symptom_detected': False,
                    'summary': {
                        'symptom': symptom,
                        'age': age,
                        'severity': severity,
                        'current_medications': current_meds,
                        'other_symptoms': other_symptoms,
                        'possible_causes': possible_causes,
                        'home_remedies': home_remedies,
                        'medicine_suggestions': medicine_suggestions,
                        'warnings': warnings
                    }
                }), 200
        
        # New symptom detection
        classification = classify_symptom(message)
        
        # If symptom detected, start question flow
        if classification.get('status') == 'success':
            # Initialize question flow in session memory
            session_manager.add_symptom(session_id, {
                'symptom': classification['primary_symptom'],
                'severity': classification['severity'],
                'category': classification['category'],
                'timestamp': datetime.now().isoformat()
            })
            
            # Store question flow
            follow_up_questions = classification.get('follow_up_questions', [])
            session_memory['current_symptom'] = classification['primary_symptom']
            session_memory['follow_up_questions'] = follow_up_questions
            session_memory['question_index'] = 1  # Start at 1 since we're asking the first question now
            session_memory['answers'] = {}
            
            # Get first question
            if follow_up_questions:
                first_question = follow_up_questions[0]
                
                # Determine appropriate options based on question type
                options = []
                q_lower = first_question.lower()
                
                # Standard questions
                if 'age' in q_lower and 'your age' in q_lower:
                    options = ['Under 18', '18-30', '31-45', '46-60', 'Over 60']
                elif 'scale' in q_lower or ('severe' in q_lower and '1-10' in q_lower):
                    options = ['1-3 (Mild)', '4-6 (Moderate)', '7-10 (Severe)']
                elif 'medication' in q_lower or 'medicine' in q_lower:
                    options = ['None', 'Paracetamol', 'Ibuprofen', 'Aspirin', 'Other']
                elif 'other symptom' in q_lower:
                    options = ['Fever', 'Fatigue', 'Body pain', 'Weakness', 'None', 'Other']
                
                # Headache-specific questions
                elif 'where' in q_lower and 'located' in q_lower:
                    options = ['Forehead', 'One side', 'Back of head', 'Top of head', 'All over']
                elif 'how long' in q_lower:
                    options = ['Less than 1 hour', '1-6 hours', '6-24 hours', '1-3 days', 'More than 3 days']
                elif 'constant' in q_lower or 'comes and goes' in q_lower:
                    options = ['Constant', 'Comes and goes', 'Pulsating/Throbbing']
                elif 'nausea' in q_lower or 'vomiting' in q_lower:
                    options = ['Yes, nausea', 'Yes, vomiting', 'Both', 'No']
                elif 'sensitivity' in q_lower and ('light' in q_lower or 'sound' in q_lower):
                    options = ['Light sensitivity', 'Sound sensitivity', 'Both', 'No']
                elif 'dizziness' in q_lower or 'vision' in q_lower:
                    options = ['Dizziness', 'Blurred vision', 'Both', 'No']
                elif 'stress' in q_lower or 'sleep' in q_lower:
                    options = ['Yes, stressed', 'Yes, lack of sleep', 'Both', 'No']
                elif 'similar' in q_lower or 'before' in q_lower:
                    options = ['Yes, frequently', 'Yes, occasionally', 'First time', 'Not sure']
                
                # Generic fallback
                else:
                    options = ['Yes', 'No', 'Not sure']
                
                response_text = f"I understand you're experiencing {classification['primary_symptom']}. Let me ask you a few questions to better understand your condition.\n\n{first_question}"
            else:
                response_text = f"I understand you're experiencing {classification['primary_symptom']}. Can you tell me more about it?"
                options = []
            
            # Save messages
            db.save_message(session_id, 'user', message, 'text', None)
            db.save_message(session_id, 'assistant', response_text, None, None)
            
            return jsonify({
                'response': response_text,
                'session_id': session_id,
                'is_emergency': False,
                'symptom_detected': True,
                'classification': classification,
                'question': {
                    'text': follow_up_questions[0] if follow_up_questions else None,
                    'options': options,
                    'question_number': 1,
                    'total_questions': len(follow_up_questions)
                }
            }), 200
        
        # If no symptom detected, use regular AI chat
        # Get system prompt and build context
        system_prompt = get_system_prompt()
        
        # Get recent conversation history
        history = db.get_session_history(session_id, limit=10)
        
        # Build conversation context
        conversation_context = ""
        for msg in history[-5:]:  # Last 5 messages
            role = "Patient" if msg['role'] == 'user' else "MediChat"
            conversation_context += f"{role}: {msg['content']}\n"
        
        # Add current message
        conversation_context += f"Patient: {message}\n"
        
        # Combine system prompt with conversation
        full_prompt = f"{system_prompt}\n\nCONVERSATION:\n{conversation_context}\n\nMediChat:"
        
        # Get AI response
        from brain_of_the_doctor import analyze_image_with_query
        ai_response = analyze_image_with_query(
            query=message,
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            encoded_image=None,
            system_prompt=system_prompt
        )
        
        # Save messages to database
        db.save_message(session_id, 'user', message, 'text', None)
        db.save_message(session_id, 'assistant', ai_response, None, None)
        
        # Return response
        return jsonify({
            'response': ai_response,
            'session_id': session_id,
            'is_emergency': False,
            'symptom_detected': False
        }), 200
        
    except Exception as e:
        error_msg = f"Error processing message: {str(e)}"
        logger.error(error_msg)
        import traceback
        trace = traceback.format_exc()
        logger.error(trace)
        
        # Also write to file for debugging
        try:
            with open('error_log.txt', 'a') as f:
                f.write(f"\n{'='*50}\n")
                f.write(f"Time: {datetime.now()}\n")
                f.write(f"Error: {error_msg}\n")
                f.write(f"Traceback:\n{trace}\n")
        except:
            pass
        
        return jsonify({'error': 'Internal server error'}), 500

print("✅ All feature module endpoints loaded successfully!")


if __name__ == '__main__':
    logger.info("Starting Flask server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
