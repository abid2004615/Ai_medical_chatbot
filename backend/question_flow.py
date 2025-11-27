"""
Interactive Question Flow System
Doctor-style clickable question flow with dynamic logic
"""

from typing import Dict, List, Optional, Any
from datetime import datetime


class QuestionFlow:
    """Manages interactive question flows with dynamic branching"""
    
    def __init__(self):
        self.flows = self.load_question_flows()
        self.current_flows = {}  # Track active flows per session
    
    def load_question_flows(self) -> Dict:
        """Load predefined question flows"""
        return {
            'headache': {
                'name': 'Headache Assessment',
                'questions': [
                    {
                        'id': 'severity',
                        'text': 'How would you describe the pain intensity?',
                        'options': ['Mild (1-3)', 'Moderate (4-6)', 'Severe (7-10)'],
                        'next': {
                            'Mild (1-3)': 'location',
                            'Moderate (4-6)': 'location',
                            'Severe (7-10)': 'emergency_check'
                        }
                    },
                    {
                        'id': 'emergency_check',
                        'text': 'Do you have any of these symptoms?',
                        'options': ['Sudden severe headache', 'Confusion', 'Vision changes', 'None of these'],
                        'next': {
                            'Sudden severe headache': 'emergency',
                            'Confusion': 'emergency',
                            'Vision changes': 'emergency',
                            'None of these': 'location'
                        }
                    },
                    {
                        'id': 'location',
                        'text': 'Where is the pain located?',
                        'options': ['Front of head', 'Back of head', 'Sides (temples)', 'All over', 'Behind eyes'],
                        'next': 'duration'
                    },
                    {
                        'id': 'duration',
                        'text': 'How long have you had this headache?',
                        'options': ['Just started', 'Few hours', 'All day', 'Days', 'Weeks'],
                        'next': {
                            'Just started': 'triggers',
                            'Few hours': 'triggers',
                            'All day': 'frequency',
                            'Days': 'frequency',
                            'Weeks': 'chronic_check'
                        }
                    },
                    {
                        'id': 'triggers',
                        'text': 'What might have triggered it?',
                        'options': ['Stress', 'Lack of sleep', 'Dehydration', 'Screen time', 'Not sure'],
                        'next': 'complete'
                    },
                    {
                        'id': 'frequency',
                        'text': 'How often do you get headaches?',
                        'options': ['Rarely', 'Few times a month', 'Weekly', 'Daily'],
                        'next': 'complete'
                    },
                    {
                        'id': 'chronic_check',
                        'text': 'Have you seen a doctor about these headaches?',
                        'options': ['Yes', 'No', 'Planning to'],
                        'next': 'complete'
                    }
                ]
            },
            'fever': {
                'name': 'Fever Assessment',
                'questions': [
                    {
                        'id': 'temperature',
                        'text': 'What is your temperature?',
                        'options': ['99-100°F (37-38°C)', '101-102°F (38-39°C)', '103°F+ (39.5°C+)', 'Not measured'],
                        'next': {
                            '103°F+ (39.5°C+)': 'high_fever_check',
                            'default': 'duration'
                        }
                    },
                    {
                        'id': 'high_fever_check',
                        'text': 'Do you have any of these symptoms?',
                        'options': ['Severe headache', 'Stiff neck', 'Difficulty breathing', 'Confusion', 'None'],
                        'next': {
                            'Severe headache': 'emergency',
                            'Stiff neck': 'emergency',
                            'Difficulty breathing': 'emergency',
                            'Confusion': 'emergency',
                            'None': 'duration'
                        }
                    },
                    {
                        'id': 'duration',
                        'text': 'How long have you had the fever?',
                        'options': ['Just started today', '1-2 days', '3-4 days', '5+ days'],
                        'next': 'other_symptoms'
                    },
                    {
                        'id': 'other_symptoms',
                        'text': 'What other symptoms do you have? (Select all)',
                        'options': ['Cough', 'Sore throat', 'Body aches', 'Headache', 'Nausea', 'None'],
                        'multiple': True,
                        'next': 'complete'
                    }
                ]
            },
            'cough': {
                'name': 'Cough Assessment',
                'questions': [
                    {
                        'id': 'type',
                        'text': 'What type of cough do you have?',
                        'options': ['Dry cough', 'Wet/Productive cough', 'Barking cough', 'Wheezing cough'],
                        'next': 'duration'
                    },
                    {
                        'id': 'duration',
                        'text': 'How long have you had this cough?',
                        'options': ['Few days', '1-2 weeks', '3+ weeks', 'Months'],
                        'next': {
                            'Few days': 'severity',
                            '1-2 weeks': 'severity',
                            '3+ weeks': 'chronic_cough',
                            'Months': 'chronic_cough'
                        }
                    },
                    {
                        'id': 'severity',
                        'text': 'How severe is the cough?',
                        'options': ['Mild (occasional)', 'Moderate (frequent)', 'Severe (constant)'],
                        'next': 'triggers'
                    },
                    {
                        'id': 'triggers',
                        'text': 'When is the cough worse?',
                        'options': ['At night', 'In the morning', 'After exercise', 'All the time', 'No pattern'],
                        'next': 'complete'
                    },
                    {
                        'id': 'chronic_cough',
                        'text': 'Have you seen a doctor about this cough?',
                        'options': ['Yes', 'No', 'Planning to'],
                        'next': 'complete'
                    }
                ]
            },
            'stomach_pain': {
                'name': 'Stomach Pain Assessment',
                'questions': [
                    {
                        'id': 'location',
                        'text': 'Where is the pain located?',
                        'options': ['Upper abdomen', 'Lower abdomen', 'Around navel', 'All over', 'Right side', 'Left side'],
                        'next': 'severity'
                    },
                    {
                        'id': 'severity',
                        'text': 'How severe is the pain?',
                        'options': ['Mild discomfort', 'Moderate pain', 'Severe pain', 'Unbearable'],
                        'next': {
                            'Unbearable': 'emergency_symptoms',
                            'Severe pain': 'emergency_symptoms',
                            'default': 'type'
                        }
                    },
                    {
                        'id': 'emergency_symptoms',
                        'text': 'Do you have any of these?',
                        'options': ['Vomiting blood', 'Black stool', 'Fever', 'Can\'t stand up', 'None'],
                        'next': {
                            'Vomiting blood': 'emergency',
                            'Black stool': 'emergency',
                            'Can\'t stand up': 'emergency',
                            'default': 'type'
                        }
                    },
                    {
                        'id': 'type',
                        'text': 'How would you describe the pain?',
                        'options': ['Sharp/Stabbing', 'Dull ache', 'Cramping', 'Burning', 'Bloating'],
                        'next': 'duration'
                    },
                    {
                        'id': 'duration',
                        'text': 'How long have you had this pain?',
                        'options': ['Just started', 'Few hours', 'All day', 'Days', 'Comes and goes'],
                        'next': 'complete'
                    }
                ]
            }
        }
    
    def start_flow(self, session_id: str, flow_type: str) -> Optional[Dict]:
        """Start a new question flow"""
        if flow_type not in self.flows:
            return None
        
        flow = self.flows[flow_type]
        self.current_flows[session_id] = {
            'flow_type': flow_type,
            'current_question_id': flow['questions'][0]['id'],
            'answers': {},
            'started_at': datetime.now().isoformat()
        }
        
        return self.get_current_question(session_id)
    
    def get_current_question(self, session_id: str) -> Optional[Dict]:
        """Get the current question for a session"""
        if session_id not in self.current_flows:
            return None
        
        flow_state = self.current_flows[session_id]
        flow = self.flows[flow_state['flow_type']]
        current_q_id = flow_state['current_question_id']
        
        # Find the question
        for question in flow['questions']:
            if question['id'] == current_q_id:
                return {
                    'question_id': question['id'],
                    'text': question['text'],
                    'options': question['options'],
                    'multiple': question.get('multiple', False),
                    'flow_name': flow['name']
                }
        
        return None
    
    def answer_question(self, session_id: str, answer: Any) -> Dict:
        """Process answer and get next question"""
        if session_id not in self.current_flows:
            return {'error': 'No active flow'}
        
        flow_state = self.current_flows[session_id]
        flow = self.flows[flow_state['flow_type']]
        current_q_id = flow_state['current_question_id']
        
        # Save answer
        flow_state['answers'][current_q_id] = answer
        
        # Find current question to determine next
        current_question = None
        for q in flow['questions']:
            if q['id'] == current_q_id:
                current_question = q
                break
        
        if not current_question:
            return {'error': 'Question not found'}
        
        # Determine next question
        next_q_id = self.determine_next_question(current_question, answer)
        
        if next_q_id == 'complete':
            # Flow complete
            result = self.complete_flow(session_id)
            return {'status': 'complete', 'result': result}
        elif next_q_id == 'emergency':
            # Emergency detected
            return {
                'status': 'emergency',
                'message': '🚨 Based on your symptoms, please seek emergency medical care immediately. Call 911 or go to the nearest emergency room.'
            }
        else:
            # Move to next question
            flow_state['current_question_id'] = next_q_id
            next_question = self.get_current_question(session_id)
            return {'status': 'continue', 'next_question': next_question}
    
    def determine_next_question(self, question: Dict, answer: Any) -> str:
        """Determine next question based on answer"""
        next_config = question.get('next')
        
        if isinstance(next_config, str):
            # Simple next question
            return next_config
        elif isinstance(next_config, dict):
            # Conditional next question
            if answer in next_config:
                return next_config[answer]
            elif 'default' in next_config:
                return next_config['default']
            else:
                return 'complete'
        else:
            return 'complete'
    
    def complete_flow(self, session_id: str) -> Dict:
        """Complete the flow and generate summary"""
        if session_id not in self.current_flows:
            return {}
        
        flow_state = self.current_flows[session_id]
        answers = flow_state['answers']
        
        # Generate summary based on answers
        summary = {
            'flow_type': flow_state['flow_type'],
            'answers': answers,
            'completed_at': datetime.now().isoformat(),
            'duration': self.calculate_duration(flow_state['started_at']),
            'analysis': self.analyze_answers(flow_state['flow_type'], answers)
        }
        
        # Clean up
        del self.current_flows[session_id]
        
        return summary
    
    def calculate_duration(self, started_at: str) -> str:
        """Calculate flow duration"""
        start = datetime.fromisoformat(started_at)
        duration = datetime.now() - start
        minutes = int(duration.total_seconds() / 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''}"
    
    def analyze_answers(self, flow_type: str, answers: Dict) -> Dict:
        """Analyze answers to provide insights"""
        analysis = {
            'severity': 'mild',
            'recommendations': [],
            'concerns': []
        }
        
        # Flow-specific analysis
        if flow_type == 'headache':
            if 'Severe' in answers.get('severity', ''):
                analysis['severity'] = 'moderate'
                analysis['recommendations'].append('Consider over-the-counter pain relief')
            
            if answers.get('frequency') in ['Weekly', 'Daily']:
                analysis['concerns'].append('Frequent headaches should be evaluated by a doctor')
                analysis['recommendations'].append('Keep a headache diary')
        
        elif flow_type == 'fever':
            if '103°F+' in answers.get('temperature', ''):
                analysis['severity'] = 'moderate'
                analysis['recommendations'].append('Monitor temperature regularly')
            
            if answers.get('duration') in ['5+ days']:
                analysis['concerns'].append('Prolonged fever needs medical evaluation')
        
        elif flow_type == 'cough':
            if answers.get('duration') in ['3+ weeks', 'Months']:
                analysis['severity'] = 'moderate'
                analysis['concerns'].append('Chronic cough should be evaluated by a doctor')
        
        return analysis
    
    def get_flow_progress(self, session_id: str) -> Optional[Dict]:
        """Get progress of current flow"""
        if session_id not in self.current_flows:
            return None
        
        flow_state = self.current_flows[session_id]
        flow = self.flows[flow_state['flow_type']]
        
        total_questions = len(flow['questions'])
        answered = len(flow_state['answers'])
        
        return {
            'total_questions': total_questions,
            'answered': answered,
            'progress_percent': int((answered / total_questions) * 100)
        }


# Global question flow instance
question_flow = QuestionFlow()
