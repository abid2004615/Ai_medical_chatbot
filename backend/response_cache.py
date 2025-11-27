"""
Response Cache System
Implements caching for frequent queries to improve response times
"""

import hashlib
import json
import time
from typing import Optional, Dict, Any
from collections import OrderedDict
from datetime import datetime, timedelta


class LRUCache:
    """Least Recently Used Cache implementation"""
    
    def __init__(self, capacity: int = 100):
        self.cache = OrderedDict()
        self.capacity = capacity
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key in self.cache:
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            self.hits += 1
            
            # Check if expired
            value, expiry = self.cache[key]
            if expiry and datetime.now() > expiry:
                del self.cache[key]
                self.misses += 1
                return None
            
            return value
        
        self.misses += 1
        return None
    
    def put(self, key: str, value: Any, ttl: int = 3600):
        """Put value in cache with TTL (time to live) in seconds"""
        if key in self.cache:
            self.cache.move_to_end(key)
        
        expiry = datetime.now() + timedelta(seconds=ttl) if ttl else None
        self.cache[key] = (value, expiry)
        
        # Remove oldest if over capacity
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
    
    def clear(self):
        """Clear all cache"""
        self.cache.clear()
        self.hits = 0
        self.misses = 0
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        
        return {
            'size': len(self.cache),
            'capacity': self.capacity,
            'hits': self.hits,
            'misses': self.misses,
            'hit_rate': f"{hit_rate:.2f}%"
        }


class ResponseCache:
    """Response caching system for medical queries"""
    
    def __init__(self, capacity: int = 100):
        self.cache = LRUCache(capacity)
        
        # Pre-load common queries
        self.preload_common_queries()
    
    def generate_cache_key(self, query: str, user_context: Optional[Dict] = None) -> str:
        """Generate cache key from query and context"""
        # Normalize query
        normalized_query = query.lower().strip()
        
        # Include relevant context (age, gender) but not personal info
        context_str = ""
        if user_context:
            age = user_context.get('age', '')
            gender = user_context.get('gender', '')
            context_str = f"{age}_{gender}"
        
        # Create hash
        cache_string = f"{normalized_query}_{context_str}"
        return hashlib.md5(cache_string.encode()).hexdigest()
    
    def get_cached_response(self, query: str, user_context: Optional[Dict] = None) -> Optional[str]:
        """Get cached response if available"""
        cache_key = self.generate_cache_key(query, user_context)
        return self.cache.get(cache_key)
    
    def cache_response(self, query: str, response: str, user_context: Optional[Dict] = None, ttl: int = 3600):
        """Cache a response"""
        cache_key = self.generate_cache_key(query, user_context)
        self.cache.put(cache_key, response, ttl)
    
    def preload_common_queries(self):
        """Pre-load responses for common queries"""
        common_queries = {
            "what is fever": "Fever is a temporary increase in body temperature, often due to an illness. Normal body temperature is around 98.6°F (37°C). A fever is generally considered when temperature is 100.4°F (38°C) or higher. Fever is a sign that your body is fighting an infection.",
            
            "what is headache": "A headache is pain or discomfort in the head or face area. Common types include tension headaches, migraines, and cluster headaches. Most headaches are not serious, but some can indicate underlying conditions.",
            
            "what causes cough": "Coughing is a reflex that helps clear your airways. Common causes include: viral infections (cold, flu), allergies, asthma, acid reflux, or irritants like smoke. Most coughs resolve on their own within a few weeks.",
            
            "what is allergy": "An allergy is your immune system's reaction to a foreign substance (allergen) that's usually harmless. Common allergens include pollen, dust mites, pet dander, certain foods, and medications. Symptoms can range from mild to severe.",
            
            "what is cold": "The common cold is a viral infection of your upper respiratory tract. Symptoms include runny nose, sore throat, cough, and congestion. Colds usually resolve within 7-10 days with rest and fluids.",
            
            "what is flu": "Influenza (flu) is a contagious respiratory illness caused by influenza viruses. Symptoms include fever, body aches, fatigue, cough, and sore throat. Flu is more severe than a common cold.",
            
            "what is rash": "A rash is a change in skin appearance, often involving redness, bumps, or irritation. Rashes can be caused by allergies, infections, heat, or irritants. Most rashes are harmless and resolve on their own.",
            
            "what is sore throat": "A sore throat is pain, scratchiness, or irritation of the throat that often worsens when you swallow. Common causes include viral infections, bacterial infections (strep throat), allergies, or dry air.",
        }
        
        for query, response in common_queries.items():
            self.cache_response(query, response, ttl=86400)  # Cache for 24 hours
    
    def clear_cache(self):
        """Clear all cached responses"""
        self.cache.clear()
        self.preload_common_queries()
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        return self.cache.get_stats()


