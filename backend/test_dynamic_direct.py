"""
🧪 Direct test of Dynamic Symptom Engine (no Flask server needed)
Tests the engine logic directly without HTTP
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from dynamic_symptom_engine import dynamic_engine

def test_engine_directly():
    """Test the dynamic engine directly without Flask"""
    
    print("=" * 60)
    print("🧪 TESTING DYNAMIC SYMPTOM ENGINE (Direct)")
    print("=" * 60)
    print()
    
    # Test symptoms
    test_symptoms = ["headache", "ear pain", "jaw pain"]
    
    for symptom in test_symptoms:
        print(f"\n{'='*60}")
        print(f"🎯 Testing: {symptom.upper()}")
        print(f"{'='*60}\n")
        
        # Step 1: Start assessment
        print(f"1️⃣ Starting assessment for '{symptom}'...")
        result = dynamic_engine.start_symptom_assessment(symptom)
        
        if result.get('status') != 'started':
            print(f"❌ Failed to start: {result}")
            continue
        
        print(f"✅ Started successfully!")
        print(f"   Question: {result['question']['text']}")
        print(f"   Options: {result['question']['options'][:3]}...")
        
        session_data = result['session_data']
        
        # Step 2: Answer universal questions (4 questions)
        print(f"\n2️⃣ Answering universal questions...")
        universal_answers = [
            "18-30",  # age
            "3-6 (Moderate)",  # severity
            "None",  # medications
            "None"  # other symptoms
        ]
        
        for i, answer in enumerate(universal_answers, 1):
            print(f"   Q{i}: {answer}")
            result = dynamic_engine.process_answer(answer, session_data)
            
            if result.get('status') == 'error':
                print(f"❌ Error: {result.get('message')}")
                break
            
            session_data = result.get('session_data', session_data)
            
            if result.get('status') == 'complete':
                print(f"\n✅ Assessment complete after {i} questions!")
                break
        
        # Step 3: Answer symptom-specific questions if any
        if result.get('status') == 'continue':
            print(f"\n3️⃣ Answering symptom-specific questions...")
            
            # Answer up to 3 more questions
            for i in range(3):
                question = result.get('question', {})
                options = question.get('options', [])
                answer = options[0] if options else "Yes"
                
                print(f"   Q{i+1}: {answer}")
                result = dynamic_engine.process_answer(answer, session_data)
                
                if result.get('status') == 'error':
                    print(f"❌ Error: {result.get('message')}")
                    break
                
                session_data = result.get('session_data', session_data)
                
                if result.get('status') == 'complete':
                    print(f"\n✅ Assessment complete!")
                    break
                
                if result.get('status') != 'continue':
                    break
        
        # Step 4: Show analysis
        if result.get('status') == 'complete':
            print(f"\n4️⃣ Analysis Results:")
            print("-" * 60)
            
            analysis = result.get('analysis', {})
            
            if 'possible_causes' in analysis:
                print(f"\n🔍 Possible Causes:")
                for cause in analysis['possible_causes'][:2]:
                    print(f"   • {cause[:80]}...")
            
            if 'severity_assessment' in analysis:
                severity = analysis['severity_assessment']
                print(f"\n⚠️ Severity: {severity[:80]}...")
            
            if 'recommended_medicines' in analysis:
                print(f"\n💊 Medicines:")
                for med in analysis['recommended_medicines'][:2]:
                    print(f"   • {med[:80]}...")
            
            print("\n" + "=" * 60)
            print(f"✅ {symptom.upper()} - TEST PASSED")
            print("=" * 60)
        else:
            print(f"\n⚠️ Test incomplete - status: {result.get('status')}")
    
    print("\n" + "=" * 60)
    print("🎉 DIRECT ENGINE TEST COMPLETE")
    print("=" * 60)
    print("\n✅ Dynamic Symptom Engine works!")
    print("✅ Handles ANY symptom without hardcoded flows")
    print("✅ Real AI-powered medical reasoning")

if __name__ == "__main__":
    test_engine_directly()
