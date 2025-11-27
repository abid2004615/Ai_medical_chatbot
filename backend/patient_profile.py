"""
Comprehensive Patient Profile Management
Collects and manages detailed patient information for accurate diagnosis
"""
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class PatientProfile:
    """Complete patient information profile"""
    
    # 1. Basic Patient Information
    age: Optional[int] = None
    gender: Optional[str] = None  # Male, Female, Other
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    bmi: Optional[float] = None
    
    # Medical History
    chronic_conditions: List[str] = field(default_factory=list)  # diabetes, hypertension, etc.
    past_surgeries: List[str] = field(default_factory=list)
    family_history: List[str] = field(default_factory=list)  # family diseases
    
    # Current Medications & Allergies
    current_medications: List[Dict] = field(default_factory=list)  # {name, dosage, frequency}
    drug_allergies: List[str] = field(default_factory=list)
    food_allergies: List[str] = field(default_factory=list)
    
    # 2. Current Symptom Information
    primary_symptom: Optional[str] = None
    symptom_onset: Optional[str] = None  # when started
    symptom_duration: Optional[str] = None  # how long
    symptom_frequency: Optional[str] = None  # constant, intermittent
    severity_score: Optional[int] = None  # 1-10
    symptom_location: Optional[str] = None
    symptom_character: Optional[str] = None  # sharp, dull, throbbing
    
    # Symptom Modifiers
    aggravating_factors: List[str] = field(default_factory=list)  # what makes worse
    relieving_factors: List[str] = field(default_factory=list)  # what makes better
    associated_symptoms: List[str] = field(default_factory=list)  # other symptoms
    
    # 3. Symptom Pattern
    time_pattern: Optional[str] = None  # day/night, episodic/continuous
    trigger_events: List[str] = field(default_factory=list)  # stress, food, etc.
    progression: Optional[str] = None  # improving, stable, worsening
    
    # 4. Risk Factors
    lifestyle_factors: Dict[str, any] = field(default_factory=dict)  # sleep, diet, exercise
    smoking_status: Optional[str] = None  # never, former, current
    alcohol_consumption: Optional[str] = None  # none, occasional, regular
    caffeine_intake: Optional[str] = None
    stress_level: Optional[int] = None  # 1-10
    screen_time_hours: Optional[int] = None
    
    # Past Trauma
    past_injuries: List[str] = field(default_factory=list)
    head_trauma_history: bool = False
    
    # 5. Monitoring Data
    symptom_history: List[Dict] = field(default_factory=list)  # historical tracking
    treatment_responses: List[Dict] = field(default_factory=list)  # what worked/didn't
    
    # Metadata
    session_id: Optional[str] = None
    last_updated: Optional[datetime] = None
    completeness_score: float = 0.0  # 0-100%
    
    def calculate_bmi(self) -> Optional[float]:
        """Calculate BMI if weight and height available"""
        if self.weight_kg and self.height_cm:
            height_m = self.height_cm / 100
            self.bmi = round(self.weight_kg / (height_m ** 2), 1)
            return self.bmi
        return None
    
    def calculate_completeness(self) -> float:
        """Calculate how complete the patient profile is (0-100%)"""
        total_fields = 0
        filled_fields = 0
        
        # Critical fields (weight more)
        critical_fields = {
            'age': 3,
            'gender': 2,
            'primary_symptom': 3,
            'severity_score': 3,
            'symptom_onset': 2,
        }
        
        for field, weight in critical_fields.items():
            total_fields += weight
            if getattr(self, field) is not None:
                filled_fields += weight
        
        # Important fields
        important_fields = [
            'weight_kg', 'height_cm', 'symptom_duration', 'symptom_location',
            'symptom_character', 'symptom_frequency'
        ]
        
        for field in important_fields:
            total_fields += 1
            if getattr(self, field) is not None:
                filled_fields += 1
        
        # List fields
        list_fields = [
            'chronic_conditions', 'current_medications', 'drug_allergies',
            'associated_symptoms', 'aggravating_factors', 'relieving_factors'
        ]
        
        for field in list_fields:
            total_fields += 1
            if len(getattr(self, field)) > 0:
                filled_fields += 1
        
        self.completeness_score = round((filled_fields / total_fields) * 100, 1)
        return self.completeness_score
    
    def get_missing_critical_info(self) -> List[str]:
        """Get list of missing critical information"""
        missing = []
        
        if not self.age:
            missing.append("age")
        if not self.gender:
            missing.append("gender")
        if not self.primary_symptom:
            missing.append("primary symptom")
        if not self.severity_score:
            missing.append("severity (1-10 scale)")
        if not self.symptom_onset:
            missing.append("when symptoms started")
        if not self.symptom_duration:
            missing.append("how long symptoms have lasted")
        
        return missing
    
    def get_risk_level(self) -> str:
        """Assess overall risk level based on profile"""
        risk_score = 0
        
        # Age risk
        if self.age:
            if self.age < 2 or self.age > 65:
                risk_score += 2
            elif self.age < 12 or self.age > 50:
                risk_score += 1
        
        # Severity risk
        if self.severity_score:
            if self.severity_score >= 8:
                risk_score += 3
            elif self.severity_score >= 6:
                risk_score += 2
            elif self.severity_score >= 4:
                risk_score += 1
        
        # Chronic conditions risk
        if len(self.chronic_conditions) >= 3:
            risk_score += 2
        elif len(self.chronic_conditions) >= 1:
            risk_score += 1
        
        # Multiple medications risk
        if len(self.current_medications) >= 5:
            risk_score += 2
        elif len(self.current_medications) >= 3:
            risk_score += 1
        
        # Determine risk level
        if risk_score >= 6:
            return "HIGH"
        elif risk_score >= 4:
            return "MODERATE"
        elif risk_score >= 2:
            return "LOW"
        else:
            return "MINIMAL"
    
    def to_dict(self) -> Dict:
        """Convert profile to dictionary"""
        return {
            'age': self.age,
            'gender': self.gender,
            'weight_kg': self.weight_kg,
            'height_cm': self.height_cm,
            'bmi': self.bmi,
            'chronic_conditions': self.chronic_conditions,
            'current_medications': self.current_medications,
            'drug_allergies': self.drug_allergies,
            'primary_symptom': self.primary_symptom,
            'severity_score': self.severity_score,
            'symptom_onset': self.symptom_onset,
            'symptom_duration': self.symptom_duration,
            'associated_symptoms': self.associated_symptoms,
            'completeness_score': self.completeness_score,
            'risk_level': self.get_risk_level()
        }
    
    def get_summary(self) -> str:
        """Get human-readable summary of patient profile"""
        summary = []
        
        if self.age and self.gender:
            summary.append(f"{self.age}-year-old {self.gender}")
        
        if self.primary_symptom:
            summary.append(f"presenting with {self.primary_symptom}")
        
        if self.severity_score:
            summary.append(f"(severity: {self.severity_score}/10)")
        
        if self.chronic_conditions:
            summary.append(f"with history of {', '.join(self.chronic_conditions)}")
        
        if self.current_medications:
            med_names = [m.get('name', 'unknown') for m in self.current_medications]
            summary.append(f"currently taking {', '.join(med_names)}")
        
        return " ".join(summary) if summary else "No patient information available"


