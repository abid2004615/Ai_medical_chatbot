"""
Safety Guardrails System
Prevents unsafe medical suggestions and enforces safety rules
"""

DANGEROUS_KEYWORDS = [
    'dosage', 'prescription', 'how much', 'how many pills', 'how many tablets',
    'inject', 'injection', 'surgery', 'cut', 'remove', 'operate',
    'prescribe', 'rx', 'milligrams', 'mg', 'ml', 'dose'
]

MEDICATION_KEYWORDS = [
    'medicine', 'medication', 'drug', 'pill', 'tablet', 'capsule',
    'antibiotic', 'painkiller', 'prescription'
]

def check_safety(user_message):
    """
    Check if user message contains dangerous requests
    
    Args:
        user_message (str): User's message
        
    Returns:
        dict: Safety check result
    """
    if not user_message:
        return {'safe': True}
    
    message_lower = user_message.lower()
    
    # Check for dangerous keywords
    for keyword in DANGEROUS_KEYWORDS:
        if keyword in message_lower:
            return {
                'safe': False,
                'reason': 'dosage_request',
                'message': 'I cannot provide specific dosages or prescriptions. Please consult a healthcare professional or pharmacist for medication guidance.'
            }
    
    # Check for medication requests
    if any(keyword in message_lower for keyword in MEDICATION_KEYWORDS):
        if any(word in message_lower for word in ['how much', 'dosage', 'dose', 'how many']):
            return {
                'safe': False,
                'reason': 'medication_dosage',
                'message': 'I can provide general information about medications, but I cannot recommend specific dosages. Please consult your doctor or pharmacist.'
            }
    
    # Check for self-harm or dangerous procedures
    dangerous_actions = ['cut myself', 'hurt myself', 'perform surgery', 'remove', 'extract']
    for action in dangerous_actions:
        if action in message_lower:
            return {
                'safe': False,
                'reason': 'dangerous_action',
                'message': 'I cannot provide guidance on procedures that could cause harm. Please seek immediate professional medical help.'
            }
    
    return {'safe': True}

def get_safe_response_guidelines():
    """Get guidelines for safe AI responses"""
    return {
        'rules': [
            'Never provide specific dosages',
            'Never prescribe medications',
            'Never diagnose conditions',
            'Always recommend professional consultation',
            'Provide general information only',
            'Include disclaimers in responses'
        ],
        'disclaimer': 'This information is provided as general guidance and is not a substitute for professional medical advice.'
    }

def validate_medication_info(medication_name, user_query):
    """
    Validate if medication information request is safe
    
    Args:
        medication_name (str): Name of medication
        user_query (str): User's query about the medication
        
    Returns:
        dict: Validation result
    """
    query_lower = user_query.lower()
    
    # Unsafe queries
    if any(word in query_lower for word in ['how much', 'dosage', 'dose', 'how many']):
        return {
            'safe': False,
            'message': f'I can tell you what {medication_name} is used for, but I cannot provide dosage information. Please consult your doctor or pharmacist.'
        }
    
    # Safe queries (general information)
    safe_queries = ['what is', 'used for', 'side effects', 'interactions', 'warnings']
    if any(query in query_lower for query in safe_queries):
        return {
            'safe': True,
            'type': 'general_info',
            'include_disclaimer': True
        }
    
    return {
        'safe': True,
        'type': 'general',
        'include_disclaimer': True
    }
