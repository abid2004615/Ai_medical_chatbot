"""
Medical Question Generator
Generates relevant follow-up questions based on symptoms
"""
from typing import List, Dict

class MedicalQuestionGenerator:
    """Generates structured medical questions for symptom assessment"""
    
    # Question templates by symptom category
    PAIN_QUESTIONS = [
        "Where exactly is the pain located?",
        "On a scale of 1-10, how severe is the pain?",
        "What type of pain is it? (sharp, dull, throbbing, burning, aching)",
        "When did the pain start?",
        "Is the pain constant or does it come and go?",
        "Does the pain radiate to other areas?",
        "What makes the pain better or worse?",
        "Have you taken any pain medication? Did it help?"
    ]
    
    FEVER_QUESTIONS = [
        "What is your current temperature?",
        "When did the fever start?",
        "Is the fever constant or intermittent?",
        "Are you experiencing chills or sweating?",
        "Have you taken any fever-reducing medication?",
        "Any other symptoms along with fever? (cough, sore throat, body aches)"
    ]
    
    RESPIRATORY_QUESTIONS = [
        "Are you having difficulty breathing?",
        "Is there any chest pain or tightness?",
        "Do you have a cough? Is it dry or productive?",
        "Any wheezing or shortness of breath?",
        "When did the breathing difficulty start?",
        "Does it worsen with activity or lying down?"
    ]
    
    DIGESTIVE_QUESTIONS = [
        "When did the digestive issue start?",
        "How frequent are the symptoms?",
        "Any nausea or vomiting?",
        "Any changes in appetite?",
        "Any blood in stool or vomit?",
        "Recent dietary changes or food consumption?",
        "Any abdominal pain? Where is it located?"
    ]
    
    GENERAL_QUESTIONS = [
        "How old are you?",
        "Do you have any existing medical conditions?",
        "Are you currently taking any medications?",
        "Do you have any known allergies?",
        "When did these symptoms first appear?",
        "Have you experienced this before?",
        "Any recent travel or exposure to sick individuals?",
        "How are your stress levels lately?"
    ]
    
    @staticmethod
    def generate_questions(symptom_text: str, conversation_history: List[Dict] = None) -> List[str]:
        """
        Generate relevant questions based on symptoms mentioned
        
        Args:
            symptom_text: User's symptom description
            conversation_history: Previous conversation for context
            
        Returns:
            List of relevant questions to ask
        """
        symptom_lower = symptom_text.lower()
        questions = []
        
        # Check what's already been asked
        asked_questions = set()
        if conversation_history:
            for msg in conversation_history:
                if msg.get('role') == 'assistant':
                    # Extract questions from previous responses
                    content = msg.get('content', '')
                    if '?' in content:
                        asked_questions.update([q.strip() for q in content.split('?') if q.strip()])
        
        # Pain-related symptoms
        if any(word in symptom_lower for word in ['pain', 'ache', 'hurt', 'sore', 'discomfort']):
            for q in MedicalQuestionGenerator.PAIN_QUESTIONS[:3]:
                if q not in asked_questions:
                    questions.append(q)
        
        # Fever-related
        if any(word in symptom_lower for word in ['fever', 'temperature', 'hot', 'chills']):
            for q in MedicalQuestionGenerator.FEVER_QUESTIONS[:3]:
                if q not in asked_questions:
                    questions.append(q)
        
        # Respiratory symptoms
        if any(word in symptom_lower for word in ['cough', 'breathing', 'breath', 'chest', 'wheeze', 'congestion']):
            for q in MedicalQuestionGenerator.RESPIRATORY_QUESTIONS[:3]:
                if q not in asked_questions:
                    questions.append(q)
        
        # Digestive symptoms
        if any(word in symptom_lower for word in ['stomach', 'nausea', 'vomit', 'diarrhea', 'constipation', 'abdominal']):
            for q in MedicalQuestionGenerator.DIGESTIVE_QUESTIONS[:3]:
                if q not in asked_questions:
                    questions.append(q)
        
        # Add general questions if not much info provided
        if len(questions) < 2:
            for q in MedicalQuestionGenerator.GENERAL_QUESTIONS[:2]:
                if q not in asked_questions:
                    questions.append(q)
        
        # Return questions but will be used one at a time
        return questions
    
    @staticmethod
    def get_missing_info(symptom_text: str, conversation_history: List[Dict] = None) -> Dict[str, bool]:
        """
        Identify what information is still missing
        
        Returns:
            Dictionary of information categories and whether they're provided
        """
        symptom_lower = symptom_text.lower()
        history_text = ""
        
        if conversation_history:
            history_text = " ".join([msg.get('content', '') for msg in conversation_history]).lower()
        
        combined_text = symptom_lower + " " + history_text
        
        # Enhanced age detection - check for numbers followed by age indicators or age ranges
        import re
        age_patterns = [
            r'\b\d{1,3}\s*(?:years?\s*old|yrs?\s*old|y\.?o\.?)\b',  # "25 years old", "25 yrs old", "25 y.o"
            r'\b(?:i\'m|i\s+am|im)\s+\d{1,3}\b',  # "I'm 25", "I am 25"
            r'\bage[:\s]+\d{1,3}\b',  # "age: 25", "age 25"
            r'\b\d{1,3}\s*year\b',  # "25 year"
            r'\b(?:child|kid|baby|infant|toddler|teenager|teen|adult|senior|elderly)\b',  # Age groups
        ]
        has_age = any(re.search(pattern, combined_text, re.IGNORECASE) for pattern in age_patterns)
        
        return {
            'onset_time': any(word in combined_text for word in ['started', 'began', 'since', 'ago', 'yesterday', 'today', 'morning', 'night', 'week']),
            'severity': any(word in combined_text for word in ['severe', 'mild', 'moderate', 'scale', '/10', 'bad', 'terrible', 'slight']),
            'duration': any(word in combined_text for word in ['hours', 'days', 'weeks', 'constant', 'intermittent', 'continuous', 'ongoing']),
            'location': any(word in combined_text for word in ['left', 'right', 'upper', 'lower', 'side', 'area', 'front', 'back']),
            'aggravating_factors': any(word in combined_text for word in ['worse', 'better', 'when', 'after', 'during', 'triggers']),
            'associated_symptoms': any(word in combined_text for word in ['also', 'along with', 'and', 'plus', 'additionally']),
            'medical_history': any(word in combined_text for word in ['condition', 'disease', 'diagnosed', 'history', 'chronic']),
            'medications': any(word in combined_text for word in ['taking', 'medication', 'medicine', 'drug', 'pill', 'prescription']),
            'age': has_age,
        }
    
    @staticmethod
    def prioritize_questions(missing_info: Dict[str, bool], severity_level: str) -> List[str]:
        """
        Prioritize which questions to ask based on missing info and severity
        
        Args:
            missing_info: Dictionary of missing information
            severity_level: Severity level (EMERGENCY, HIGH, MODERATE, LOW, MINIMAL)
            
        Returns:
            Prioritized list of questions
        """
        questions = []
        
        # For emergency, don't ask questions - advise immediate care
        if severity_level == 'EMERGENCY':
            return []
        
        # HIGHEST PRIORITY - Age (critical for medication safety)
        if not missing_info.get('age'):
            questions.append("How old are you? (Important for safe medication dosing)")
        
        # High priority questions
        if not missing_info.get('severity'):
            questions.append("On a scale of 1-10, how severe are your symptoms?")
        
        if not missing_info.get('onset_time'):
            questions.append("When did these symptoms start?")
        
        if not missing_info.get('duration'):
            questions.append("Are the symptoms constant or do they come and go?")
        
        # Medium priority
        if not missing_info.get('associated_symptoms'):
            questions.append("Are you experiencing any other symptoms?")
        
        if not missing_info.get('aggravating_factors'):
            questions.append("What makes the symptoms better or worse?")
        
        # Lower priority but important
        if not missing_info.get('medical_history'):
            questions.append("Do you have any existing medical conditions?")
        
        if not missing_info.get('medications'):
            questions.append("Are you currently taking any medications?")
        
        # Return prioritized questions (will be asked one at a time)
        return questions

# Initialize question generator
question_generator = MedicalQuestionGenerator()
