"""
Emergency Detection System
Detects life-threatening situations and provides immediate guidance
"""

EMERGENCY_KEYWORDS = [
    'chest pain', 'can\'t breathe', 'cannot breathe', 'severe bleeding', 'unconscious',
    'suicide', 'suicidal', 'kill myself', 'overdose', 'stroke', 'heart attack', 'choking',
    'severe burn', 'head injury', 'seizure', 'convulsion', 'passed out',
    'difficulty breathing', 'shortness of breath', 'crushing pain', 'numb arm',
    'slurred speech', 'confusion', 'severe headache', 'vision loss', 'paralysis'
]

EMERGENCY_RESPONSE = {
    'is_emergency': True,
    'message': '🚨 EMERGENCY: This may be a medical emergency. Please call 911 or go to the nearest emergency room immediately. Do not wait.',
    'show_banner': True,
    'priority': 'critical'
}

def detect_emergency(message):
    """
    Detect emergency situations from user message
    
    Args:
        message (str): User's message
        
    Returns:
        dict: Emergency detection result
    """
    if not message:
        return {'is_emergency': False}
    
    message_lower = message.lower()
    
    # Check for emergency keywords
    for keyword in EMERGENCY_KEYWORDS:
        if keyword in message_lower:
            return EMERGENCY_RESPONSE
    
    # Check for emergency phrases
    emergency_phrases = [
        'want to die', 'end my life', 'hurt myself',
        'severe pain', 'can\'t move', 'losing consciousness'
    ]
    
    for phrase in emergency_phrases:
        if phrase in message_lower:
            return EMERGENCY_RESPONSE
    
    return {'is_emergency': False}

def get_emergency_guidance():
    """Get emergency contact information"""
    return {
        'emergency_number': '911',
        'poison_control': '1-800-222-1222',
        'suicide_hotline': '988',
        'message': 'If this is a life-threatening emergency, call 911 immediately.'
    }
