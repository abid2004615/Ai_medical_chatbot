"""
Interactive User Profile Registration System
Collects user information in a conversational, friendly manner
"""
from typing import Dict, List, Optional, Tuple
from database import db
import re
from datetime import datetime

class ProfileRegistrationFlow:
    """Manages the conversational flow for user profile registration"""
    
    # Registration questions in order
    REGISTRATION_QUESTIONS = [
        {
            'id': 'name',
            'question': "👋 Hello! Before we begin, I'd like to know a few basic details to personalize your medical assistance.\n\nWhat's your full name?",
            'field': 'name',
            'validation': lambda x: len(x.strip()) > 0,
            'error_message': "Please provide your name."
        },
        {
            'id': 'age',
            'question': "How old are you?",
            'field': 'age',
            'validation': lambda x: x.isdigit() and 0 < int(x) < 150,
            'error_message': "Please provide a valid age (1-150).",
            'parser': lambda x: int(x)
        },
        {
            'id': 'gender',
            'question': "What's your gender? (Male/Female/Other)",
            'field': 'gender',
            'validation': lambda x: x.lower() in ['male', 'female', 'other', 'm', 'f'],
            'error_message': "Please specify Male, Female, or Other.",
            'parser': lambda x: x.capitalize() if x.lower() in ['male', 'female', 'other'] else ('Male' if x.lower() == 'm' else 'Female')
        },
        {
            'id': 'weight',
            'question': "What's your weight in kilograms? (e.g., 70)",
            'field': 'weight_kg',
            'validation': lambda x: re.match(r'^\d+(\.\d+)?$', x) and 10 < float(x) < 300,
            'error_message': "Please provide a valid weight in kg (10-300).",
            'parser': lambda x: float(x)
        },
        {
            'id': 'height',
            'question': "What's your height in centimeters? (e.g., 172)",
            'field': 'height_cm',
            'validation': lambda x: re.match(r'^\d+(\.\d+)?$', x) and 50 < float(x) < 250,
            'error_message': "Please provide a valid height in cm (50-250).",
            'parser': lambda x: float(x)
        },
        {
            'id': 'blood_group',
            'question': "What's your blood group? (e.g., O+, A-, B+, AB+)\n(Type 'skip' if you don't know)",
            'field': 'blood_group',
            'validation': lambda x: x.lower() == 'skip' or re.match(r'^(A|B|AB|O)[+-]$', x.upper()),
            'error_message': "Please provide a valid blood group (A+, A-, B+, B-, AB+, AB-, O+, O-) or type 'skip'.",
            'parser': lambda x: None if x.lower() == 'skip' else x.upper(),
            'optional': True
        },
        {
            'id': 'allergies',
            'question': "🩺 Now for medical information...\n\nDo you have any known allergies? (medicines, food, dust, etc.)\n(Type 'none' if you don't have any)",
            'field': 'allergies',
            'validation': lambda x: len(x.strip()) > 0,
            'error_message': "Please list your allergies or type 'none'.",
            'parser': lambda x: [] if x.lower() == 'none' else [a.strip() for a in x.split(',')]
        },
        {
            'id': 'chronic_conditions',
            'question': "Do you have any ongoing medical conditions? (e.g., asthma, diabetes, migraine)\n(Type 'none' if you don't have any)",
            'field': 'chronic_conditions',
            'validation': lambda x: len(x.strip()) > 0,
            'error_message': "Please list your conditions or type 'none'.",
            'parser': lambda x: [] if x.lower() == 'none' else [c.strip() for c in x.split(',')]
        },
        {
            'id': 'medications',
            'question': "Are you currently taking any medications? If yes, please list them.\n(Type 'none' if you're not taking any)",
            'field': 'current_medications',
            'validation': lambda x: len(x.strip()) > 0,
            'error_message': "Please list your medications or type 'none'.",
            'parser': lambda x: [] if x.lower() == 'none' else [m.strip() for m in x.split(',')]
        },
        {
            'id': 'injuries',
            'question': "Have you had any major injuries or surgeries in the past?\n(Type 'none' if you haven't)",
            'field': 'past_injuries',
            'validation': lambda x: len(x.strip()) > 0,
            'error_message': "Please describe any injuries/surgeries or type 'none'.",
            'parser': lambda x: [] if x.lower() == 'none' else [i.strip() for i in x.split(',')],
            'optional': True
        }
    ]
    
    @staticmethod
    def get_welcome_message() -> str:
        """Get the welcome message for profile registration"""
        return """👋 **Welcome to MediChat!**

Before we begin, I'd like to create your health profile. This helps me:
✅ Recommend safe medicines
✅ Check for allergies
✅ Monitor your health progress
✅ Provide personalized care

📋 I'll ask you a few questions (takes about 2 minutes)

🔒 **Your data is private and secure** - only used to personalize your care.

Ready to start? Let's begin with your basic information! 😊"""
    
    @staticmethod
    def get_question(step: int) -> Optional[Dict]:
        """Get question for current step"""
        if 0 <= step < len(ProfileRegistrationFlow.REGISTRATION_QUESTIONS):
            return ProfileRegistrationFlow.REGISTRATION_QUESTIONS[step]
        return None
    
    @staticmethod
    def validate_response(step: int, response: str) -> Tuple[bool, Optional[str]]:
        """Validate user response for current step"""
        question = ProfileRegistrationFlow.get_question(step)
        if not question:
            return False, "Invalid step"
        
        if question['validation'](response):
            return True, None
        else:
            return False, question['error_message']
    
    @staticmethod
    def parse_response(step: int, response: str):
        """Parse and convert response to appropriate type"""
        question = ProfileRegistrationFlow.get_question(step)
        if not question:
            return response
        
        if 'parser' in question:
            return question['parser'](response)
        return response
    
    @staticmethod
    def generate_summary(profile_data: Dict) -> str:
        """Generate a summary of collected information"""
        summary = "📋 **Here's what I have:**\n\n"
        summary += f"👤 **Name:** {profile_data.get('name', 'N/A')}\n"
        summary += f"🎂 **Age:** {profile_data.get('age', 'N/A')}\n"
        summary += f"⚧ **Gender:** {profile_data.get('gender', 'N/A')}\n"
        summary += f"⚖️ **Weight:** {profile_data.get('weight_kg', 'N/A')} kg\n"
        summary += f"📏 **Height:** {profile_data.get('height_cm', 'N/A')} cm\n"
        
        if profile_data.get('blood_group'):
            summary += f"🩸 **Blood Group:** {profile_data['blood_group']}\n"
        
        summary += "\n🩺 **Medical Information:**\n"
        
        allergies = profile_data.get('allergies', [])
        if allergies:
            summary += f"⚠️ **Allergies:** {', '.join(allergies)}\n"
        else:
            summary += "⚠️ **Allergies:** None\n"
        
        conditions = profile_data.get('chronic_conditions', [])
        if conditions:
            summary += f"🏥 **Chronic Conditions:** {', '.join(conditions)}\n"
        else:
            summary += "🏥 **Chronic Conditions:** None\n"
        
        medications = profile_data.get('current_medications', [])
        if medications:
            summary += f"💊 **Medications:** {', '.join(medications)}\n"
        else:
            summary += "💊 **Medications:** None\n"
        
        injuries = profile_data.get('past_injuries', [])
        if injuries:
            summary += f"🩹 **Past Injuries:** {', '.join(injuries)}\n"
        
        summary += "\n❓ **Is this information correct?**\n"
        summary += "Reply 'yes' to save, or 'edit' to make changes."
        
        return summary
    
    @staticmethod
    def save_profile(user_id: str, profile_data: Dict) -> bool:
        """Save profile to database"""
        try:
            # Create user profile
            success = db.create_user_profile(
                user_id=user_id,
                name=profile_data.get('name'),
                age=profile_data.get('age'),
                gender=profile_data.get('gender'),
                blood_group=profile_data.get('blood_group'),
                weight_kg=profile_data.get('weight_kg'),
                height_cm=profile_data.get('height_cm')
            )
            
            if not success:
                return False
            
            # Calculate and update BMI
            if profile_data.get('weight_kg') and profile_data.get('height_cm'):
                height_m = profile_data['height_cm'] / 100
                bmi = round(profile_data['weight_kg'] / (height_m ** 2), 1)
                db.update_user_profile(user_id, bmi=bmi)
            
            # Add allergies
            allergies = profile_data.get('allergies', [])
            for allergy in allergies:
                # Determine allergy type
                allergy_lower = allergy.lower()
                if any(drug in allergy_lower for drug in ['penicillin', 'aspirin', 'ibuprofen', 'medication', 'medicine', 'drug']):
                    allergy_type = 'drug'
                elif any(food in allergy_lower for food in ['peanut', 'milk', 'egg', 'shellfish', 'wheat', 'soy', 'food']):
                    allergy_type = 'food'
                else:
                    allergy_type = 'environmental'
                
                db.add_allergy(user_id, allergy_type, allergy, 'unknown')
            
            # Add chronic conditions
            conditions = profile_data.get('chronic_conditions', [])
            for condition in conditions:
                db.add_chronic_condition(user_id, condition, None, 'unknown')
            
            # Add medications
            medications = profile_data.get('current_medications', [])
            for medication in medications:
                db.add_medication(user_id, medication, None, None)
            
            # Add injuries to medical history
            injuries = profile_data.get('past_injuries', [])
            for injury in injuries:
                db.add_symptom_to_history(
                    user_id=user_id,
                    symptom_name=injury,
                    symptom_date=None,
                    diagnosis="Past injury/surgery"
                )
            
            # Add welcome note
            db.add_doctor_note(
                user_id=user_id,
                note_text="Profile created successfully. Welcome to MediChat!",
                note_type="registration",
                created_by="System"
            )
            
            return True
            
        except Exception as e:
            print(f"Error saving profile: {e}")
            return False
    
    @staticmethod
    def get_success_message(name: str) -> str:
        """Get success message after profile creation"""
        return f"""✅ **Your health profile has been created successfully, {name}!**

I'll use this information to:
✅ Make safer medication recommendations
✅ Check for drug allergies before prescribing
✅ Provide age-appropriate dosing
✅ Track your health progress over time

🩺 **You're all set!** Now, how can I help you today?

💬 You can tell me about any symptoms you're experiencing, and I'll provide personalized medical guidance."""


# Initialize registration flow
registration_flow = ProfileRegistrationFlow()
