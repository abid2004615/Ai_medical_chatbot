"""
Weekly Health Monitoring System
Automated weekly check-ins and health trend analysis
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json


class WeeklyHealthMonitor:
    """Manages weekly health check-ins and trend analysis"""
    
    def __init__(self):
        self.health_score_weights = {
            'new_symptoms': -10,
            'symptom_improvement': 15,
            'symptom_worsening': -15,
            'no_symptoms': 20,
            'medication_adherence': 10,
            'sleep_quality': 5,
            'stress_level': -5
        }
    
    def create_checkin_questions(self) -> List[Dict]:
        """Get weekly check-in questions"""
        return [
            {
                'id': 'overall_health',
                'question': 'How would you rate your overall health this week?',
                'type': 'scale',
                'options': ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
                'scores': [1, 2, 3, 4, 5]
            },
            {
                'id': 'new_symptoms',
                'question': 'Have you experienced any new symptoms this week?',
                'type': 'boolean',
                'options': ['Yes', 'No'],
                'follow_up': 'Please describe the new symptoms'
            },
            {
                'id': 'previous_symptoms',
                'question': 'How are your previous symptoms?',
                'type': 'multiple_choice',
                'options': [
                    'Much better',
                    'Somewhat better',
                    'About the same',
                    'Somewhat worse',
                    'Much worse',
                    'No previous symptoms'
                ],
                'scores': [5, 3, 0, -3, -5, 0]
            },
            {
                'id': 'sleep_quality',
                'question': 'How has your sleep been this week?',
                'type': 'scale',
                'options': ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
                'scores': [1, 2, 3, 4, 5]
            },
            {
                'id': 'stress_level',
                'question': 'What has your stress level been like?',
                'type': 'scale',
                'options': ['Very High', 'High', 'Moderate', 'Low', 'Very Low'],
                'scores': [1, 2, 3, 4, 5]
            },
            {
                'id': 'medication_adherence',
                'question': 'Have you been taking your medications as prescribed?',
                'type': 'multiple_choice',
                'options': [
                    'Yes, always',
                    'Most of the time',
                    'Sometimes',
                    'Rarely',
                    'Not applicable'
                ],
                'scores': [5, 3, 1, 0, 0]
            },
            {
                'id': 'doctor_visit',
                'question': 'Did you visit a doctor this week?',
                'type': 'boolean',
                'options': ['Yes', 'No'],
                'follow_up': 'What was the reason for your visit?'
            }
        ]
    
    def calculate_health_score(self, responses: Dict) -> int:
        """Calculate weekly health score (0-100)"""
        base_score = 50
        
        # Overall health rating
        if 'overall_health' in responses:
            base_score += (responses['overall_health'] - 3) * 10
        
        # New symptoms
        if responses.get('new_symptoms') == 'Yes':
            base_score -= 10
        elif responses.get('new_symptoms') == 'No':
            base_score += 10
        
        # Previous symptoms change
        symptom_change_scores = {
            'Much better': 15,
            'Somewhat better': 10,
            'About the same': 0,
            'Somewhat worse': -10,
            'Much worse': -15,
            'No previous symptoms': 5
        }
        if 'previous_symptoms' in responses:
            base_score += symptom_change_scores.get(responses['previous_symptoms'], 0)
        
        # Sleep quality
        if 'sleep_quality' in responses:
            base_score += (responses['sleep_quality'] - 3) * 5
        
        # Stress level (inverted - lower stress is better)
        if 'stress_level' in responses:
            base_score += (5 - responses['stress_level']) * 3
        
        # Medication adherence
        adherence_scores = {
            'Yes, always': 10,
            'Most of the time': 5,
            'Sometimes': 0,
            'Rarely': -5,
            'Not applicable': 0
        }
        if 'medication_adherence' in responses:
            base_score += adherence_scores.get(responses['medication_adherence'], 0)
        
        # Ensure score is between 0 and 100
        return max(0, min(100, base_score))
    
    def save_checkin(self, user_id: int, responses: Dict, db_connection) -> Dict:
        """Save weekly check-in to database"""
        health_score = self.calculate_health_score(responses)
        checkin_date = datetime.now().date()
        
        cursor = db_connection.cursor()
        cursor.execute('''
            INSERT INTO weekly_checkins 
            (user_id, checkin_date, health_score, new_symptoms, symptom_changes, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            checkin_date,
            health_score,
            responses.get('new_symptoms_description', ''),
            responses.get('previous_symptoms', ''),
            json.dumps(responses)
        ))
        db_connection.commit()
        
        return {
            'checkin_id': cursor.lastrowid,
            'health_score': health_score,
            'checkin_date': checkin_date.isoformat(),
            'message': self.generate_feedback_message(health_score, responses)
        }
    
    def generate_feedback_message(self, health_score: int, responses: Dict) -> str:
        """Generate personalized feedback message"""
        messages = []
        
        # Overall score feedback
        if health_score >= 80:
            messages.append("🌟 Excellent! Your health is looking great this week!")
        elif health_score >= 60:
            messages.append("👍 Good job! You're maintaining your health well.")
        elif health_score >= 40:
            messages.append("💪 You're doing okay. Let's work on improving together!")
        else:
            messages.append("🤗 I notice you're facing some challenges. Remember, I'm here to help!")
        
        # Specific feedback
        if responses.get('previous_symptoms') == 'Much better':
            messages.append("🎉 Great progress on your symptoms!")
        elif responses.get('previous_symptoms') == 'Much worse':
            messages.append("I recommend checking in with a doctor about your worsening symptoms.")
        
        if responses.get('new_symptoms') == 'Yes':
            messages.append("Let's discuss your new symptoms to help you feel better.")
        
        if responses.get('sleep_quality', 0) <= 2:
            messages.append("💤 Better sleep can really help your recovery. Try to prioritize rest!")
        
        if responses.get('stress_level', 0) <= 2:
            messages.append("😌 Managing stress is important for your health. Consider relaxation techniques!")
        
        return " ".join(messages)
    
    def analyze_trends(self, user_id: int, weeks: int, db_connection) -> Dict:
        """Analyze health trends over specified weeks"""
        cursor = db_connection.cursor()
        cursor.execute('''
            SELECT checkin_date, health_score, new_symptoms, symptom_changes, notes
            FROM weekly_checkins
            WHERE user_id = ?
            ORDER BY checkin_date DESC
            LIMIT ?
        ''', (user_id, weeks))
        
        checkins = cursor.fetchall()
        
        if not checkins:
            return {
                'trend': 'no_data',
                'message': 'No check-in data available yet. Complete your first check-in!',
                'data': []
            }
        
        # Calculate trend
        scores = [row[1] for row in checkins]
        dates = [row[0] for row in checkins]
        
        if len(scores) >= 2:
            trend_direction = 'improving' if scores[0] > scores[-1] else 'declining' if scores[0] < scores[-1] else 'stable'
            avg_score = sum(scores) / len(scores)
            score_change = scores[0] - scores[-1]
        else:
            trend_direction = 'stable'
            avg_score = scores[0]
            score_change = 0
        
        # Generate trend message
        if trend_direction == 'improving':
            trend_message = f"📈 Great news! Your health has improved by {abs(score_change):.0f} points over the past {len(scores)} weeks!"
        elif trend_direction == 'declining':
            trend_message = f"📉 Your health score has decreased by {abs(score_change):.0f} points. Let's work on getting you back on track!"
        else:
            trend_message = f"📊 Your health has been stable. Keep up the good work!"
        
        return {
            'trend': trend_direction,
            'average_score': round(avg_score, 1),
            'score_change': round(score_change, 1),
            'message': trend_message,
            'data': [
                {
                    'date': row[0],
                    'score': row[1],
                    'new_symptoms': row[2],
                    'symptom_changes': row[3]
                }
                for row in checkins
            ]
        }
    
    def generate_progress_report(self, user_id: int, db_connection) -> Dict:
        """Generate comprehensive progress report"""
        # Get last 4 weeks of data
        trends = self.analyze_trends(user_id, 4, db_connection)
        
        # Get symptom history
        cursor = db_connection.cursor()
        cursor.execute('''
            SELECT symptom_name, severity, date_reported, resolved
            FROM symptom_history
            WHERE user_id = ?
            ORDER BY date_reported DESC
            LIMIT 10
        ''', (user_id,))
        
        symptoms = cursor.fetchall()
        
        return {
            'trends': trends,
            'recent_symptoms': [
                {
                    'symptom': row[0],
                    'severity': row[1],
                    'date': row[2],
                    'resolved': bool(row[3])
                }
                for row in symptoms
            ],
            'recommendations': self.generate_recommendations(trends, symptoms),
            'generated_at': datetime.now().isoformat()
        }
    
    def generate_recommendations(self, trends: Dict, symptoms: List) -> List[str]:
        """Generate personalized health recommendations"""
        recommendations = []
        
        if trends['trend'] == 'declining':
            recommendations.append("Consider scheduling a check-up with your doctor")
            recommendations.append("Review your current medications and adherence")
        
        if trends['average_score'] < 60:
            recommendations.append("Focus on getting adequate rest and sleep")
            recommendations.append("Try stress-reduction techniques like meditation")
        
        # Check for unresolved symptoms
        unresolved = [s for s in symptoms if not s[3]]
        if len(unresolved) > 2:
            recommendations.append("You have several ongoing symptoms - consider medical consultation")
        
        if not recommendations:
            recommendations.append("Keep up the great work with your health!")
            recommendations.append("Continue your current health routine")
        
        return recommendations
    
    def schedule_next_checkin(self, user_id: int, db_connection) -> datetime:
        """Calculate next check-in date"""
        cursor = db_connection.cursor()
        cursor.execute('''
            SELECT MAX(checkin_date) FROM weekly_checkins WHERE user_id = ?
        ''', (user_id,))
        
        last_checkin = cursor.fetchone()[0]
        
        if last_checkin:
            last_date = datetime.fromisoformat(last_checkin)
            next_date = last_date + timedelta(days=7)
        else:
            next_date = datetime.now() + timedelta(days=7)
        
        return next_date
    
    def should_prompt_checkin(self, user_id: int, db_connection) -> bool:
        """Check if user should be prompted for check-in"""
        next_checkin = self.schedule_next_checkin(user_id, db_connection)
        return datetime.now() >= next_checkin


# Global weekly monitor instance
weekly_monitor = WeeklyHealthMonitor()
