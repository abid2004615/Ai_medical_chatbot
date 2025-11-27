"""
Database module for storing chat history, user sessions, and health metrics
"""
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

class MediChatDatabase:
    def __init__(self, db_path: str = "medichat.db"):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users/Sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Chat messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                input_type TEXT,
                severity_level TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        ''')
        
        # Symptoms tracking table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS symptoms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                symptom_name TEXT NOT NULL,
                severity TEXT,
                reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        ''')
        
        # Health metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS health_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                metric_type TEXT NOT NULL,
                metric_value REAL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        ''')
        
        # ML metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ml_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                response_time REAL,
                accuracy_score REAL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # User Profiles table (Mini EHR)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                name TEXT,
                age INTEGER,
                gender TEXT,
                blood_group TEXT,
                weight_kg REAL,
                height_cm REAL,
                bmi REAL,
                phone TEXT,
                email TEXT,
                emergency_contact TEXT,
                allergies TEXT,
                chronic_conditions TEXT,
                current_medications TEXT,
                past_injuries TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Allergies table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_allergies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                allergy_type TEXT NOT NULL,
                allergy_name TEXT NOT NULL,
                severity TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
            )
        ''')
        
        # Chronic Conditions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_chronic_conditions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                condition_name TEXT NOT NULL,
                diagnosed_date TEXT,
                severity TEXT,
                notes TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
            )
        ''')
        
        # Current Medications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_medications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                medication_name TEXT NOT NULL,
                dosage TEXT,
                frequency TEXT,
                started_date TEXT,
                purpose TEXT,
                is_active BOOLEAN DEFAULT 1,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
            )
        ''')
        
        # Past Injuries table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_injuries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                injury_type TEXT NOT NULL,
                injury_date TEXT,
                treatment TEXT,
                recovery_status TEXT,
                notes TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
            )
        ''')
        
        # Medical History table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_medical_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                condition TEXT NOT NULL,
                diagnosed_on TEXT,
                severity TEXT,
                medications_used TEXT,
                outcome TEXT,
                notes TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
            )
        ''')
        
        # Symptom History table (detailed tracking)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_symptom_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                session_id TEXT,
                symptom_name TEXT NOT NULL,
                symptom_date TEXT,
                duration_days INTEGER,
                severity_score INTEGER,
                diagnosis TEXT,
                treatment_given TEXT,
                outcome TEXT,
                notes TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
            )
        ''')
        
        # Doctor Notes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS doctor_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                session_id TEXT,
                note_text TEXT NOT NULL,
                note_type TEXT,
                created_by TEXT DEFAULT 'AI',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
            )
        ''')
        
        # Session Memory table (Module 9)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS session_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                user_id TEXT,
                data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Symptom History table (Module 2 enhancement)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS symptom_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                symptom_name TEXT NOT NULL,
                severity TEXT,
                date_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved BOOLEAN DEFAULT 0,
                notes TEXT
            )
        ''')
        
        # Weekly Check-ins table (Module 3)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS weekly_checkins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                checkin_date DATE NOT NULL,
                health_score INTEGER,
                new_symptoms TEXT,
                symptom_changes TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Health Reports table (Module 4)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS health_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                report_data TEXT NOT NULL,
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_path TEXT
            )
        ''')
        
        # Users table for authentication
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                age INTEGER,
                gender TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # User sessions table for authentication
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_token TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_session(self, session_id: str):
        """Create a new session"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT OR IGNORE INTO sessions (session_id) VALUES (?)',
            (session_id,)
        )
        conn.commit()
        conn.close()
    
    def save_message(self, session_id: str, role: str, content: str, 
                    input_type: str = None, severity_level: str = None):
        """Save a chat message"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO messages (session_id, role, content, input_type, severity_level)
            VALUES (?, ?, ?, ?, ?)
        ''', (session_id, role, content, input_type, severity_level))
        conn.commit()
        conn.close()
    
    def get_session_history(self, session_id: str, limit: int = 20) -> List[Dict]:
        """Get chat history for a session"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT role, content, input_type, severity_level, timestamp
            FROM messages
            WHERE session_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (session_id, limit))
        
        messages = []
        for row in cursor.fetchall():
            messages.append({
                'role': row[0],
                'content': row[1],
                'input_type': row[2],
                'severity_level': row[3],
                'timestamp': row[4]
            })
        
        conn.close()
        return list(reversed(messages))
    
    def save_symptom(self, session_id: str, symptom_name: str, severity: str = None):
        """Save a symptom"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO symptoms (session_id, symptom_name, severity)
            VALUES (?, ?, ?)
        ''', (session_id, symptom_name, severity))
        conn.commit()
        conn.close()
    
    def get_symptoms_history(self, session_id: str) -> List[Dict]:
        """Get symptom history for a session"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT symptom_name, severity, reported_at
            FROM symptoms
            WHERE session_id = ?
            ORDER BY reported_at DESC
        ''', (session_id,))
        
        symptoms = []
        for row in cursor.fetchall():
            symptoms.append({
                'symptom': row[0],
                'severity': row[1],
                'reported_at': row[2]
            })
        
        conn.close()
        return symptoms
    
    def save_health_metric(self, session_id: str, metric_type: str, metric_value: float):
        """Save a health metric"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO health_metrics (session_id, metric_type, metric_value)
            VALUES (?, ?, ?)
        ''', (session_id, metric_type, metric_value))
        conn.commit()
        conn.close()
    
    def save_ml_metric(self, metric_name: str, metric_value: float, 
                      response_time: float = None, accuracy_score: float = None):
        """Save ML performance metrics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO ml_metrics (metric_name, metric_value, response_time, accuracy_score)
            VALUES (?, ?, ?, ?)
        ''', (metric_name, metric_value, response_time, accuracy_score))
        conn.commit()
        conn.close()
    
    def get_ml_metrics_summary(self) -> Dict[str, Any]:
        """Get summary of ML metrics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Average response time
        cursor.execute('SELECT AVG(response_time) FROM ml_metrics WHERE response_time IS NOT NULL')
        avg_response_time = cursor.fetchone()[0] or 0
        
        # Average accuracy
        cursor.execute('SELECT AVG(accuracy_score) FROM ml_metrics WHERE accuracy_score IS NOT NULL')
        avg_accuracy = cursor.fetchone()[0] or 0
        
        # Total queries
        cursor.execute('SELECT COUNT(*) FROM messages WHERE role = "user"')
        total_queries = cursor.fetchone()[0]
        
        # Success rate (responses without errors)
        cursor.execute('SELECT COUNT(*) FROM messages WHERE role = "assistant"')
        successful_responses = cursor.fetchone()[0]
        
        success_rate = (successful_responses / total_queries * 100) if total_queries > 0 else 0
        
        conn.close()
        
        return {
            'avg_response_time': round(avg_response_time, 3),
            'avg_accuracy': round(avg_accuracy, 2),
            'total_queries': total_queries,
            'successful_responses': successful_responses,
            'success_rate': round(success_rate, 2)
        }
    
    def get_health_trends(self, session_id: str) -> Dict[str, List]:
        """Get health trends for continuous monitoring"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get symptom frequency
        cursor.execute('''
            SELECT symptom_name, COUNT(*) as frequency, MAX(reported_at) as last_reported
            FROM symptoms
            WHERE session_id = ?
            GROUP BY symptom_name
            ORDER BY frequency DESC
        ''', (session_id,))
        
        symptom_trends = []
        for row in cursor.fetchall():
            symptom_trends.append({
                'symptom': row[0],
                'frequency': row[1],
                'last_reported': row[2]
            })
        
        # Get severity progression
        cursor.execute('''
            SELECT severity, COUNT(*) as count
            FROM messages
            WHERE session_id = ? AND severity_level IS NOT NULL
            GROUP BY severity
        ''', (session_id,))
        
        severity_distribution = {}
        for row in cursor.fetchall():
            severity_distribution[row[0]] = row[1]
        
        conn.close()
        
        return {
            'symptom_trends': symptom_trends,
            'severity_distribution': severity_distribution
        }
    
    def get_session_memory(self, session_id: str) -> Dict[str, Any]:
        """
        Get comprehensive session memory including past symptoms, diagnoses, and medications
        This allows the bot to remember user's medical history within the session
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get all past symptoms
        cursor.execute('''
            SELECT DISTINCT symptom_name, severity, reported_at
            FROM symptoms
            WHERE session_id = ?
            ORDER BY reported_at DESC
        ''', (session_id,))
        
        past_symptoms = []
        for row in cursor.fetchall():
            past_symptoms.append({
                'symptom': row[0],
                'severity': row[1],
                'when': row[2]
            })
        
        # Get past diagnoses from assistant messages containing "DIAGNOSIS SUMMARY"
        cursor.execute('''
            SELECT content, timestamp
            FROM messages
            WHERE session_id = ? 
            AND role = 'assistant' 
            AND content LIKE '%DIAGNOSIS SUMMARY%'
            ORDER BY timestamp DESC
            LIMIT 5
        ''', (session_id,))
        
        past_diagnoses = []
        for row in cursor.fetchall():
            past_diagnoses.append({
                'summary': row[0],
                'when': row[1]
            })
        
        # Get mentioned medications from conversation
        cursor.execute('''
            SELECT content, timestamp
            FROM messages
            WHERE session_id = ? 
            AND role = 'user'
            AND (content LIKE '%medication%' OR content LIKE '%medicine%' OR content LIKE '%taking%' OR content LIKE '%drug%')
            ORDER BY timestamp DESC
            LIMIT 10
        ''', (session_id,))
        
        mentioned_medications = []
        for row in cursor.fetchall():
            mentioned_medications.append({
                'message': row[0],
                'when': row[1]
            })
        
        # Get session age
        cursor.execute('''
            SELECT created_at, last_active
            FROM sessions
            WHERE session_id = ?
        ''', (session_id,))
        
        session_info = cursor.fetchone()
        created_at = session_info[0] if session_info else None
        last_active = session_info[1] if session_info else None
        
        conn.close()
        
        return {
            'session_id': session_id,
            'created_at': created_at,
            'last_active': last_active,
            'past_symptoms': past_symptoms,
            'past_diagnoses': past_diagnoses,
            'mentioned_medications': mentioned_medications,
            'has_history': len(past_symptoms) > 0 or len(past_diagnoses) > 0
        }

    # ==================== USER PROFILE MANAGEMENT ====================
    
    def create_user_profile(self, user_id: str, name: str = None, age: int = None, 
                           gender: str = None, **kwargs) -> bool:
        """Create a new user profile (Mini EHR)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO user_profiles (user_id, name, age, gender, blood_group, 
                                          weight_kg, height_cm, phone, email, emergency_contact)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, name, age, gender, 
                  kwargs.get('blood_group'), kwargs.get('weight_kg'), kwargs.get('height_cm'),
                  kwargs.get('phone'), kwargs.get('email'), kwargs.get('emergency_contact')))
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            # User already exists
            return False
        finally:
            conn.close()
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get complete user profile"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM user_profiles WHERE user_id = ?', (user_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return None
        
        profile = {
            'user_id': row[0],
            'name': row[1],
            'age': row[2],
            'gender': row[3],
            'blood_group': row[4],
            'weight_kg': row[5],
            'height_cm': row[6],
            'bmi': row[7],
            'phone': row[8],
            'email': row[9],
            'emergency_contact': row[10],
            'created_at': row[11],
            'last_updated': row[12]
        }
        
        # Get allergies
        cursor.execute('SELECT allergy_type, allergy_name, severity FROM user_allergies WHERE user_id = ?', (user_id,))
        profile['allergies'] = [{'type': r[0], 'name': r[1], 'severity': r[2]} for r in cursor.fetchall()]
        
        # Get chronic conditions
        cursor.execute('SELECT condition_name, diagnosed_date, severity FROM user_chronic_conditions WHERE user_id = ?', (user_id,))
        profile['chronic_conditions'] = [{'name': r[0], 'diagnosed_date': r[1], 'severity': r[2]} for r in cursor.fetchall()]
        
        # Get current medications
        cursor.execute('''
            SELECT medication_name, dosage, frequency, purpose 
            FROM user_medications 
            WHERE user_id = ? AND is_active = 1
        ''', (user_id,))
        profile['current_medications'] = [{'name': r[0], 'dosage': r[1], 'frequency': r[2], 'purpose': r[3]} for r in cursor.fetchall()]
        
        # Get past injuries
        cursor.execute('SELECT injury_type, injury_date, treatment FROM user_injuries WHERE user_id = ?', (user_id,))
        profile['past_injuries'] = [{'type': r[0], 'date': r[1], 'treatment': r[2]} for r in cursor.fetchall()]
        
        # Get medical history
        cursor.execute('SELECT condition, diagnosed_on, severity, medications_used FROM user_medical_history WHERE user_id = ?', (user_id,))
        profile['medical_history'] = [{'condition': r[0], 'diagnosed_on': r[1], 'severity': r[2], 'medications': r[3]} for r in cursor.fetchall()]
        
        # Get symptom history
        cursor.execute('''
            SELECT symptom_name, symptom_date, duration_days, severity_score, diagnosis 
            FROM user_symptom_history 
            WHERE user_id = ? 
            ORDER BY symptom_date DESC 
            LIMIT 10
        ''', (user_id,))
        profile['symptom_history'] = [{'symptom': r[0], 'date': r[1], 'duration': r[2], 'severity': r[3], 'diagnosis': r[4]} for r in cursor.fetchall()]
        
        # Get latest doctor notes
        cursor.execute('''
            SELECT note_text, created_at 
            FROM doctor_notes 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 5
        ''', (user_id,))
        profile['doctor_notes'] = [{'note': r[0], 'date': r[1]} for r in cursor.fetchall()]
        
        conn.close()
        return profile
    
    def update_user_profile(self, user_id: str, **kwargs) -> bool:
        """Update user profile fields"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Build dynamic UPDATE query
        fields = []
        values = []
        for key, value in kwargs.items():
            if key in ['name', 'age', 'gender', 'blood_group', 'weight_kg', 'height_cm', 'bmi', 'phone', 'email', 'emergency_contact']:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if not fields:
            conn.close()
            return False
        
        fields.append("last_updated = CURRENT_TIMESTAMP")
        values.append(user_id)
        
        query = f"UPDATE user_profiles SET {', '.join(fields)} WHERE user_id = ?"
        cursor.execute(query, values)
        conn.commit()
        conn.close()
        return True
    
    def add_allergy(self, user_id: str, allergy_type: str, allergy_name: str, severity: str = None):
        """Add allergy to user profile"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO user_allergies (user_id, allergy_type, allergy_name, severity)
            VALUES (?, ?, ?, ?)
        ''', (user_id, allergy_type, allergy_name, severity))
        conn.commit()
        conn.close()
    
    def add_chronic_condition(self, user_id: str, condition_name: str, diagnosed_date: str = None, 
                             severity: str = None, notes: str = None):
        """Add chronic condition to user profile"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO user_chronic_conditions (user_id, condition_name, diagnosed_date, severity, notes)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, condition_name, diagnosed_date, severity, notes))
        conn.commit()
        conn.close()
    
    def add_medication(self, user_id: str, medication_name: str, dosage: str = None, 
                      frequency: str = None, started_date: str = None, purpose: str = None):
        """Add current medication to user profile"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO user_medications (user_id, medication_name, dosage, frequency, started_date, purpose)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, medication_name, dosage, frequency, started_date, purpose))
        conn.commit()
        conn.close()
    
    def add_symptom_to_history(self, user_id: str, symptom_name: str, symptom_date: str = None,
                               duration_days: int = None, severity_score: int = None, 
                               diagnosis: str = None, treatment_given: str = None, 
                               outcome: str = None, session_id: str = None):
        """Add symptom to user's medical history"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO user_symptom_history 
            (user_id, session_id, symptom_name, symptom_date, duration_days, severity_score, 
             diagnosis, treatment_given, outcome)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, session_id, symptom_name, symptom_date, duration_days, severity_score, 
              diagnosis, treatment_given, outcome))
        conn.commit()
        conn.close()
    
    def add_doctor_note(self, user_id: str, note_text: str, note_type: str = None, 
                       session_id: str = None, created_by: str = 'AI'):
        """Add doctor note to user profile"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO doctor_notes (user_id, session_id, note_text, note_type, created_by)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, session_id, note_text, note_type, created_by))
        conn.commit()
        conn.close()
    
    def check_drug_allergy(self, user_id: str, medication_name: str) -> bool:
        """Check if user is allergic to a medication"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT COUNT(*) FROM user_allergies 
            WHERE user_id = ? AND allergy_type = 'drug' AND LOWER(allergy_name) = LOWER(?)
        ''', (user_id, medication_name))
        count = cursor.fetchone()[0]
        conn.close()
        return count > 0
    
    def get_user_risk_factors(self, user_id: str) -> Dict[str, Any]:
        """Get user's risk factors for clinical decision support"""
        profile = self.get_user_profile(user_id)
        if not profile:
            return {}
        
        risk_factors = {
            'age_risk': 'high' if (profile['age'] and (profile['age'] < 2 or profile['age'] > 65)) else 'low',
            'chronic_conditions_count': len(profile.get('chronic_conditions', [])),
            'medications_count': len(profile.get('current_medications', [])),
            'allergies_count': len(profile.get('allergies', [])),
            'has_drug_allergies': any(a['type'] == 'drug' for a in profile.get('allergies', [])),
            'recent_symptoms_count': len(profile.get('symptom_history', []))
        }
        
        return risk_factors

# Initialize database
db = MediChatDatabase()
