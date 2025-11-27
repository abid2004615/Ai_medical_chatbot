"""
Medicine Name Suggestions System
Displays safe OTC medicine names without prescriptive advice
"""

from typing import Dict, List, Optional


class MedicineSuggester:
    """Suggests safe OTC medicines with appropriate disclaimers"""
    
    def __init__(self):
        self.otc_medicines = self.load_otc_medicines()
        self.disclaimer = "⚠️ **IMPORTANT:** This is educational information only. Consult a doctor or pharmacist before using any medication."
    
    def load_otc_medicines(self) -> Dict:
        """Load OTC medicine database"""
        return {
            'pain_relief': {
                'category': 'Pain Relief',
                'medicines': [
                    {
                        'name': 'Paracetamol (Acetaminophen)',
                        'generic': 'Paracetamol',
                        'brand_examples': ['Tylenol', 'Panadol'],
                        'uses': ['Headache', 'Fever', 'Body aches', 'Mild pain'],
                        'age_restrictions': 'Safe for most ages (consult for children under 2)',
                        'warnings': ['Do not exceed recommended dose', 'Avoid with liver problems', 'Limit alcohol consumption']
                    },
                    {
                        'name': 'Ibuprofen',
                        'generic': 'Ibuprofen',
                        'brand_examples': ['Advil', 'Motrin', 'Nurofen'],
                        'uses': ['Headache', 'Fever', 'Inflammation', 'Muscle pain'],
                        'age_restrictions': 'Not for children under 6 months',
                        'warnings': ['Take with food', 'Avoid with stomach ulcers', 'Not for long-term use without medical advice']
                    },
                    {
                        'name': 'Aspirin',
                        'generic': 'Aspirin',
                        'brand_examples': ['Bayer', 'Ecotrin'],
                        'uses': ['Headache', 'Fever', 'Inflammation', 'Pain'],
                        'age_restrictions': 'NOT for children under 12 (Reye\'s syndrome risk)',
                        'warnings': ['Take with food', 'Avoid with bleeding disorders', 'Not during pregnancy without medical advice']
                    }
                ]
            },
            'allergy': {
                'category': 'Allergy Relief',
                'medicines': [
                    {
                        'name': 'Cetirizine',
                        'generic': 'Cetirizine',
                        'brand_examples': ['Zyrtec', 'Alerid'],
                        'uses': ['Allergic rhinitis', 'Hay fever', 'Hives', 'Itching'],
                        'age_restrictions': 'Safe for ages 2 and up',
                        'warnings': ['May cause drowsiness', 'Avoid alcohol', 'Use caution when driving']
                    },
                    {
                        'name': 'Loratadine',
                        'generic': 'Loratadine',
                        'brand_examples': ['Claritin', 'Alavert'],
                        'uses': ['Allergic rhinitis', 'Hay fever', 'Hives'],
                        'age_restrictions': 'Safe for ages 2 and up',
                        'warnings': ['Non-drowsy for most people', 'Consult doctor if pregnant']
                    },
                    {
                        'name': 'Diphenhydramine',
                        'generic': 'Diphenhydramine',
                        'brand_examples': ['Benadryl'],
                        'uses': ['Allergies', 'Itching', 'Sleep aid', 'Motion sickness'],
                        'age_restrictions': 'Safe for ages 6 and up',
                        'warnings': ['Causes drowsiness', 'Do not drive', 'Avoid alcohol', 'Not for long-term use']
                    }
                ]
            },
            'cold_flu': {
                'category': 'Cold & Flu',
                'medicines': [
                    {
                        'name': 'Pseudoephedrine',
                        'generic': 'Pseudoephedrine',
                        'brand_examples': ['Sudafed'],
                        'uses': ['Nasal congestion', 'Sinus pressure'],
                        'age_restrictions': 'Not for children under 4',
                        'warnings': ['May increase blood pressure', 'Avoid with heart conditions', 'May cause insomnia']
                    },
                    {
                        'name': 'Guaifenesin',
                        'generic': 'Guaifenesin',
                        'brand_examples': ['Mucinex', 'Robitussin'],
                        'uses': ['Chest congestion', 'Mucus relief'],
                        'age_restrictions': 'Safe for ages 4 and up',
                        'warnings': ['Drink plenty of water', 'Consult doctor if cough persists']
                    },
                    {
                        'name': 'Dextromethorphan',
                        'generic': 'Dextromethorphan',
                        'brand_examples': ['Robitussin DM', 'Delsym'],
                        'uses': ['Dry cough suppression'],
                        'age_restrictions': 'Not for children under 4',
                        'warnings': ['Do not use with productive cough', 'Avoid with certain medications']
                    }
                ]
            },
            'digestive': {
                'category': 'Digestive Health',
                'medicines': [
                    {
                        'name': 'Omeprazole',
                        'generic': 'Omeprazole',
                        'brand_examples': ['Prilosec'],
                        'uses': ['Heartburn', 'Acid reflux', 'GERD'],
                        'age_restrictions': 'Ages 18 and up',
                        'warnings': ['Not for immediate relief', 'Take before meals', 'Consult doctor for long-term use']
                    },
                    {
                        'name': 'Ranitidine',
                        'generic': 'Ranitidine',
                        'brand_examples': ['Zantac'],
                        'uses': ['Heartburn', 'Acid indigestion'],
                        'age_restrictions': 'Ages 12 and up',
                        'warnings': ['Take as directed', 'Consult doctor if symptoms persist']
                    },
                    {
                        'name': 'Loperamide',
                        'generic': 'Loperamide',
                        'brand_examples': ['Imodium'],
                        'uses': ['Diarrhea'],
                        'age_restrictions': 'Ages 6 and up',
                        'warnings': ['Do not use with bloody diarrhea', 'Do not use with fever', 'Consult doctor if persists']
                    }
                ]
            },
            'topical': {
                'category': 'Topical Treatments',
                'medicines': [
                    {
                        'name': 'Hydrocortisone Cream',
                        'generic': 'Hydrocortisone',
                        'brand_examples': ['Cortaid', 'Cortizone-10'],
                        'uses': ['Itching', 'Rashes', 'Eczema', 'Insect bites'],
                        'age_restrictions': 'Safe for ages 2 and up',
                        'warnings': ['For external use only', 'Do not use on face without medical advice', 'Not for long-term use']
                    },
                    {
                        'name': 'Clotrimazole',
                        'generic': 'Clotrimazole',
                        'brand_examples': ['Lotrimin', 'Canesten'],
                        'uses': ['Fungal infections', 'Athlete\'s foot', 'Ringworm', 'Jock itch'],
                        'age_restrictions': 'Safe for ages 2 and up',
                        'warnings': ['Complete full course', 'Keep area clean and dry', 'Consult doctor if no improvement']
                    }
                ]
            }
        }
    
    def suggest_medicines(self, symptom_category: str, user_age: Optional[int] = None, 
                         user_allergies: Optional[List[str]] = None) -> Dict:
        """Suggest appropriate OTC medicines"""
        
        category_data = self.otc_medicines.get(symptom_category.lower())
        
        if not category_data:
            return {
                'category': 'Unknown',
                'medicines': [],
                'message': 'No specific medicine suggestions available for this symptom.',
                'disclaimer': self.disclaimer
            }
        
        # Filter medicines based on age and allergies
        suitable_medicines = []
        for medicine in category_data['medicines']:
            # Check age restrictions
            if user_age and not self.check_age_appropriate(medicine, user_age):
                continue
            
            # Check allergies
            if user_allergies and self.check_allergy_conflict(medicine, user_allergies):
                continue
            
            suitable_medicines.append(medicine)
        
        return {
            'category': category_data['category'],
            'medicines': suitable_medicines,
            'disclaimer': self.disclaimer,
            'additional_advice': 'Always read the label and follow instructions. When in doubt, ask a pharmacist or doctor.'
        }
    
    def check_age_appropriate(self, medicine: Dict, age: int) -> bool:
        """Check if medicine is age-appropriate"""
        restrictions = medicine['age_restrictions'].lower()
        
        if 'not for children under' in restrictions:
            # Extract age limit
            import re
            match = re.search(r'under (\d+)', restrictions)
            if match:
                min_age = int(match.group(1))
                return age >= min_age
        
        return True
    
    def check_allergy_conflict(self, medicine: Dict, allergies: List[str]) -> bool:
        """Check if medicine conflicts with user allergies"""
        medicine_name = medicine['generic'].lower()
        
        for allergy in allergies:
            if allergy.lower() in medicine_name or medicine_name in allergy.lower():
                return True
        
        return False
    
    def format_medicine_info(self, medicine: Dict) -> str:
        """Format medicine information for display"""
        info_parts = []
        
        info_parts.append(f"**{medicine['name']}**")
        info_parts.append(f"*Generic:* {medicine['generic']}")
        info_parts.append(f"*Brand examples:* {', '.join(medicine['brand_examples'])}")
        info_parts.append(f"\n**Common uses:**")
        for use in medicine['uses']:
            info_parts.append(f"• {use}")
        
        info_parts.append(f"\n**Age guidance:** {medicine['age_restrictions']}")
        
        info_parts.append(f"\n**Important notes:**")
        for warning in medicine['warnings']:
            info_parts.append(f"⚠️ {warning}")
        
        return "\n".join(info_parts)
    
    def format_suggestions(self, suggestions: Dict) -> str:
        """Format complete suggestions for user"""
        if not suggestions['medicines']:
            return f"{suggestions['message']}\n\n{suggestions['disclaimer']}"
        
        response_parts = []
        response_parts.append(f"**{suggestions['category']}**\n")
        response_parts.append("Here are some common over-the-counter options:\n")
        
        for i, medicine in enumerate(suggestions['medicines'], 1):
            response_parts.append(f"\n**{i}. {medicine['name']}**")
            response_parts.append(f"• Generic: {medicine['generic']}")
            response_parts.append(f"• Examples: {', '.join(medicine['brand_examples'])}")
            response_parts.append(f"• Uses: {', '.join(medicine['uses'])}")
            response_parts.append(f"• Age: {medicine['age_restrictions']}")
        
        response_parts.append(f"\n{suggestions['disclaimer']}")
        response_parts.append(f"\n💡 {suggestions['additional_advice']}")
        
        return "\n".join(response_parts)
    
    def search_medicine(self, query: str) -> Optional[Dict]:
        """Search for a specific medicine"""
        query_lower = query.lower()
        
        for category_data in self.otc_medicines.values():
            for medicine in category_data['medicines']:
                if (query_lower in medicine['name'].lower() or 
                    query_lower in medicine['generic'].lower() or
                    any(query_lower in brand.lower() for brand in medicine['brand_examples'])):
                    return {
                        'medicine': medicine,
                        'category': category_data['category'],
                        'disclaimer': self.disclaimer
                    }
        
        return None
    
    def get_all_categories(self) -> List[str]:
        """Get list of all medicine categories"""
        return [data['category'] for data in self.otc_medicines.values()]


# Global medicine suggester instance
medicine_suggester = MedicineSuggester()
