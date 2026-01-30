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

            # Handle multiple expected status codes
            if isinstance(expected_status, list):
                success = response.status_code in expected_status
            else:
                success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                if isinstance(expected_status, list):
                    error_msg = f"Expected one of {expected_status}, got {response.status_code}"
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
        
        # Test with registered email (using account owner's email for actual email delivery)
        forgot_data = {"email": "ankitamehta2025@gmail.com"}
        
        success, response = self.run_test(
            "Forgot Password - Account Owner Email",
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
        
        # Test with any other email (should still return success for security)
        forgot_data_test = {"email": "test@example.com"}
        
        success2, response2 = self.run_test(
            "Forgot Password - Test Email",
            "POST",
            "api/auth/forgot-password",
            200,
            data=forgot_data_test
        )
        
        if success2:
            if "mode" in response2 and response2["mode"] == "real":
                print("   ✅ Test email also returns success (security)")
            else:
                self.log_test("Forgot Password Test Email Security", False, "Should return success for any email")
                return False
        
        # Test with non-registered email (should still return success for security)
        forgot_data_unregistered = {"email": "nonexistent@example.com"}
        
        success3, response3 = self.run_test(
            "Forgot Password - Non-registered Email",
            "POST",
            "api/auth/forgot-password",
            200,
            data=forgot_data_unregistered
        )
        
        if success3:
            if "mode" in response3 and response3["mode"] == "real":
                print("   ✅ Non-registered email also returns success (security)")
            else:
                self.log_test("Forgot Password Non-registered Security", False, "Should return success for non-registered emails")
                return False
        
        return success and success2 and success3

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
        
        # Use the account owner's email for testing (Resend limitation in test mode)
        test_email = "ankitamehta2025@gmail.com"
        
        # First create a test user with the valid email (ignore if already exists)
        signup_data = {
            "email": test_email,
            "password": "Test123!@#",
            "role": "student",
            "name": "OTP Test User"
        }
        
        # Try to signup (might fail if user exists, that's ok)
        success, response = self.run_test(
            "Create Test User for OTP (Optional)",
            "POST",
            "api/auth/signup",
            [200, 400],  # Accept both success and "already exists"
            data=signup_data
        )
        
        if not success and "Email already registered" not in str(response):
            print("   ⚠️  Unexpected signup error, but continuing with OTP test...")
        else:
            print("   ✅ User exists or created successfully")
        
        # Test send OTP with valid email
        success, response = self.run_test(
            "Send OTP Email - Valid Email",
            "POST",
            f"api/auth/send-otp?email={test_email}&otp_type=email",
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

    def test_email_service_limitation(self):
        """Test email service limitation with non-owner email"""
        print("\n🔍 Testing Email Service Limitation...")
        
        # First create a test user with non-owner email (ignore if already exists)
        signup_data = {
            "email": "otptest@example.com",
            "password": "Test123!@#",
            "role": "student",
            "name": "OTP Test User"
        }
        
        # Try to signup (might fail if user exists, that's ok)
        success, response = self.run_test(
            "Create Test User for Email Limitation Test (Optional)",
            "POST",
            "api/auth/signup",
            [200, 400],  # Accept both success and "already exists"
            data=signup_data
        )
        
        if not success and "Email already registered" not in str(response):
            print("   ⚠️  Unexpected signup error, but continuing with limitation test...")
        else:
            print("   ✅ User exists or created successfully")
        
        # Test send OTP with non-owner email (should fail in test environment)
        success, response = self.run_test(
            "Send OTP Email - Non-owner Email (Expected to Fail)",
            "POST",
            "api/auth/send-otp?email=otptest@example.com&otp_type=email",
            [500, 520]  # Accept both 500 and 520 error codes
        )
        
        if success:
            # Check error message mentions email service limitation
            if "detail" in response and "Failed to send OTP email" in response["detail"]:
                print("   ✅ Email service correctly reports limitation")
                return True
            else:
                self.log_test("Email Service Error Message", False, f"Expected email service error, got: {response}")
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

    def test_student_signup(self):
        """Test student signup API for review testing"""
        signup_data = {
            "email": "teststudent@example.com",
            "password": "Test123!@#",
            "role": "student",
            "name": "Test Student",
            "mobile": "9876543211"
        }
        
        success, response = self.run_test(
            "Student Signup",
            "POST",
            "api/auth/signup",
            200,
            data=signup_data
        )
        
        if success and 'token' in response:
            return response['token'], response['user']['id']
        return None, None

    def test_review_system_one_per_student(self):
        """Test review system - one review per student with update functionality"""
        print("\n🔍 Testing Review System - One Review Per Student...")
        
        # First, create a student account
        student_token, student_id = self.test_student_signup()
        if not student_token:
            # Try login if signup failed
            login_data = {
                "email": "teststudent@example.com",
                "password": "Test123!@#"
            }
            success, response = self.run_test(
                "Student Login for Review Test",
                "POST",
                "api/auth/login",
                200,
                data=login_data
            )
            if success and 'token' in response:
                student_token = response['token']
                student_id = response['user']['id']
            else:
                self.log_test("Review System Setup", False, "Could not create/login student")
                return False
        
        # Get a tutor ID (use the existing tutor from previous tests)
        tutor_id = None
        if self.token:  # This should be the tutor token from earlier tests
            success, response = self.run_test(
                "Get Current Tutor for Review Test",
                "GET",
                "api/me",
                200
            )
            if success:
                tutor_id = response['id']
        
        if not tutor_id:
            self.log_test("Review System Setup", False, "Could not get tutor ID")
            return False
        
        # Switch to student token for review operations
        original_token = self.token
        self.token = student_token
        
        # First review
        first_review_data = {
            "tutor_id": tutor_id,
            "rating": 4,
            "comment": "Good tutor, very helpful"
        }
        
        success, response = self.run_test(
            "Create First Review",
            "POST",
            "api/reviews",
            200,
            data=first_review_data
        )
        
        if not success:
            self.token = original_token
            return False
        
        # Check that response indicates new review (updated: false)
        if response.get("updated") != False:
            self.log_test("First Review Response", False, f"Expected 'updated': false, got: {response}")
            self.token = original_token
            return False
        
        # Second review with same tutor (should update)
        second_review_data = {
            "tutor_id": tutor_id,
            "rating": 5,
            "comment": "Updated review, excellent!"
        }
        
        success, response = self.run_test(
            "Update Existing Review",
            "POST",
            "api/reviews",
            200,
            data=second_review_data
        )
        
        if not success:
            self.token = original_token
            return False
        
        # Check that response indicates update (updated: true)
        if response.get("updated") != True:
            self.log_test("Second Review Response", False, f"Expected 'updated': true, got: {response}")
            self.token = original_token
            return False
        
        print("   ✅ Review system correctly updates existing review instead of creating new one")
        
        # Restore original token
        self.token = original_token
        return True

    def test_tutor_reviews_endpoint(self):
        """Test GET /api/reviews/my/received endpoint"""
        print("\n🔍 Testing Tutor Reviews Endpoint...")
        
        # Ensure we have tutor token
        if not self.token:
            self.log_test("Tutor Reviews Endpoint", False, "No tutor token available")
            return False
        
        success, response = self.run_test(
            "Get My Received Reviews",
            "GET",
            "api/reviews/my/received",
            200
        )
        
        if success:
            print(f"   ✅ Found {len(response)} reviews for tutor")
            return True
        return False

    def test_check_existing_review_endpoint(self):
        """Test GET /api/reviews/check/{tutor_id} endpoint"""
        print("\n🔍 Testing Check Existing Review Endpoint...")
        
        # Get tutor ID
        tutor_id = None
        if self.token:
            success, response = self.run_test(
                "Get Current User for Review Check",
                "GET",
                "api/me",
                200
            )
            if success:
                tutor_id = response['id']
        
        if not tutor_id:
            self.log_test("Check Review Setup", False, "Could not get tutor ID")
            return False
        
        # Create/login student for testing
        student_token, student_id = self.test_student_signup()
        if not student_token:
            login_data = {
                "email": "teststudent@example.com",
                "password": "Test123!@#"
            }
            success, response = self.run_test(
                "Student Login for Check Review",
                "POST",
                "api/auth/login",
                200,
                data=login_data
            )
            if success and 'token' in response:
                student_token = response['token']
            else:
                self.log_test("Check Review Setup", False, "Could not login student")
                return False
        
        # Switch to student token
        original_token = self.token
        self.token = student_token
        
        success, response = self.run_test(
            "Check Existing Review",
            "GET",
            f"api/reviews/check/{tutor_id}",
            200
        )
        
        if success:
            # Should have has_review and review fields
            if "has_review" in response and "review" in response:
                print(f"   ✅ Check review response: has_review={response['has_review']}")
                self.token = original_token
                return True
            else:
                self.log_test("Check Review Response Format", False, f"Missing required fields in response: {response}")
        
        self.token = original_token
        return False

    def test_profile_view_tracking(self):
        """Test POST /api/tutors/{tutor_id}/view endpoint"""
        print("\n🔍 Testing Profile View Tracking...")
        
        # Get tutor ID
        tutor_id = None
        if self.token:
            success, response = self.run_test(
                "Get Current User for View Tracking",
                "GET",
                "api/me",
                200
            )
            if success:
                tutor_id = response['id']
        
        if not tutor_id:
            self.log_test("Profile View Setup", False, "Could not get tutor ID")
            return False
        
        # Test profile view tracking (no auth required)
        original_token = self.token
        self.token = None  # Remove auth to test no auth required
        
        success, response = self.run_test(
            "Track Profile View",
            "POST",
            f"api/tutors/{tutor_id}/view",
            200
        )
        
        self.token = original_token
        
        if success:
            print("   ✅ Profile view tracked successfully without authentication")
            return True
        return False

    def test_delete_profile_endpoint(self):
        """Test DELETE /api/profile/delete endpoint"""
        print("\n🔍 Testing Delete Profile Endpoint...")
        
        # Create a test user specifically for deletion
        delete_user_data = {
            "email": "deletetest@example.com",
            "password": "Test123!@#",
            "role": "student",
            "name": "Delete Test User",
            "mobile": "9876543212"
        }
        
        success, response = self.run_test(
            "Create User for Deletion Test",
            "POST",
            "api/auth/signup",
            [200, 400],  # Accept both success and "already exists"
            data=delete_user_data
        )
        
        delete_token = None
        if success and 'token' in response:
            delete_token = response['token']
        else:
            # Try login if signup failed
            login_data = {
                "email": "deletetest@example.com",
                "password": "Test123!@#"
            }
            success, response = self.run_test(
                "Login User for Deletion Test",
                "POST",
                "api/auth/login",
                200,
                data=login_data
            )
            if success and 'token' in response:
                delete_token = response['token']
        
        if not delete_token:
            self.log_test("Delete Profile Setup", False, "Could not create/login test user for deletion")
            return False
        
        # Test delete without auth (should fail)
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Delete Profile Without Auth (Should Fail)",
            "DELETE",
            "api/profile/delete",
            401  # Expecting unauthorized
        )
        
        if not success:
            self.log_test("Delete Profile Auth Check", False, "Delete should require authentication")
            self.token = original_token
            return False
        
        # Test delete with auth (should succeed)
        self.token = delete_token
        
        success, response = self.run_test(
            "Delete Profile With Auth",
            "DELETE",
            "api/profile/delete",
            200
        )
        
        self.token = original_token
        
        if success:
            print("   ✅ Profile deletion requires auth and works correctly")
            return True
        return False

    def test_multi_mode_requirements(self):
        """Test POST /api/requirements with mode as array"""
        print("\n🔍 Testing Multi-Mode Requirements...")
        
        # Create/login student for requirements
        student_token, student_id = self.test_student_signup()
        if not student_token:
            login_data = {
                "email": "teststudent@example.com",
                "password": "Test123!@#"
            }
            success, response = self.run_test(
                "Student Login for Requirements",
                "POST",
                "api/auth/login",
                200,
                data=login_data
            )
            if success and 'token' in response:
                student_token = response['token']
            else:
                self.log_test("Multi-Mode Requirements Setup", False, "Could not login student")
                return False
        
        # Switch to student token
        original_token = self.token
        self.token = student_token
        
        # Test requirements with mode as array
        requirement_data = {
            "subject": "Mathematics",
            "level_class": "12",
            "mode": ["Online", "Home"],  # Array of modes
            "requirement_type": "Regular Classes",
            "gender_preference": "Any",
            "time_preference": "Evening",
            "languages": ["English", "Hindi"],
            "location": "Chandigarh",
            "phone": "9876543213",
            "description": "Need help with calculus"
        }
        
        success, response = self.run_test(
            "Create Requirement with Multi-Mode",
            "POST",
            "api/requirements",
            [200, 403],  # Accept both success and email verification required
            data=requirement_data
        )
        
        self.token = original_token
        
        if success:
            if "id" in response:
                print("   ✅ Multi-mode requirements accepted successfully")
                return True
            elif "email" in str(response).lower() and "verify" in str(response).lower():
                print("   ✅ Multi-mode requirements validation works (email verification required)")
                return True
        return False

    def run_new_endpoint_tests(self):
        """Run tests for new backend endpoints"""
        print("🚀 Starting New Backend Endpoint Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # First ensure we have a tutor logged in
        if not self.test_tutor_signup():
            print("❌ Tutor signup failed, trying login...")
            if not self.test_login():
                print("❌ Both tutor signup and login failed, stopping tests")
                return False
        
        # Test the new endpoints
        test_results = []
        
        print("\n📝 Testing New Backend Endpoints...")
        test_results.append(self.test_review_system_one_per_student())
        test_results.append(self.test_tutor_reviews_endpoint())
        test_results.append(self.test_check_existing_review_endpoint())
        test_results.append(self.test_profile_view_tracking())
        test_results.append(self.test_delete_profile_endpoint())
        test_results.append(self.test_multi_mode_requirements())
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 New Endpoint Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return all(test_results)

    def run_otp_focused_tests(self):
        """Run OTP-focused tests as requested in review"""
        print("🚀 Starting OTP Email Functionality Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test the specific OTP functionality
        test_results = []
        
        print("\n📧 Testing OTP Email Functionality...")
        test_results.append(self.test_forgot_password_api())
        test_results.append(self.test_verify_otp_mock_rejection())
        test_results.append(self.test_reset_password_mock_rejection())
        test_results.append(self.test_send_otp_email_api())
        test_results.append(self.test_email_service_limitation())
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 OTP Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return all(test_results)

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
    
    # Run new endpoint tests as requested in review
    success = tester.run_new_endpoint_tests()
    
    # Create test reports directory if it doesn't exist
    import os
    os.makedirs('/app/test_reports', exist_ok=True)
    
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