class PatientProfileExtractor:
    """Extracts patient information from conversation text"""
    
    @staticmethod
    def extract_from_text(text: str, existing_profile: Optional[PatientProfile] = None) -> PatientProfile:
        """Extract patient information from text"""
        import re
        
        profile = existing_profile or PatientProfile()
        text_lower = text.lower()
        
        # Extract age
        age_patterns = [
            r'\b(\d{1,3})\s*(?:years?\s*old|yrs?\s*old|y\.?o\.?)\b',
            r'\b(?:i\'m|i\s+am|im)\s+(\d{1,3})\b',
            r'\bage[:\s]+(\d{1,3})\b',
        ]
        for pattern in age_patterns:
            match = re.search(pattern, text_lower)
            if match:
                profile.age = int(match.group(1))
                break
        
        # Extract gender
        if any(word in text_lower for word in ['male', 'man', 'boy', 'he', 'his']):
            profile.gender = 'Male'
        elif any(word in text_lower for word in ['female', 'woman', 'girl', 'she', 'her']):
            profile.gender = 'Female'
        
        # Extract weight
        weight_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kilograms?)', text_lower)
        if weight_match:
            profile.weight_kg = float(weight_match.group(1))
        
        # Extract height
        height_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)', text_lower)
        if height_match:
            profile.height_cm = float(height_match.group(1))
        
        # Extract severity
        severity_match = re.search(r'(\d+)\s*(?:/10|out of 10|scale)', text_lower)
        if severity_match:
            profile.severity_score = int(severity_match.group(1))
        
        # Extract chronic conditions
        conditions = ['diabetes', 'hypertension', 'asthma', 'heart disease', 'kidney disease', 
                     'liver disease', 'cancer', 'arthritis', 'depression', 'anxiety']
        for condition in conditions:
            if condition in text_lower and condition not in profile.chronic_conditions:
                profile.chronic_conditions.append(condition)
        
        # Extract allergies
        if 'allergic to' in text_lower or 'allergy to' in text_lower:
            # Simple extraction - can be enhanced
            allergy_match = re.search(r'allergic to (\w+)', text_lower)
            if allergy_match:
                allergy = allergy_match.group(1)
                if allergy not in profile.drug_allergies:
                    profile.drug_allergies.append(allergy)
        
        # Update completeness
        profile.calculate_completeness()
        profile.last_updated = datetime.now()
        
        return profile


# Initialize extractor
profile_extractor = PatientProfileExtractor()
