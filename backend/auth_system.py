"""
User Authentication System
Handles user registration, login, and session management
"""
import hashlib
import secrets
import sqlite3
from typing import Optional, Dict, Tuple
from datetime import datetime, timedelta
from database import db

class AuthenticationSystem:
    """Manages user authentication and sessions"""
    
    @staticmethod
    def hash_password(password: str, salt: str = None) -> Tuple[str, str]:
        """Hash password with salt"""
        if salt is None:
            salt = secrets.token_hex(16)
        
        # Hash password with salt
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000  # iterations
        ).hex()
        
        return password_hash, salt
    
    @staticmethod
    def verify_password(password: str, password_hash: str, salt: str) -> bool:
        """Verify password against hash"""
        computed_hash, _ = AuthenticationSystem.hash_password(password, salt)
        return computed_hash == password_hash
    
    @staticmethod
    def generate_session_token() -> str:
        """Generate secure session token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def create_auth_tables():
        """Create authentication tables"""
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # User credentials table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_credentials (
                user_id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                email_verified BOOLEAN DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
            )
        ''')
        
        # Session tokens table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                session_token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    @staticmethod
    def register_user(email: str, password: str, name: str, **profile_data) -> Tuple[bool, str, Optional[str]]:
        """
        Register new user
        Returns: (success, message, user_id)
        """
        conn = db.get_connection()
        cursor = conn.cursor()
        
        try:
            # Check if email already exists
            cursor.execute('SELECT email FROM user_credentials WHERE email = ?', (email,))
            if cursor.fetchone():
                conn.close()
                return False, "Email already registered", None
            
            # Generate user_id
            user_id = f"U_{secrets.token_hex(8)}"
            
            # Hash password
            password_hash, salt = AuthenticationSystem.hash_password(password)
            
            # Create user profile
            success = db.create_user_profile(
                user_id=user_id,
                name=name,
                email=email,
                **profile_data
            )
            
            if not success:
                conn.close()
                return False, "Failed to create profile", None
            
            # Store credentials
            cursor.execute('''
                INSERT INTO user_credentials (user_id, email, password_hash, password_salt)
                VALUES (?, ?, ?, ?)
            ''', (user_id, email, password_hash, salt))
            
            conn.commit()
            conn.close()
            
            return True, "Registration successful", user_id
            
        except Exception as e:
            conn.close()
            return False, f"Registration failed: {str(e)}", None
    
    @staticmethod
    def login_user(email: str, password: str, ip_address: str = None, user_agent: str = None) -> Tuple[bool, str, Optional[str], Optional[str]]:
        """
        Login user
        Returns: (success, message, user_id, session_token)
        """
        conn = db.get_connection()
        cursor = conn.cursor()
        
        try:
            # Get user credentials
            cursor.execute('''
                SELECT user_id, password_hash, password_salt, is_active 
                FROM user_credentials 
                WHERE email = ?
            ''', (email,))
            
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return False, "Invalid email or password", None, None
            
            user_id, password_hash, salt, is_active = result
            
            # Check if account is active
            if not is_active:
                conn.close()
                return False, "Account is deactivated", None, None
            
            # Verify password
            if not AuthenticationSystem.verify_password(password, password_hash, salt):
                conn.close()
                return False, "Invalid email or password", None, None
            
            # Generate session token
            session_token = AuthenticationSystem.generate_session_token()
            expires_at = datetime.now() + timedelta(days=30)  # 30 days
            
            # Create session
            cursor.execute('''
                INSERT INTO user_sessions (session_token, user_id, expires_at, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            ''', (session_token, user_id, expires_at, ip_address, user_agent))
            
            # Update last login
            cursor.execute('''
                UPDATE user_credentials 
                SET last_login = CURRENT_TIMESTAMP 
                WHERE user_id = ?
            ''', (user_id,))
            
            conn.commit()
            conn.close()
            
            return True, "Login successful", user_id, session_token
            
        except Exception as e:
            conn.close()
            return False, f"Login failed: {str(e)}", None, None
    
    @staticmethod
    def verify_session(session_token: str) -> Tuple[bool, Optional[str]]:
        """
        Verify session token
        Returns: (is_valid, user_id)
        """
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, expires_at, is_active 
            FROM user_sessions 
            WHERE session_token = ?
        ''', (session_token,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return False, None
        
        user_id, expires_at, is_active = result
        
        # Check if session is active
        if not is_active:
            return False, None
        
        # Check if session expired
        expires_at_dt = datetime.fromisoformat(expires_at)
        if datetime.now() > expires_at_dt:
            return False, None
        
        return True, user_id
    
    @staticmethod
    def logout_user(session_token: str) -> bool:
        """Logout user by invalidating session"""
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE user_sessions 
            SET is_active = 0 
            WHERE session_token = ?
        ''', (session_token,))
        
        conn.commit()
        conn.close()
        
        return True
    
    @staticmethod
    def get_user_by_session(session_token: str) -> Optional[Dict]:
        """Get user profile by session token"""
        is_valid, user_id = AuthenticationSystem.verify_session(session_token)
        
        if not is_valid:
            return None
        
        return db.get_user_profile(user_id)
    
    @staticmethod
    def change_password(user_id: str, old_password: str, new_password: str) -> Tuple[bool, str]:
        """Change user password"""
        conn = db.get_connection()
        cursor = conn.cursor()
        
        try:
            # Get current credentials
            cursor.execute('''
                SELECT password_hash, password_salt 
                FROM user_credentials 
                WHERE user_id = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            if not result:
                conn.close()
                return False, "User not found"
            
            password_hash, salt = result
            
            # Verify old password
            if not AuthenticationSystem.verify_password(old_password, password_hash, salt):
                conn.close()
                return False, "Incorrect current password"
            
            # Hash new password
            new_hash, new_salt = AuthenticationSystem.hash_password(new_password)
            
            # Update password
            cursor.execute('''
                UPDATE user_credentials 
                SET password_hash = ?, password_salt = ? 
                WHERE user_id = ?
            ''', (new_hash, new_salt, user_id))
            
            # Invalidate all sessions
            cursor.execute('''
                UPDATE user_sessions 
                SET is_active = 0 
                WHERE user_id = ?
            ''', (user_id,))
            
            conn.commit()
            conn.close()
            
            return True, "Password changed successfully"
            
        except Exception as e:
            conn.close()
            return False, f"Failed to change password: {str(e)}"


# Initialize auth system
auth_system = AuthenticationSystem()

# Create auth tables
auth_system.create_auth_tables()
