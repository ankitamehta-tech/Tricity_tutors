#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class TricityTutorsAPITester:
    def __init__(self, base_url="https://login-verify-update.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.RequestException as e:
            error_msg = f"Request failed: {str(e)}"
            self.log_test(name, False, error_msg)
            return False, {}

    def test_tutor_signup(self):
        """Test tutor signup API"""
        signup_data = {
            "email": "testtutor@example.com",
            "password": "Test123!@#",
            "role": "tutor",
            "name": "Test Tutor",
            "mobile": "9876543210"
        }
        
        success, response = self.run_test(
            "Tutor Signup",
            "POST",
            "api/auth/signup",
            200,
            data=signup_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_login(self):
        """Test login API"""
        login_data = {
            "email": "testtutor@example.com",
            "password": "Test123!@#"
        }
        
        success, response = self.run_test(
            "Login",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Login token: {self.token[:20]}...")
            return True
        return False

    def test_get_tutors(self):
        """Test get tutors list API"""
        success, response = self.run_test(
            "Get Tutors List",
            "GET",
            "api/tutors",
            200
        )
        
        if success:
            print(f"   Found {len(response)} tutors")
            return True
        return False

    def test_tutor_profile_operations(self):
        """Test tutor profile get and update"""
        # Get profile
        success, response = self.run_test(
            "Get Tutor Profile",
            "GET",
            "api/tutor/profile",
            200
        )
        
        if not success:
            return False
        
        # Update profile
        update_data = {
            "name": "Updated Test Tutor",
            "location": "Chandigarh",
            "fee_min": 500,
            "fee_max": 1000,
            "subjects": [{"subject": "Mathematics", "classes": ["10", "11", "12"]}],
            "mobile": "9876543210"
        }
        
        success, response = self.run_test(
            "Update Tutor Profile",
            "PUT",
            "api/tutor/profile",
            200,
            data=update_data
        )
        
        return success

    def test_forgot_password_api(self):
        """Test forgot password API - should send real email and not return OTP"""
        print("\n🔍 Testing Forgot Password API...")
        
        # Test with registered email
        forgot_data = {"email": "test@example.com"}
        
        success, response = self.run_test(
            "Forgot Password - Registered Email",
            "POST",
            "api/auth/forgot-password",
            200,
            data=forgot_data
        )
        
        if success:
            # Check response format
            if "mode" in response and response["mode"] == "real":
                print("   ✅ Response has 'mode': 'real'")
            else:
                self.log_test("Forgot Password Response Format", False, "Missing 'mode': 'real' in response")
                return False
            
            # Check that OTP is NOT in response
            if "otp" not in response:
                print("   ✅ OTP not returned in response (security)")
            else:
                self.log_test("Forgot Password Security", False, "OTP should not be returned in response")
                return False
        
        # Test with non-registered email (should still return success for security)
        forgot_data_unregistered = {"email": "nonexistent@example.com"}
        
        success2, response2 = self.run_test(
            "Forgot Password - Non-registered Email",
            "POST",
            "api/auth/forgot-password",
            200,
            data=forgot_data_unregistered
        )
        
        if success2:
            if "mode" in response2 and response2["mode"] == "real":
                print("   ✅ Non-registered email also returns success (security)")
            else:
                self.log_test("Forgot Password Non-registered Security", False, "Should return success for non-registered emails")
                return False
        
        return success and success2

    def test_verify_otp_mock_rejection(self):
        """Test that mock OTP (123456) is now rejected"""
        print("\n🔍 Testing OTP Verification - Mock OTP Rejection...")
        
        otp_data = {
            "email": "test@example.com",
            "otp": "123456",
            "otp_type": "email"
        }
        
        # This should now FAIL with 400 error
        success, response = self.run_test(
            "Verify OTP - Mock OTP Should Fail",
            "POST",
            "api/auth/verify-otp",
            400,  # Expecting 400 error now
            data=otp_data
        )
        
        if success:
            # Check error message
            if "detail" in response and "No OTP found" in response["detail"]:
                print("   ✅ Mock OTP correctly rejected with proper error message")
                return True
            else:
                self.log_test("OTP Error Message", False, f"Expected 'No OTP found' error, got: {response}")
                return False
        
        return False

    def test_reset_password_mock_rejection(self):
        """Test that reset password with mock OTP (123456) is rejected"""
        print("\n🔍 Testing Reset Password - Mock OTP Rejection...")
        
        reset_data = {
            "email": "test@example.com",
            "otp": "123456",
            "new_password": "newpass123"
        }
        
        # This should now FAIL with 400 error
        success, response = self.run_test(
            "Reset Password - Mock OTP Should Fail",
            "POST",
            "api/auth/reset-password",
            400,  # Expecting 400 error now
            data=reset_data
        )
        
        if success:
            # Check error message
            if "detail" in response and ("No reset request found" in response["detail"] or "No OTP found" in response["detail"]):
                print("   ✅ Mock OTP correctly rejected in reset password")
                return True
            else:
                self.log_test("Reset Password Error Message", False, f"Expected proper error message, got: {response}")
                return False
        
        return False

    def test_send_otp_email_api(self):
        """Test send OTP email API"""
        print("\n🔍 Testing Send OTP Email API...")
        
        # First create a test user
        signup_data = {
            "email": "otptest@example.com",
            "password": "Test123!@#",
            "role": "student",
            "name": "OTP Test User"
        }
        
        # Try to signup (might fail if user exists, that's ok)
        self.run_test(
            "Create Test User for OTP",
            "POST",
            "api/auth/signup",
            200,
            data=signup_data
        )
        
        # Test send OTP
        success, response = self.run_test(
            "Send OTP Email",
            "POST",
            "api/auth/send-otp?email=otptest@example.com&otp_type=email",
            200
        )
        
        if success:
            # Check response format
            if "mode" in response and response["mode"] == "real":
                print("   ✅ Send OTP returns 'mode': 'real'")
            else:
                self.log_test("Send OTP Response Format", False, "Missing 'mode': 'real' in response")
                return False
            
            # Check that OTP is NOT in response
            if "otp" not in response:
                print("   ✅ OTP not returned in send-otp response")
                return True
            else:
                self.log_test("Send OTP Security", False, "OTP should not be returned in response")
                return False
        
        return False

    def test_wallet_operations(self):
        """Test wallet related APIs"""
        # Get wallet
        success, response = self.run_test(
            "Get Wallet",
            "GET",
            "api/wallet",
            200
        )
        
        if not success:
            return False
        
        # Purchase coins (mock mode)
        purchase_data = {"package": 100}
        
        success, response = self.run_test(
            "Purchase Coins (Mock)",
            "POST",
            "api/wallet/purchase",
            200,
            data=purchase_data
        )
        
        return success

    def test_messaging_system(self):
        """Test messaging APIs"""
        # Get messages
        success, response = self.run_test(
            "Get Messages",
            "GET",
            "api/messages",
            200
        )
        
        if not success:
            return False
        
        # Get conversations
        success, response = self.run_test(
            "Get Conversations",
            "GET",
            "api/messages/conversations",
            200
        )
        
        return success

    def test_current_user(self):
        """Test get current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "api/me",
            200
        )
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Tricity Tutors API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test signup first
        if not self.test_tutor_signup():
            print("❌ Signup failed, trying login...")
            if not self.test_login():
                print("❌ Both signup and login failed, stopping tests")
                return False
        
        # Test other APIs
        self.test_get_tutors()
        self.test_tutor_profile_operations()
        self.test_otp_verification()
        self.test_current_user()
        self.test_wallet_operations()
        self.test_messaging_system()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = TricityTutorsAPITester()
    success = tester.run_all_tests()
    
    # Save test results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())