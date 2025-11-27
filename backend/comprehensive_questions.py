"""
Comprehensive Medical Question Generator
Covers all 8 categories of medical information collection
"""
from typing import List, Dict
from patient_profile import PatientProfile

class ComprehensiveQuestionGenerator:
    """Generates questions covering all medical information categories"""
    
    # 1. BASIC PATIENT INFORMATION QUESTIONS
    BASIC_INFO_QUESTIONS = {
        'age': "How old are you?",
        'gender': "What is your gender?",
        'weight': "What is your weight in kilograms?",
        'height': "What is your height in centimeters?",
        'chronic_conditions': "Do you have any chronic medical conditions (diabetes, hypertension, asthma, etc.)?",
        'past_surgeries': "Have you had any surgeries in the past?",
        'family_history': "Does anyone in your family have serious medical conditions?",
        'current_medications': "Are you currently taking any medications?",
        'drug_allergies': "Are you allergic to any medications?",
        'food_allergies': "Do you have any food allergies?"
    }
    
    # 2. SYMPTOM COLLECTION QUESTIONS
    SYMPTOM_QUESTIONS = {
        'primary_symptom': "What is your main symptom or complaint?",
        'onset': "When did this symptom start?",
        'duration': "How long have you had this symptom?",
        'frequency': "Is the symptom constant or does it come and go?",
        'severity': "On a scale of 1-10, how severe is it?",
        'location': "Where exactly is the symptom located?",
        'character': "How would you describe it? (sharp, dull, throbbing, burning, aching)",
        'aggravating': "What makes it worse?",
        'relieving': "What makes it better?",
        'associated': "Are you experiencing any other symptoms along with this?"
    }
    
    # 3. SYMPTOM PATTERN QUESTIONS
    PATTERN_QUESTIONS = {
        'time_pattern': "Does it happen more during the day or night?",
        'triggers': "What seems to trigger this symptom?",
        'progression': "Is it getting better, worse, or staying the same?"
    }
    
    # 4. RISK FACTOR QUESTIONS
    RISK_FACTOR_QUESTIONS = {
        'sleep': "How many hours of sleep do you get per night?",
        'diet': "How would you describe your diet?",
        'exercise': "How often do you exercise?",
        'smoking': "Do you smoke?",
        'alcohol': "Do you drink alcohol? If yes, how often?",
        'caffeine': "How much caffeine do you consume daily?",
        'stress': "On a scale of 1-10, how stressed are you?",
        'screen_time': "How many hours per day do you spend on screens?",
        'past_trauma': "Have you had any injuries or trauma related to this area?"
    }
    
    @staticmethod
    def generate_prioritized_questions(profile: PatientProfile) -> List[Dict[str, str]]:
        """
        Generate prioritized list of questions based on what's missing
        Returns list of {category, question, priority}
        """
        questions = []
        
        # PRIORITY 1: Critical Basic Information (for medication safety)
        if not profile.age:
            questions.append({
                'category': 'basic_info',
                'field': 'age',
                'question': ComprehensiveQuestionGenerator.BASIC_INFO_QUESTIONS['age'],
                'priority': 1,
                'reason': 'Critical for medication dosing'
            })
        
        if not profile.gender:
            questions.append({
                'category': 'basic_info',
                'field': 'gender',
                'question': ComprehensiveQuestionGenerator.BASIC_INFO_QUESTIONS['gender'],
                'priority': 1,
                'reason': 'Important for diagnosis'
            })
        
        # PRIORITY 2: Primary Symptom Information
        if not profile.primary_symptom:
            questions.append({
                'category': 'symptom',
                'field': 'primary_symptom',
                'question': ComprehensiveQuestionGenerator.SYMPTOM_QUESTIONS['primary_symptom'],
                'priority': 2,
                'reason': 'Essential for diagnosis'
            })
        
        if not profile.severity_score:
            questions.append({
                'category': 'symptom',
                'field': 'severity',
                'question': ComprehensiveQuestionGenerator.SYMPTOM_QUESTIONS['severity'],
                'priority': 2,
                'reason': 'Determines urgency'
            })
        
        if not profile.symptom_onset:
            questions.append({
                'category': 'symptom',
                'field': 'onset',
                'question': ComprehensiveQuestionGenerator.SYMPTOM_QUESTIONS['onset'],
                'priority': 2,
                'reason': 'Helps identify cause'
            })
        
        # PRIORITY 3: Medical History (for safety)
        if not profile.chronic_conditions:
            questions.append({
                'category': 'basic_info',
                'field': 'chronic_conditions',
                'question': ComprehensiveQuestionGenerator.BASIC_INFO_QUESTIONS['chronic_conditions'],
                'priority': 3,
                'reason': 'Affects treatment options'
            })
        
        if not profile.current_medications:
            questions.append({
                'category': 'basic_info',
                'field': 'current_medications',
                'question': ComprehensiveQuestionGenerator.BASIC_INFO_QUESTIONS['current_medications'],
                'priority': 3,
                'reason': 'Prevents drug interactions'
            })
        
        if not profile.drug_allergies:
            questions.append({
                'category': 'basic_info',
                'field': 'drug_allergies',
                'question': ComprehensiveQuestionGenerator.BASIC_INFO_QUESTIONS['drug_allergies'],
                'priority': 3,
                'reason': 'Critical for safety'
            })
        
        # PRIORITY 4: Detailed Symptom Characteristics
        if not profile.symptom_location:
            questions.append({
                'category': 'symptom',
                'field': 'location',
                'question': ComprehensiveQuestionGenerator.SYMPTOM_QUESTIONS['location'],
                'priority': 4,
                'reason': 'Narrows diagnosis'
            })
        
        if not profile.symptom_character:
            questions.append({
                'category': 'symptom',
                'field': 'character',
                'question': ComprehensiveQuestionGenerator.SYMPTOM_QUESTIONS['character'],
                'priority': 4,
                'reason': 'Identifies symptom type'
            })
        
        if not profile.symptom_duration:
            questions.append({
                'category': 'symptom',
                'field': 'duration',
                'question': ComprehensiveQuestionGenerator.SYMPTOM_QUESTIONS['duration'],
                'priority': 4,
                'reason': 'Indicates acuity'
            })
        
        # PRIORITY 5: Symptom Modifiers
        if not profile.aggravating_factors:
            questions.append({
                'category': 'symptom',
                'field': 'aggravating',
                'question': ComprehensiveQuestionGenerator.SYMPTOM_QUESTIONS['aggravating'],
                'priority': 5,
                'reason': 'Helps identify triggers'
            })
        
        if not profile.relieving_factors:
            questions.append({
                'category': 'symptom',
                'field': 'relieving',
                'question': ComprehensiveQuestionGenerator.SYMPTOM_QUESTIONS['relieving'],
                'priority': 5,
                'reason': 'Guides treatment'
            })
        
        if not profile.associated_symptoms:
            questions.append({
                'category': 'symptom',
                'field': 'associated',
                'question': ComprehensiveQuestionGenerator.SYMPTOM_QUESTIONS['associated'],
                'priority': 5,
                'reason': 'Identifies related conditions'
            })
        
        # PRIORITY 6: Pattern Recognition
        if not profile.time_pattern:
            questions.append({
                'category': 'pattern',
                'field': 'time_pattern',
                'question': ComprehensiveQuestionGenerator.PATTERN_QUESTIONS['time_pattern'],
                'priority': 6,
                'reason': 'Identifies patterns'
            })
        
        if not profile.progression:
            questions.append({
                'category': 'pattern',
                'field': 'progression',
                'question': ComprehensiveQuestionGenerator.PATTERN_QUESTIONS['progression'],
                'priority': 6,
                'reason': 'Tracks improvement'
            })
        
        # PRIORITY 7: Risk Factors (for comprehensive assessment)
        if profile.stress_level is None:
            questions.append({
                'category': 'risk_factor',
                'field': 'stress',
                'question': ComprehensiveQuestionGenerator.RISK_FACTOR_QUESTIONS['stress'],
                'priority': 7,
                'reason': 'Identifies contributing factors'
            })
        
        # PRIORITY 8: Lifestyle Factors (lower priority)
        if not profile.smoking_status:
            questions.append({
                'category': 'risk_factor',
                'field': 'smoking',
                'question': ComprehensiveQuestionGenerator.RISK_FACTOR_QUESTIONS['smoking'],
                'priority': 8,
                'reason': 'Risk factor assessment'
            })
        
        # Sort by priority
        questions.sort(key=lambda x: x['priority'])
        
        return questions
    
    @staticmethod
    def generate_combined_question(profile: PatientProfile, max_questions: int = 3) -> str:
        """
        Generate a single combined question asking for multiple pieces of information
        Prioritizes most important missing information
        """
        prioritized = ComprehensiveQuestionGenerator.generate_prioritized_questions(profile)
        
        if not prioritized:
            return None
        
        # Take top N questions
        top_questions = prioritized[:max_questions]
        
        # Build combined question
        if len(top_questions) == 1:
            return top_questions[0]['question']
        
        # Combine multiple questions
        question_parts = []
        for i, q in enumerate(top_questions):
            if i == 0:
                question_parts.append(q['question'])
            elif i == len(top_questions) - 1:
                question_parts.append(f"and {q['question'].lower()}")
            else:
                question_parts.append(q['question'].lower())
        
        return ", ".join(question_parts[:-1]) + " " + question_parts[-1] if len(question_parts) > 1 else question_parts[0]
    
    @staticmethod
    def get_information_summary(profile: PatientProfile) -> str:
        """Get summary of what information we have and what's missing"""
        completeness = profile.calculate_completeness()
        missing_critical = profile.get_missing_critical_info()
        
        summary = f"Profile Completeness: {completeness}%\n"
        
        if missing_critical:
            summary += f"Missing Critical Info: {', '.join(missing_critical)}\n"
        else:
            summary += "All critical information collected!\n"
        
        summary += f"Risk Level: {profile.get_risk_level()}\n"
        
        return summary


# Initialize generator
comprehensive_question_generator = ComprehensiveQuestionGenerator()
