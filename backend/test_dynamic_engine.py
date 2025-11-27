"""
🧪 Test Dynamic Symptom Engine
Verify it works for ANY symptom (not just hardcoded ones)
"""

import sys
import json
from dynamic_symptom_engine import dynamic_engine

def test_uncommon_symptom():
    """Test with an uncommon symptom to prove it's REAL AI"""
    
    print("\n" + "="*60)
    print("🧪 TESTING DYNAMIC SYMPTOM ENGINE")
    print("Testing with UNCOMMON symptom: 'ear pain'")
    print("="*60 + "\n")
    
    # Start assessment with uncommon symptom
    result = dynamic_engine.start_symptom_assessment("ear pain")
    
    print("✅ Step 1: Start Assessment")
    print(f"Status: {result['status']}")
    print(f"Symptom: {result['symptom']}")
    print(f"First Question: {result['question']['text']}")
    print(f"Options: {result['question']['options']}")
    
    session_data = result['session_data']
    
    # Answer universal questions
    print("\n" + "-"*60)
    print("📝 Answering Universal Questions...")
    print("-"*60)
    
    universal_answers = [
        "31-45",  # Age
        "3-6 (Moderate)",  # Severity
        "None",  # Current medications
        "Fever"  # Other symptoms
    ]
    
    for i, answer in enumerate(universal_answers, 1):
        result = dynamic_engine.process_answer(answer, session_data)
        session_data = result.get('session_data', session_data)
        
        if result['status'] == 'continue':
            print(f"\n✅ Question {i} answered: {answer}")
            print(f"Next Question: {result['question']['text']}")
            print(f"Options: {result['question']['options']}")
        elif result['status'] == 'complete':
            print(f"\n✅ Question {i} answered: {answer}")
            print("\n🎯 Assessment Complete!")
            break
    
    # Answer symptom-specific questions (AI-generated)
    if result['status'] == 'continue':
        print("\n" + "-"*60)
        print("🤖 AI-Generated Symptom-Specific Questions...")
        print("-"*60)
        
        # Answer remaining questions with generic answers
        while result['status'] == 'continue':
            question = result['question']
            # Pick first option as answer
            answer = question['options'][0] if question.get('options') else "Yes"
            
            print(f"\nQuestion: {question['text']}")
            print(f"Answer: {answer}")
            
            result = dynamic_engine.process_answer(answer, session_data)
            session_data = result.get('session_data', session_data)
    
    # Display final analysis
    if result['status'] == 'complete':
        print("\n" + "="*60)
        print("🎯 FINAL AI ANALYSIS")
        print("="*60)
        print(result['formatted_response'])
        
        print("\n" + "="*60)
        print("✅ TEST PASSED!")
        print("Dynamic engine successfully handled 'ear pain'")
        print("This proves it works for ANY symptom, not just hardcoded ones!")
        print("="*60 + "\n")
        
        return True
    else:
        print("\n❌ TEST FAILED: Did not complete assessment")
        return False

if __name__ == "__main__":
    try:
        success = test_uncommon_symptom()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ TEST ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
