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

# Initialize database
db = MediChatDatabase()
