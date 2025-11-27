"""
Health Report Generator
Generates downloadable PDF health reports
"""

from datetime import datetime
from typing import Dict, List, Optional
import json
import os


class HealthReportGenerator:
    """Generates comprehensive health reports in PDF format"""
    
    def __init__(self):
        self.report_dir = 'backend/reports'
        os.makedirs(self.report_dir, exist_ok=True)
    
    def generate_report_data(self, user_data: Dict, session_data: Dict, 
                            symptoms: List[str], analysis: Dict) -> Dict:
        """Generate report data structure"""
        
        report_data = {
            'report_id': f"RPT_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'generated_at': datetime.now().isoformat(),
            'user_info': {
                'name': user_data.get('name', 'User'),
                'age': user_data.get('age'),
                'gender': user_data.get('gender')
            },
            'session_info': {
                'session_id': session_data.get('session_id'),
                'date': session_data.get('date', datetime.now().isoformat()),
                'duration': session_data.get('duration', 'N/A')
            },
            'symptoms_discussed': symptoms,
            'possible_causes': analysis.get('possible_causes', []),
            'recommendations': analysis.get('recommendations', []),
            'severity_level': analysis.get('severity', 'Not assessed'),
            'doctor_consultation_advice': self.generate_doctor_advice(analysis),
            'motivational_message': self.generate_motivational_message(analysis),
            'disclaimer': 'This report is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional for proper diagnosis and treatment.'
        }
        
        return report_data
    
    def generate_doctor_advice(self, analysis: Dict) -> str:
        """Generate when-to-see-doctor advice"""
        severity = analysis.get('severity', 'mild').lower()
        
        advice_map = {
            'minimal': 'Monitor your symptoms. If they persist for more than a week or worsen, consider consulting a doctor.',
            'mild': 'If symptoms persist for more than 3-5 days or worsen, schedule an appointment with your doctor.',
            'moderate': 'We recommend seeing a doctor within the next few days for proper evaluation and treatment.',
            'severe': 'Please see a doctor today or visit an urgent care clinic for immediate evaluation.',
            'critical': 'Seek emergency medical care immediately. Call 911 or go to the nearest emergency room.'
        }
        
        return advice_map.get(severity, advice_map['mild'])
    
    def generate_motivational_message(self, analysis: Dict) -> str:
        """Generate positive, encouraging message"""
        severity = analysis.get('severity', 'mild').lower()
        
        messages = {
            'minimal': '🌟 You\'re doing great! Minor health concerns like this usually resolve quickly with proper care. Keep taking care of yourself!',
            'mild': '💪 You\'re taking the right steps by seeking information and monitoring your health. Most people recover well from these symptoms with time and care.',
            'moderate': '🎯 You\'re being proactive about your health, which is wonderful! Getting proper medical care will help you feel better soon.',
            'severe': '🏥 Taking action now is the best decision. Medical professionals are ready to help you feel better. You\'re doing the right thing!',
            'critical': '🚑 You\'re making the right choice by seeking immediate care. Help is available and you will receive the treatment you need.'
        }
        
        return messages.get(severity, messages['mild'])
    
    def generate_text_report(self, report_data: Dict) -> str:
        """Generate text-based report (fallback if PDF fails)"""
        lines = []
        lines.append("=" * 60)
        lines.append("MEDICHAT HEALTH REPORT")
        lines.append("=" * 60)
        lines.append(f"\nReport ID: {report_data['report_id']}")
        lines.append(f"Generated: {datetime.fromisoformat(report_data['generated_at']).strftime('%B %d, %Y at %I:%M %p')}")
        lines.append(f"\nPatient: {report_data['user_info']['name']}")
        if report_data['user_info']['age']:
            lines.append(f"Age: {report_data['user_info']['age']}")
        if report_data['user_info']['gender']:
            lines.append(f"Gender: {report_data['user_info']['gender']}")
        
        lines.append("\n" + "-" * 60)
        lines.append("SYMPTOMS DISCUSSED")
        lines.append("-" * 60)
        for symptom in report_data['symptoms_discussed']:
            lines.append(f"• {symptom}")
        
        lines.append("\n" + "-" * 60)
        lines.append("POSSIBLE CAUSES")
        lines.append("-" * 60)
        for i, cause in enumerate(report_data['possible_causes'], 1):
            lines.append(f"\n{i}. {cause.get('name', 'Unknown')}")
            if 'description' in cause:
                lines.append(f"   {cause['description']}")
        
        lines.append("\n" + "-" * 60)
        lines.append("GENERAL CARE RECOMMENDATIONS")
        lines.append("-" * 60)
        for rec in report_data['recommendations']:
            lines.append(f"• {rec}")
        
        lines.append("\n" + "-" * 60)
        lines.append("DOCTOR CONSULTATION ADVICE")
        lines.append("-" * 60)
        lines.append(report_data['doctor_consultation_advice'])
        
        lines.append("\n" + "-" * 60)
        lines.append("MOTIVATIONAL MESSAGE")
        lines.append("-" * 60)
        lines.append(report_data['motivational_message'])
        
        lines.append("\n" + "=" * 60)
        lines.append("IMPORTANT DISCLAIMER")
        lines.append("=" * 60)
        lines.append(report_data['disclaimer'])
        lines.append("\n" + "=" * 60)
        
        return "\n".join(lines)
    
    def generate_html_report(self, report_data: Dict) -> str:
        """Generate HTML report for better formatting"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MediChat Health Report</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }}
        .header {{
            background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
        }}
        .header .logo {{
            font-size: 48px;
            margin-bottom: 10px;
        }}
        .section {{
            background: #f5f5f5;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            border-left: 4px solid #00BCD4;
        }}
        .section h2 {{
            color: #00BCD4;
            margin-top: 0;
            font-size: 20px;
        }}
        .info-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }}
        .info-item {{
            padding: 10px;
            background: white;
            border-radius: 5px;
        }}
        .info-label {{
            font-weight: bold;
            color: #666;
            font-size: 12px;
        }}
        .info-value {{
            color: #333;
            font-size: 16px;
        }}
        ul {{
            list-style: none;
            padding: 0;
        }}
        ul li {{
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }}
        ul li:before {{
            content: "✓ ";
            color: #00BCD4;
            font-weight: bold;
            margin-right: 8px;
        }}
        .disclaimer {{
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin-top: 30px;
        }}
        .motivational {{
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 20px;
            border-radius: 8px;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            color: #999;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
        }}
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">⚕️</div>
        <h1>MediChat Health Report</h1>
        <p>Report ID: {report_data['report_id']}</p>
        <p>{datetime.fromisoformat(report_data['generated_at']).strftime('%B %d, %Y at %I:%M %p')}</p>
    </div>
    
    <div class="section">
        <h2>📋 Patient Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">{report_data['user_info']['name']}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">{report_data['user_info'].get('age', 'Not provided')}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">{report_data['user_info'].get('gender', 'Not provided')}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Severity Level</div>
                <div class="info-value">{report_data['severity_level'].title()}</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🩺 Symptoms Discussed</h2>
        <ul>
            {''.join(f'<li>{symptom}</li>' for symptom in report_data['symptoms_discussed'])}
        </ul>
    </div>
    
    <div class="section">
        <h2>🔍 Possible Causes</h2>
        {''.join(f'''
        <div style="margin-bottom: 15px;">
            <strong>{i}. {cause.get('name', 'Unknown')}</strong>
            <p style="margin: 5px 0 0 20px; color: #666;">{cause.get('description', '')}</p>
        </div>
        ''' for i, cause in enumerate(report_data['possible_causes'], 1))}
    </div>
    
    <div class="section">
        <h2>💡 General Care Recommendations</h2>
        <ul>
            {''.join(f'<li>{rec}</li>' for rec in report_data['recommendations'])}
        </ul>
    </div>
    
    <div class="section">
        <h2>🏥 Doctor Consultation Advice</h2>
        <p>{report_data['doctor_consultation_advice']}</p>
    </div>
    
    <div class="motivational">
        {report_data['motivational_message']}
    </div>
    
    <div class="disclaimer">
        <strong>⚠️ Important Disclaimer:</strong><br>
        {report_data['disclaimer']}
    </div>
    
    <div class="footer">
        <p>MediChat - Your AI Health Assistant</p>
        <p>For emergencies, call 911 or visit your nearest emergency room</p>
    </div>
</body>
</html>
"""
        return html
    
    def save_report(self, report_data: Dict, format: str = 'html') -> str:
        """Save report to file"""
        filename = f"{report_data['report_id']}.{format}"
        filepath = os.path.join(self.report_dir, filename)
        
        if format == 'html':
            content = self.generate_html_report(report_data)
        elif format == 'txt':
            content = self.generate_text_report(report_data)
        elif format == 'json':
            content = json.dumps(report_data, indent=2)
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return filepath
    
    def save_to_database(self, user_id: int, report_data: Dict, filepath: str, db_connection):
        """Save report metadata to database"""
        cursor = db_connection.cursor()
        cursor.execute('''
            INSERT INTO health_reports 
            (user_id, session_id, report_data, file_path, generated_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_id,
            report_data['session_info']['session_id'],
            json.dumps(report_data),
            filepath,
            report_data['generated_at']
        ))
        db_connection.commit()
        return cursor.lastrowid
    
    def get_user_reports(self, user_id: int, db_connection) -> List[Dict]:
        """Get all reports for a user"""
        cursor = db_connection.cursor()
        cursor.execute('''
            SELECT id, session_id, generated_at, file_path
            FROM health_reports
            WHERE user_id = ?
            ORDER BY generated_at DESC
        ''', (user_id,))
        
        reports = []
        for row in cursor.fetchall():
            reports.append({
                'report_id': row[0],
                'session_id': row[1],
                'generated_at': row[2],
                'file_path': row[3]
            })
        
        return reports


# Global report generator instance
report_generator = HealthReportGenerator()