# Global cache instance
response_cache = ResponseCache(capacity=200)


# Symptom tree pre-loading
class SymptomTree:
    """Pre-loaded symptom decision trees for fast responses"""
    
    def __init__(self):
        self.trees = self.load_symptom_trees()
    
    def load_symptom_trees(self) -> Dict:
        """Load common symptom decision trees"""
        return {
            'headache': {
                'questions': [
                    {'id': 'severity', 'text': 'How severe is the pain?', 'options': ['Mild', 'Moderate', 'Severe']},
                    {'id': 'location', 'text': 'Where is the pain?', 'options': ['Front', 'Back', 'Sides', 'All over']},
                    {'id': 'duration', 'text': 'How long have you had it?', 'options': ['Just now', 'Few hours', 'Days', 'Weeks']}
                ],
                'causes': ['Tension', 'Migraine', 'Sinus', 'Dehydration', 'Stress']
            },
            'fever': {
                'questions': [
                    {'id': 'temperature', 'text': 'What is your temperature?', 'options': ['99-100°F', '101-102°F', '103°F+']},
                    {'id': 'duration', 'text': 'How long have you had fever?', 'options': ['Today', '1-2 days', '3+ days']},
                    {'id': 'symptoms', 'text': 'Other symptoms?', 'options': ['Cough', 'Body ache', 'Sore throat', 'None']}
                ],
                'causes': ['Viral infection', 'Bacterial infection', 'Flu', 'COVID-19']
            },
            'cough': {
                'questions': [
                    {'id': 'type', 'text': 'Type of cough?', 'options': ['Dry', 'Wet/Productive', 'Barking']},
                    {'id': 'duration', 'text': 'How long?', 'options': ['Few days', '1-2 weeks', '3+ weeks']},
                    {'id': 'triggers', 'text': 'What triggers it?', 'options': ['Night', 'Exercise', 'Cold air', 'Always']}
                ],
                'causes': ['Common cold', 'Allergies', 'Asthma', 'Bronchitis', 'Acid reflux']
            },
            'rash': {
                'questions': [
                    {'id': 'location', 'text': 'Where is the rash?', 'options': ['Face', 'Arms', 'Legs', 'Torso', 'Multiple']},
                    {'id': 'appearance', 'text': 'How does it look?', 'options': ['Red bumps', 'Flat red', 'Blisters', 'Dry/Scaly']},
                    {'id': 'sensation', 'text': 'How does it feel?', 'options': ['Itchy', 'Painful', 'No sensation']}
                ],
                'causes': ['Allergy', 'Eczema', 'Heat rash', 'Contact dermatitis', 'Infection']
            }
        }
    
    def get_tree(self, symptom: str) -> Optional[Dict]:
        """Get symptom tree for fast loading"""
        return self.trees.get(symptom.lower())
    
    def get_all_symptoms(self) -> list:
        """Get list of all pre-loaded symptoms"""
        return list(self.trees.keys())


# Global symptom tree instance
symptom_tree = SymptomTree()
