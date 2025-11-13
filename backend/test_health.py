"""
Integration tests for backend health check endpoint

These tests verify:
- Health endpoint returns correct response
- CORS headers are present
- Response time is acceptable
"""

import unittest
import requests
import time
from typing import Dict, Any


class TestHealthEndpoint(unittest.TestCase):
    """Test cases for /api/health endpoint"""
    
    BASE_URL = "http://localhost:5000"
    HEALTH_ENDPOINT = f"{BASE_URL}/api/health"
    
    def test_health_endpoint_returns_ok(self):
        """Test that health endpoint returns 200 OK"""
        response = requests.get(self.HEALTH_ENDPOINT)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Content-Type'], 'application/json')
    
    def test_health_response_structure(self):
        """Test that health response has correct structure"""
        response = requests.get(self.HEALTH_ENDPOINT)
        data: Dict[str, Any] = response.json()
        
        # Check required fields
        self.assertIn('status', data)
        self.assertIn('message', data)
        self.assertIn('timestamp', data)
        
        # Check field values
        self.assertEqual(data['status'], 'ok')
        self.assertIsInstance(data['message'], str)
        self.assertIsInstance(data['timestamp'], int)
        
        # Optional version field
        if 'version' in data:
            self.assertIsInstance(data['version'], str)
    
    def test_health_response_time(self):
        """Test that health endpoint responds quickly (< 100ms)"""
        start_time = time.time()
        response = requests.get(self.HEALTH_ENDPOINT)
        end_time = time.time()
        
        response_time_ms = (end_time - start_time) * 1000
        
        self.assertEqual(response.status_code, 200)
        self.assertLess(
            response_time_ms, 
            100, 
            f"Health check took {response_time_ms:.2f}ms, should be < 100ms"
        )
    
    def test_cors_headers_present(self):
        """Test that CORS headers are present in response"""
        # Make a request from a frontend origin
        headers = {
            'Origin': 'http://localhost:3000'
        }
        response = requests.get(self.HEALTH_ENDPOINT, headers=headers)
        
        # Check CORS headers
        self.assertIn('Access-Control-Allow-Origin', response.headers)
        
        # Verify origin is allowed
        allowed_origin = response.headers.get('Access-Control-Allow-Origin')
        self.assertIn(
            allowed_origin,
            ['http://localhost:3000', '*'],
            "Frontend origin should be allowed"
        )
    
    def test_cors_preflight_request(self):
        """Test that OPTIONS preflight requests are handled"""
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        response = requests.options(self.HEALTH_ENDPOINT, headers=headers)
        
        # Preflight should return 200 or 204
        self.assertIn(response.status_code, [200, 204])
        
        # Check CORS headers in preflight response
        self.assertIn('Access-Control-Allow-Origin', response.headers)
        self.assertIn('Access-Control-Allow-Methods', response.headers)
    
    def test_health_timestamp_is_recent(self):
        """Test that health check timestamp is current"""
        response = requests.get(self.HEALTH_ENDPOINT)
        data = response.json()
        
        current_time_ms = int(time.time() * 1000)
        timestamp = data['timestamp']
        
        # Timestamp should be within last 5 seconds
        time_diff_ms = abs(current_time_ms - timestamp)
        self.assertLess(
            time_diff_ms,
            5000,
            f"Timestamp is {time_diff_ms}ms off, should be within 5000ms"
        )
    
    def test_health_message_is_descriptive(self):
        """Test that health message is descriptive"""
        response = requests.get(self.HEALTH_ENDPOINT)
        data = response.json()
        
        message = data['message'].lower()
        
        # Message should indicate backend is running
        self.assertTrue(
            'running' in message or 'healthy' in message or 'ok' in message,
            f"Health message should indicate server is running: {data['message']}"
        )


class TestHealthEndpointErrorHandling(unittest.TestCase):
    """Test error handling for health endpoint"""
    
    def test_health_endpoint_with_invalid_method(self):
        """Test that health endpoint only accepts GET requests"""
        response = requests.post("http://localhost:5000/api/health")
        
        # Should return 405 Method Not Allowed
        self.assertEqual(response.status_code, 405)


def run_tests():
    """Run all tests and print results"""
    print("=" * 60)
    print("Backend Health Endpoint Integration Tests")
    print("=" * 60)
    print()
    print("NOTE: Make sure the backend server is running on port 5000")
    print("      before running these tests.")
    print()
    
    # Check if backend is running
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=2)
        if response.status_code == 200:
            print("✓ Backend server is running")
            print()
        else:
            print("✗ Backend server returned unexpected status")
            return
    except requests.exceptions.RequestException:
        print("✗ Backend server is not running on port 5000")
        print("  Please start the backend server first:")
        print("  cd backend && python app.py")
        return
    
    # Run tests
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    suite.addTests(loader.loadTestsFromTestCase(TestHealthEndpoint))
    suite.addTests(loader.loadTestsFromTestCase(TestHealthEndpointErrorHandling))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print()
    print("=" * 60)
    if result.wasSuccessful():
        print("✓ All tests passed!")
    else:
        print(f"✗ {len(result.failures)} test(s) failed")
        print(f"✗ {len(result.errors)} test(s) had errors")
    print("=" * 60)


if __name__ == '__main__':
    run_tests()
