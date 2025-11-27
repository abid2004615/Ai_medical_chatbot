"""
Rash Cause Detection System
Intelligent rash detection based on user-described symptoms
"""

from typing import Dict, List, Optional
from datetime import datetime


class RashDetector:
    """Detects and analyzes rash causes based on symptoms"""
    
    def __init__(self):
        self.rash_patterns = self.load_rash_patterns()
    
    def load_rash_patterns(self) -> Dict:
        """Load rash pattern database"""
        return {
            'contact_dermatitis': {
                'triggers': ['new_soap', 'detergent', 'chemicals', 'plants', 'jewelry'],
                'locations': ['hands', 'arms', 'face', 'anywhere_contact'],
                'appearance': ['red', 'bumpy', 'blisters'],
                'sensation': ['itchy', 'burning'],
                'duration': ['hours', '1-3_days'],
                'description': 'Contact dermatitis occurs when your skin reacts to something it touches. This is often caused by soaps, detergents, plants (like poison ivy), or chemicals.',
                'care_tips': [
                    'Avoid the trigger substance',
                    'Wash the area gently with mild soap',
                    'Apply cool compresses',
                    'Consider over-the-counter hydrocortisone cream',
                    'Keep the area moisturized'
                ]
            },
            'heat_rash': {
                'triggers': ['hot_weather', 'exercise', 'sweating'],
                'locations': ['neck', 'chest', 'back', 'skin_folds'],
                'appearance': ['small_bumps', 'red', 'clusters'],
                'sensation': ['itchy', 'prickly'],
                'duration': ['hours', '1-3_days'],
                'description': 'Heat rash develops when sweat ducts become blocked and sweat gets trapped under your skin. This is common in hot, humid weather.',
                'care_tips': [
                    'Move to a cooler environment',
                    'Wear loose, breathable clothing',
                    'Keep the area dry',
                    'Avoid heavy creams or ointments',
                    'Take cool showers'
                ]
            },
            'allergic_reaction': {
                'triggers': ['food', 'medication', 'insect_bite', 'pollen'],
                'locations': ['face', 'arms', 'legs', 'widespread'],
                'appearance': ['hives', 'welts', 'red_patches'],
                'sensation': ['very_itchy', 'swelling'],
                'duration': ['minutes', 'hours', '1-3_days'],
                'description': 'An allergic reaction occurs when your immune system responds to an allergen. This can cause hives, itching, and swelling.',
                'care_tips': [
                    'Identify and avoid the allergen',
                    'Consider antihistamines (consult pharmacist)',
                    'Apply cool compresses',
                    'Avoid scratching',
                    'Seek immediate care if breathing difficulty or severe swelling occurs'
                ]
            },
            'eczema': {
                'triggers': ['dry_skin', 'irritants', 'stress', 'allergens'],
                'locations': ['hands', 'feet', 'elbows', 'knees', 'face'],
                'appearance': ['dry', 'scaly', 'red', 'thickened'],
                'sensation': ['very_itchy', 'dry'],
                'duration': ['days', 'weeks', 'chronic'],
                'description': 'Eczema (atopic dermatitis) is a condition that makes your skin red, inflamed, and itchy. It often appears in childhood but can occur at any age.',
                'care_tips': [
                    'Moisturize frequently with fragrance-free products',
                    'Avoid harsh soaps and hot water',
                    'Identify and avoid triggers',
                    'Consider seeing a dermatologist for persistent cases',
                    'Keep nails short to prevent scratching damage'
                ]
            },
            'fungal_infection': {
                'triggers': ['moisture', 'warmth', 'poor_hygiene'],
                'locations': ['feet', 'groin', 'skin_folds', 'nails'],
                'appearance': ['red', 'scaly', 'ring_shaped', 'peeling'],
                'sensation': ['itchy', 'burning'],
                'duration': ['days', 'weeks'],
                'description': 'Fungal infections like ringworm or athlete\'s foot are caused by fungi that thrive in warm, moist environments.',
                'care_tips': [
                    'Keep the area clean and dry',
                    'Consider over-the-counter antifungal creams',
                    'Wear breathable clothing and shoes',
                    'Avoid sharing towels or clothing',
                    'See a doctor if it doesn\'t improve in 2 weeks'
                ]
            },
            'viral_rash': {
                'triggers': ['viral_infection', 'fever'],
                'locations': ['torso', 'face', 'widespread'],
                'appearance': ['small_spots', 'red', 'flat_or_raised'],
                'sensation': ['mild_itch', 'no_sensation'],
                'duration': ['days', '1-2_weeks'],
                'description': 'Viral rashes can accompany viral infections like measles, chickenpox, or other viral illnesses. They often appear with other symptoms like fever.',
                'care_tips': [
                    'Rest and stay hydrated',
                    'Manage fever if present',
                    'Avoid scratching',
                    'The rash usually resolves as the infection clears',
                    'Consult a doctor if concerned or if symptoms worsen'
                ]
            }
        }
    
    def analyze_symptoms(self, location: str, duration: str, sensation: str, 
                        exposure: List[str], appearance: Optional[str] = None) -> Dict:
        """Analyze rash symptoms and return likely causes"""
        
        # Score each rash type
        scores = {}
        for rash_type, pattern in self.rash_patterns.items():
            score = 0
            
            # Check location match
            if location.lower() in pattern['locations']:
                score += 3
            
            # Check duration match
            if duration.lower() in pattern['duration']:
                score += 2
            
            # Check sensation match
            if sensation.lower() in pattern['sensation']:
                score += 3
            
            # Check exposure/triggers
            for exp in exposure:
                if exp.lower() in pattern['triggers']:
                    score += 4
            
            # Check appearance if provided
            if appearance and appearance.lower() in pattern['appearance']:
                score += 2
            
            scores[rash_type] = score
        
        # Sort by score
        sorted_causes = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        # Get top 3 likely causes
        likely_causes = []
        for rash_type, score in sorted_causes[:3]:
            if score > 0:
                pattern = self.rash_patterns[rash_type]
                likely_causes.append({
                    'type': rash_type.replace('_', ' ').title(),
                    'score': score,
                    'description': pattern['description'],
                    'care_tips': pattern['care_tips']
                })
        
        return {
            'likely_causes': likely_causes,
            'analysis_time': datetime.now().isoformat(),
            'disclaimer': 'This is educational information only. Please consult a healthcare provider for proper diagnosis and treatment.'
        }
    
    def get_questions(self) -> List[Dict]:
        """Get structured questions for rash detection"""
        return [
            {
                'id': 'location',
                'question': 'Where is the rash located?',
                'options': [
                    'Face',
                    'Arms',
                    'Legs',
                    'Torso (chest/back)',
                    'Hands',
                    'Feet',
                    'Skin folds (neck, groin)',
                    'Multiple areas'
                ],
                'required': True
            },
            {
                'id': 'duration',
                'question': 'How long have you had this rash?',
                'options': [
                    'Less than 24 hours',
                    '1-3 days',
                    '4-7 days',
                    'Over a week',
                    'Weeks or months'
                ],
                'required': True
            },
            {
                'id': 'sensation',
                'question': 'How would you describe the sensation?',
                'options': [
                    'Very itchy',
                    'Mildly itchy',
                    'Painful',
                    'Burning',
                    'Prickly',
                    'No discomfort'
                ],
                'required': True
            },
            {
                'id': 'appearance',
                'question': 'How does the rash look?',
                'options': [
                    'Red bumps',
                    'Flat red patches',
                    'Blisters',
                    'Dry and scaly',
                    'Hives or welts',
                    'Ring-shaped',
                    'Small spots'
                ],
                'required': False
            },
            {
                'id': 'exposure',
                'question': 'Have you been exposed to any of these recently? (Select all that apply)',
                'options': [
                    'New soap or detergent',
                    'Plants (poison ivy, etc.)',
                    'Chemicals or cleaning products',
                    'New medication',
                    'Food allergens',
                    'Insect bites',
                    'Pets',
                    'Hot/humid weather',
                    'None of the above'
                ],
                'required': True,
                'multiple': True
            }
        ]
    
    def format_response(self, analysis: Dict) -> str:
        """Format analysis into user-friendly response"""
        response_parts = []
        
        response_parts.append("Based on your symptoms, here are some possible causes:\n")
        
        for i, cause in enumerate(analysis['likely_causes'], 1):
            response_parts.append(f"\n**{i}. {cause['type']}**")
            response_parts.append(f"{cause['description']}\n")
            response_parts.append("**General care suggestions:**")
            for tip in cause['care_tips']:
                response_parts.append(f"• {tip}")
            response_parts.append("")
        
        response_parts.append(f"\n⚠️ **Important:** {analysis['disclaimer']}")
        response_parts.append("\n💡 **When to see a doctor:**")
        response_parts.append("• If the rash spreads rapidly")
        response_parts.append("• If you develop fever or feel unwell")
        response_parts.append("• If the rash is painful or shows signs of infection")
        response_parts.append("• If it doesn't improve within a week")
        response_parts.append("• If you have difficulty breathing or swelling (seek immediate care)")
        
        return "\n".join(response_parts)


# Global rash detector instance
rash_detector = RashDetector()
