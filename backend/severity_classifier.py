"""
Severity classification system for symptoms
"""
import re
from typing import Dict, List, Tuple

class SeverityClassifier:
    """Classifies symptom severity based on keywords and patterns"""
    
    # Emergency keywords
    EMERGENCY_KEYWORDS = [
        'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious',
        'stroke', 'heart attack', 'seizure', 'severe head injury', 'poisoning',
        'severe burn', 'choking', 'severe allergic reaction', 'anaphylaxis',
        'suicidal', 'severe abdominal pain', 'cannot breathe', 'unresponsive'
    ]
    
    # High severity keywords
    HIGH_SEVERITY_KEYWORDS = [
        'severe pain', 'high fever', 'persistent vomiting', 'blood in stool',
        'blood in urine', 'severe headache', 'confusion', 'slurred speech',
        'sudden weakness', 'vision loss', 'severe dizziness', 'fainting',
        'rapid heartbeat', 'severe cough', 'difficulty swallowing'
    ]
    
    # Moderate severity keywords
    MODERATE_SEVERITY_KEYWORDS = [
        'moderate pain', 'fever', 'persistent cough', 'nausea', 'vomiting',
        'diarrhea', 'headache', 'body ache', 'fatigue', 'sore throat',
        'runny nose', 'mild bleeding', 'rash', 'swelling', 'joint pain'
    ]
    
    # Low severity keywords
    LOW_SEVERITY_KEYWORDS = [
        'mild pain', 'slight discomfort', 'minor headache', 'sneezing',
        'itching', 'dry skin', 'minor rash', 'mild fatigue', 'slight cough',
        'minor bruise', 'small cut', 'mild soreness'
    ]
    
    @staticmethod
    def classify_severity(text: str) -> Tuple[str, int, List[str]]:
        """
        Classify severity of symptoms in text
        
        Returns:
            Tuple of (severity_level, severity_score, matched_keywords)
            severity_level: 'EMERGENCY', 'HIGH', 'MODERATE', 'LOW', 'MINIMAL'
            severity_score: 0-100
            matched_keywords: List of keywords that matched
        """
        text_lower = text.lower()
        matched_keywords = []
        severity_score = 0
        
        # Check for emergency keywords
        for keyword in SeverityClassifier.EMERGENCY_KEYWORDS:
            if keyword in text_lower:
                matched_keywords.append(keyword)
                severity_score = max(severity_score, 95)
        
        # Check for high severity keywords
        for keyword in SeverityClassifier.HIGH_SEVERITY_KEYWORDS:
            if keyword in text_lower:
                matched_keywords.append(keyword)
                severity_score = max(severity_score, 75)
        
        # Check for moderate severity keywords
        for keyword in SeverityClassifier.MODERATE_SEVERITY_KEYWORDS:
            if keyword in text_lower:
                matched_keywords.append(keyword)
                severity_score = max(severity_score, 50)
        
        # Check for low severity keywords
        for keyword in SeverityClassifier.LOW_SEVERITY_KEYWORDS:
            if keyword in text_lower:
                matched_keywords.append(keyword)
                severity_score = max(severity_score, 25)
        
        # Determine severity level
        if severity_score >= 90:
            severity_level = 'EMERGENCY'
        elif severity_score >= 70:
            severity_level = 'HIGH'
        elif severity_score >= 45:
            severity_level = 'MODERATE'
        elif severity_score >= 20:
            severity_level = 'LOW'
        else:
            severity_level = 'MINIMAL'
        
        return severity_level, severity_score, matched_keywords
    
    @staticmethod
    def get_severity_message(severity_level: str) -> str:
        """Get appropriate message based on severity level"""
        messages = {
            'EMERGENCY': '🚨 EMERGENCY: Seek immediate medical attention! Call emergency services or go to the nearest emergency room.',
            'HIGH': '⚠️ HIGH SEVERITY: Please consult a doctor as soon as possible. Do not delay medical attention.',
            'MODERATE': '⚡ MODERATE SEVERITY: Consider scheduling a doctor appointment within 24-48 hours.',
            'LOW': 'ℹ️ LOW SEVERITY: Monitor symptoms. Consult a doctor if symptoms persist or worsen.',
            'MINIMAL': '✓ MINIMAL CONCERN: General health guidance provided. Consult a doctor if you have concerns.'
        }
        return messages.get(severity_level, messages['MINIMAL'])
    
    @staticmethod
    def analyze_symptom_combination(symptoms: List[str]) -> Dict:
        """Analyze combination of symptoms for severity"""
        combined_text = ' '.join(symptoms)
        severity_level, severity_score, matched_keywords = SeverityClassifier.classify_severity(combined_text)
        
        # Check for dangerous combinations
        dangerous_combinations = [
            (['fever', 'headache', 'stiff neck'], 'Possible meningitis - seek immediate care'),
            (['chest pain', 'shortness of breath'], 'Possible cardiac issue - seek immediate care'),
            (['severe headache', 'vision changes', 'confusion'], 'Possible stroke - call emergency'),
            (['fever', 'rash', 'severe headache'], 'Possible serious infection - seek immediate care')
        ]
        
        warnings = []
        for combo, warning in dangerous_combinations:
            if all(symptom.lower() in combined_text.lower() for symptom in combo):
                warnings.append(warning)
                severity_score = max(severity_score, 95)
                severity_level = 'EMERGENCY'
        
        return {
            'severity_level': severity_level,
            'severity_score': severity_score,
            'matched_keywords': matched_keywords,
            'warnings': warnings,
            'message': SeverityClassifier.get_severity_message(severity_level)
        }

# Initialize classifier
severity_classifier = SeverityClassifier()
