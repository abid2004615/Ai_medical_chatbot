"""
Positive Recovery Messaging System
Replaces negative/alarming language with positive, motivational responses
"""

import re
from typing import Dict, List


class PositiveMessaging:
    """Converts messages to positive, supportive tone"""
    
    def __init__(self):
        self.severity_messages = self.load_severity_messages()
        self.positive_phrases = self.load_positive_phrases()
        self.negative_patterns = self.load_negative_patterns()
    
    def load_severity_messages(self) -> Dict:
        """Load positive messages for each severity level"""
        return {
            'minimal': [
                "This is very common and usually resolves quickly! 😊",
                "Great news! This is typically minor and improves on its own. 🌟",
                "You're doing the right thing by checking! This is usually nothing to worry about. ✨",
                "This is quite common and most people feel better soon! 👍"
            ],
            'mild': [
                "Let's monitor this together. You're taking the right steps! 👍",
                "You're being proactive about your health, which is wonderful! 😊",
                "This is manageable with some care. You've got this! 💪",
                "Many people experience this and recover well. Let's track your progress! 📊"
            ],
            'moderate': [
                "I recommend seeing a doctor soon for proper care. You're doing great by seeking help! 💪",
                "Let's get you the right care. A doctor visit would be helpful for this. 🏥",
                "You're taking good care of yourself! A medical professional can help you feel better soon. 😊",
                "This deserves attention from a healthcare provider. You're on the right track! 🎯"
            ],
            'severe': [
                "This needs medical attention. Please visit a doctor today. I'm here to support you! 💪",
                "Let's get you proper care right away. Please see a doctor today. You're doing the right thing! 🏥",
                "Your health is important! Please visit a healthcare provider today for evaluation. 😊",
                "I recommend seeing a doctor today. Taking action now is the best step! 🎯"
            ],
            'critical': [
                "Please seek emergency care immediately. Call 911 or go to the ER. Help is available! 🚑",
                "This requires immediate medical attention. Please call 911 now. Stay calm, you're taking the right action! 🏥",
                "Please go to the emergency room right away or call 911. Medical help is ready for you! 🚨",
                "Immediate care is needed. Please call 911 or go to the nearest ER now. You're doing the right thing! 🚑"
            ]
        }
    
    def load_positive_phrases(self) -> Dict:
        """Load positive replacement phrases"""
        return {
            'greeting': [
                "You're doing great by seeking information! 😊",
                "I'm here to help you feel better! 🌟",
                "Let's work together to understand what's going on! 💪",
                "You're taking good care of your health! ✨"
            ],
            'encouragement': [
                "You're on the right track! 👍",
                "You've got this! 💪",
                "You're doing wonderfully! 🌟",
                "Keep up the great work! ✨",
                "You're making smart health decisions! 🎯"
            ],
            'progress': [
                "Let's track your progress this week and see how you're doing! 📊",
                "You're making progress! Keep it up! 🎉",
                "Things are looking better! 👏",
                "You're on your way to feeling better! ✨",
                "Great progress! Let's keep monitoring! 📈"
            ],
            'recovery': [
                "Minor issues like this usually improve soon with care. 😊",
                "Most people recover well from this! 💪",
                "With proper care, you'll be feeling better soon! 🌟",
                "Recovery is often quick with the right approach! ✨",
                "You're taking the right steps toward feeling better! 🎯"
            ],
            'support': [
                "I'm here to support you! 💙",
                "You're not alone in this! 🤝",
                "We'll figure this out together! 💪",
                "I'm here to help every step of the way! 🌟",
                "You have support on your health journey! ✨"
            ]
        }
    
    def load_negative_patterns(self) -> List[Dict]:
        """Load patterns to replace negative language"""
        return [
            {
                'pattern': r'\b(warning|alert|danger|serious|severe)\b',
                'replacement': 'important to note',
                'context': 'general'
            },
            {
                'pattern': r'\byou (have|might have|could have)\b',
                'replacement': 'this may be',
                'context': 'diagnosis'
            },
            {
                'pattern': r'\bseek immediate (medical )?attention\b',
                'replacement': 'consider seeing a doctor soon',
                'context': 'non-emergency'
            },
            {
                'pattern': r'\b(bad|worse|worsening|deteriorating)\b',
                'replacement': 'needs attention',
                'context': 'condition'
            },
            {
                'pattern': r'\b(don\'t|do not|never)\b',
                'replacement': 'it\'s best to avoid',
                'context': 'advice'
            }
        ]
    
    def reframe_message(self, message: str, severity: str = 'mild') -> str:
        """Convert message to positive tone"""
        
        # Don't modify emergency messages
        if severity == 'critical':
            return self.add_supportive_tone(message, severity)
        
        # Replace negative patterns
        reframed = message
        for pattern_dict in self.negative_patterns:
            if severity != 'severe' or pattern_dict['context'] != 'emergency':
                reframed = re.sub(
                    pattern_dict['pattern'],
                    pattern_dict['replacement'],
                    reframed,
                    flags=re.IGNORECASE
                )
        
        # Add positive framing
        reframed = self.add_supportive_tone(reframed, severity)
        
        return reframed
    
    def add_supportive_tone(self, message: str, severity: str) -> str:
        """Add supportive, encouraging tone to message"""
        
        # Add appropriate emoji based on severity
        emoji_map = {
            'minimal': '😊',
            'mild': '👍',
            'moderate': '💪',
            'severe': '🏥',
            'critical': '🚑'
        }
        
        # Add severity-appropriate message
        severity_msg = self.severity_messages.get(severity, self.severity_messages['mild'])[0]
        
        # Combine with supportive language
        if severity in ['minimal', 'mild']:
            return f"{message}\n\n{severity_msg}"
        elif severity == 'moderate':
            return f"{message}\n\n{severity_msg}"
        elif severity == 'severe':
            return f"{message}\n\n{severity_msg}"
        else:  # critical
            return f"⚠️ {message}\n\n{severity_msg}"
    
    def add_recovery_message(self, message: str) -> str:
        """Add motivational recovery message"""
        recovery_msg = self.positive_phrases['recovery'][0]
        return f"{message}\n\n💪 {recovery_msg}"
    
    def add_progress_tracking(self, message: str) -> str:
        """Add progress tracking encouragement"""
        progress_msg = self.positive_phrases['progress'][0]
        return f"{message}\n\n📊 {progress_msg}"
    
    def get_greeting_message(self) -> str:
        """Get positive greeting message"""
        return self.positive_phrases['greeting'][0]
    
    def get_encouragement(self) -> str:
        """Get random encouragement message"""
        import random
        return random.choice(self.positive_phrases['encouragement'])
    
    def format_care_tips(self, tips: List[str]) -> str:
        """Format care tips with positive language"""
        formatted_tips = []
        formatted_tips.append("**Here are some helpful care suggestions:** 🌟\n")
        
        for tip in tips:
            # Make tips more positive
            positive_tip = tip.replace("Avoid", "It's best to avoid")
            positive_tip = positive_tip.replace("Don't", "Try not to")
            positive_tip = positive_tip.replace("Stop", "Consider stopping")
            formatted_tips.append(f"✨ {positive_tip}")
        
        formatted_tips.append("\n💪 You're taking great steps toward feeling better!")
        
        return "\n".join(formatted_tips)
    
    def create_motivational_message(self, condition: str, severity: str) -> str:
        """Create condition-specific motivational message"""
        
        messages = {
            'headache': "Headaches are very common and most resolve with rest and care. You're doing the right thing by addressing it! 😊",
            'fever': "Fever shows your body is fighting! With proper rest and care, you'll be feeling better soon. 💪",
            'cough': "Coughs can be annoying, but they usually improve within a week or two. Hang in there! 🌟",
            'rash': "Skin issues are common and most clear up with proper care. You're on the right track! ✨",
            'cold': "Colds are temporary! Most people feel much better within a week. Rest up! 😊",
            'allergy': "Allergies are manageable! Identifying triggers helps you feel better. You've got this! 💪"
        }
        
        return messages.get(condition.lower(), "You're taking good care of your health! Keep it up! 🌟")


# Global positive messaging instance
positive_messaging = PositiveMessaging()
