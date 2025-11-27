"""
Session Memory System
Manages conversation context and persistent memory across sessions
"""

from datetime import datetime
from typing import List, Dict, Optional
import json

class SessionMemory:
    """Manages chat session memory with configurable message limits"""
    
    def __init__(self, user_id: int, session_id: str, max_messages: int = 20):
        self.user_id = user_id
        self.session_id = session_id
        self.messages: List[Dict] = []
        self.max_messages = max_messages
        self.memory_enabled = True
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict] = None):
        """Add a message to session memory"""
        if not self.memory_enabled:
            return
        
        message = {
            'role': role,  # 'user' or 'assistant'
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'metadata': metadata or {}
        }
        
        self.messages.append(message)
        
        # Keep only last N messages
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
    
    def get_context(self) -> List[Dict]:
        """Get conversation context for AI"""
        return self.messages
    
    def get_context_string(self) -> str:
        """Get formatted context string for AI prompt"""
        context_parts = []
        for msg in self.messages:
            role = "User" if msg['role'] == 'user' else "Assistant"
            context_parts.append(f"{role}: {msg['content']}")
        return "\n".join(context_parts)
    
    def clear_memory(self):
        """Clear all messages from memory"""
        self.messages = []
    
    def toggle_memory(self, enabled: bool):
        """Enable or disable memory storage"""
        self.memory_enabled = enabled
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage"""
        return {
            'user_id': self.user_id,
            'session_id': self.session_id,
            'messages': self.messages,
            'max_messages': self.max_messages,
            'memory_enabled': self.memory_enabled
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'SessionMemory':
        """Create SessionMemory from dictionary"""
        memory = cls(
            user_id=data['user_id'],
            session_id=data['session_id'],
            max_messages=data.get('max_messages', 20)
        )
        memory.messages = data.get('messages', [])
        memory.memory_enabled = data.get('memory_enabled', True)
        return memory
    
    def get_summary(self) -> Dict:
        """Get session summary"""
        return {
            'session_id': self.session_id,
            'message_count': len(self.messages),
            'first_message_time': self.messages[0]['timestamp'] if self.messages else None,
            'last_message_time': self.messages[-1]['timestamp'] if self.messages else None,
            'memory_enabled': self.memory_enabled
        }


class SessionMemoryManager:
    """Manages multiple session memories"""
    
    def __init__(self):
        self.sessions: Dict[str, SessionMemory] = {}
        self.session_data: Dict[str, Dict] = {}  # Additional session data storage
    
    def get_or_create_session(self, user_id: int, session_id: str) -> SessionMemory:
        """Get existing session or create new one"""
        if session_id not in self.sessions:
            self.sessions[session_id] = SessionMemory(user_id, session_id)
        return self.sessions[session_id]
    
    def save_session(self, session_id: str, db_connection):
        """Save session to database"""
        if session_id not in self.sessions:
            return False
        
        session = self.sessions[session_id]
        session_data = json.dumps(session.to_dict())
        
        cursor = db_connection.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO session_memory 
            (session_id, user_id, data, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (session_id, session.user_id, session_data, datetime.now()))
        db_connection.commit()
        return True
    
    def load_session(self, session_id: str, db_connection) -> Optional[SessionMemory]:
        """Load session from database"""
        cursor = db_connection.cursor()
        cursor.execute('''
            SELECT data FROM session_memory WHERE session_id = ?
        ''', (session_id,))
        
        row = cursor.fetchone()
        if row:
            data = json.loads(row[0])
            session = SessionMemory.from_dict(data)
            self.sessions[session_id] = session
            return session
        return None
    
    def delete_session(self, session_id: str, db_connection):
        """Delete session from memory and database"""
        if session_id in self.sessions:
            del self.sessions[session_id]
        
        cursor = db_connection.cursor()
        cursor.execute('DELETE FROM session_memory WHERE session_id = ?', (session_id,))
        db_connection.commit()
    
    def get_user_sessions(self, user_id: int, db_connection) -> List[Dict]:
        """Get all sessions for a user"""
        cursor = db_connection.cursor()
        cursor.execute('''
            SELECT session_id, data, updated_at 
            FROM session_memory 
            WHERE user_id = ?
            ORDER BY updated_at DESC
        ''', (user_id,))
        
        sessions = []
        for row in cursor.fetchall():
            data = json.loads(row[1])
            sessions.append({
                'session_id': row[0],
                'message_count': len(data.get('messages', [])),
                'updated_at': row[2]
            })
        return sessions
    
    def get_memory(self, session_id: str) -> Dict:
        """Get session data dictionary"""
        if session_id not in self.session_data:
            self.session_data[session_id] = {
                'symptoms': [],
                'current_medications': None,
                'allergies': [],
                'chronic_conditions': []
            }
        return self.session_data[session_id]
    
    def add_symptom(self, session_id: str, symptom_data: Dict):
        """Add symptom to session data"""
        memory = self.get_memory(session_id)
        if 'symptoms' not in memory:
            memory['symptoms'] = []
        memory['symptoms'].append(symptom_data)
    
    def set_medications(self, session_id: str, medications: List[str]):
        """Set current medications for session"""
        memory = self.get_memory(session_id)
        memory['current_medications'] = medications
    
    def add_allergy(self, session_id: str, allergy: str):
        """Add allergy to session data"""
        memory = self.get_memory(session_id)
        if 'allergies' not in memory:
            memory['allergies'] = []
        if allergy not in memory['allergies']:
            memory['allergies'].append(allergy)


# Global session manager instance
session_manager = SessionMemoryManager()
