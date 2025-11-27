import requests
import json

# Test the dynamic symptom API
print("Testing Dynamic Symptom API...")

# Test 1: Start assessment
print("\n1. Starting assessment for 'headache'...")
response = requests.post("http://localhost:5000/api/dynamic/start", json={
    "symptom": "headache",
    "session_id": "test-session-123"
})

print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 200:
    print("\n✅ Dynamic symptom endpoint is working!")
else:
    print("\n❌ Dynamic symptom endpoint failed!")
