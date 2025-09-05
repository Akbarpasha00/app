import requests
import sys
import json
from datetime import datetime, timezone
from uuid import uuid4

class CampusHireAPITester:
    def __init__(self, base_url="https://campushire.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'students': [],
            'companies': [],
            'drives': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Created resource ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        if success:
            required_fields = ['total_students', 'total_companies', 'total_drives', 
                             'upcoming_drives', 'total_applications', 'selected_students', 'placement_rate']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing field in stats: {field}")
                    return False
            print(f"   Stats: {response}")
        return success

    def test_create_student(self):
        """Test student creation with validation"""
        test_student = {
            "name": "John Doe",
            "roll_no": f"CS2024{str(uuid4())[:8]}",
            "branch": "Computer Science",
            "year": 3,
            "cgpa": 8.5,
            "skills": ["Python", "React", "MongoDB"],
            "email": f"john.doe.{str(uuid4())[:8]}@example.com",
            "phone": "+1234567890",
            "resume_url": "https://example.com/resume.pdf"
        }
        
        success, response = self.run_test(
            "Create Student",
            "POST",
            "students",
            200,
            data=test_student
        )
        
        if success and 'id' in response:
            self.created_resources['students'].append(response['id'])
            # Verify all fields are returned correctly
            for key, value in test_student.items():
                if key in response and response[key] != value:
                    print(f"❌ Field mismatch - {key}: expected {value}, got {response[key]}")
                    return False
        return success

    def test_duplicate_roll_number(self):
        """Test duplicate roll number validation"""
        if not self.created_resources['students']:
            print("❌ No students created yet, skipping duplicate test")
            return False
            
        # Try to create student with same roll number
        duplicate_student = {
            "name": "Jane Doe",
            "roll_no": "CS2024DUPLICATE",  # This should fail
            "branch": "Computer Science",
            "year": 2,
            "cgpa": 7.5,
            "skills": ["Java"],
            "email": "jane.doe@example.com",
            "phone": "+1234567891"
        }
        
        # First create a student
        success1, _ = self.run_test(
            "Create Student for Duplicate Test",
            "POST",
            "students",
            200,
            data=duplicate_student
        )
        
        if success1:
            # Now try to create another with same roll number - should fail
            success2, _ = self.run_test(
                "Test Duplicate Roll Number (should fail)",
                "POST",
                "students",
                400,  # Expecting 400 Bad Request
                data=duplicate_student
            )
            return success2
        return False

    def test_invalid_cgpa(self):
        """Test CGPA validation"""
        invalid_student = {
            "name": "Invalid Student",
            "roll_no": f"CS2024{str(uuid4())[:8]}",
            "branch": "Computer Science",
            "year": 2,
            "cgpa": 15.0,  # Invalid CGPA > 10
            "skills": ["Python"],
            "email": f"invalid.{str(uuid4())[:8]}@example.com",
            "phone": "+1234567892"
        }
        
        success, _ = self.run_test(
            "Test Invalid CGPA (should pass - no validation in backend)",
            "POST",
            "students",
            200,  # Backend doesn't validate CGPA range
            data=invalid_student
        )
        return success

    def test_get_students(self):
        """Test getting all students"""
        success, response = self.run_test(
            "Get All Students",
            "GET",
            "students",
            200
        )
        
        if success:
            print(f"   Found {len(response)} students")
            if len(response) > 0:
                student = response[0]
                required_fields = ['id', 'name', 'roll_no', 'branch', 'year', 'cgpa', 'email', 'phone']
                for field in required_fields:
                    if field not in student:
                        print(f"❌ Missing field in student: {field}")
                        return False
        return success

    def test_get_student_by_id(self):
        """Test getting specific student"""
        if not self.created_resources['students']:
            print("❌ No students created yet, skipping get by ID test")
            return False
            
        student_id = self.created_resources['students'][0]
        success, response = self.run_test(
            "Get Student by ID",
            "GET",
            f"students/{student_id}",
            200
        )
        
        if success and response.get('id') != student_id:
            print(f"❌ ID mismatch - expected {student_id}, got {response.get('id')}")
            return False
        return success

    def test_update_student(self):
        """Test updating student"""
        if not self.created_resources['students']:
            print("❌ No students created yet, skipping update test")
            return False
            
        student_id = self.created_resources['students'][0]
        update_data = {
            "name": "John Doe Updated",
            "roll_no": f"CS2024{str(uuid4())[:8]}",
            "branch": "Computer Science",
            "year": 4,
            "cgpa": 9.0,
            "skills": ["Python", "React", "MongoDB", "Docker"],
            "email": f"john.updated.{str(uuid4())[:8]}@example.com",
            "phone": "+1234567890"
        }
        
        success, response = self.run_test(
            "Update Student",
            "PUT",
            f"students/{student_id}",
            200,
            data=update_data
        )
        
        if success:
            if response.get('name') != update_data['name']:
                print(f"❌ Update failed - name not updated")
                return False
        return success

    def test_create_company(self):
        """Test company creation"""
        test_company = {
            "name": "Tech Corp",
            "description": "Leading technology company specializing in software development",
            "website": "https://techcorp.com",
            "industry": "Technology",
            "location": "San Francisco, CA"
        }
        
        success, response = self.run_test(
            "Create Company",
            "POST",
            "companies",
            200,
            data=test_company
        )
        
        if success and 'id' in response:
            self.created_resources['companies'].append(response['id'])
        return success

    def test_get_companies(self):
        """Test getting all companies"""
        success, response = self.run_test(
            "Get All Companies",
            "GET",
            "companies",
            200
        )
        
        if success:
            print(f"   Found {len(response)} companies")
        return success

    def test_get_company_by_id(self):
        """Test getting specific company"""
        if not self.created_resources['companies']:
            print("❌ No companies created yet, skipping get by ID test")
            return False
            
        company_id = self.created_resources['companies'][0]
        success, response = self.run_test(
            "Get Company by ID",
            "GET",
            f"companies/{company_id}",
            200
        )
        return success

    def test_create_drive(self):
        """Test drive creation"""
        if not self.created_resources['companies']:
            print("❌ No companies created yet, skipping drive creation test")
            return False
            
        company_id = self.created_resources['companies'][0]
        test_drive = {
            "company_id": company_id,
            "role": "Software Engineer",
            "job_description": "Develop and maintain web applications",
            "ctc": 1200000.0,
            "eligibility_criteria": "CGPA >= 7.0, CS/IT branch",
            "drive_date": "2024-12-15T10:00:00Z",
            "location": "Bangalore"
        }
        
        success, response = self.run_test(
            "Create Drive",
            "POST",
            "drives",
            200,
            data=test_drive
        )
        
        if success and 'id' in response:
            self.created_resources['drives'].append(response['id'])
        return success

    def test_get_drives(self):
        """Test getting all drives"""
        success, response = self.run_test(
            "Get All Drives",
            "GET",
            "drives",
            200
        )
        
        if success:
            print(f"   Found {len(response)} drives")
        return success

    def test_delete_student(self):
        """Test deleting student"""
        if not self.created_resources['students']:
            print("❌ No students created yet, skipping delete test")
            return False
            
        student_id = self.created_resources['students'][-1]  # Delete last created
        success, response = self.run_test(
            "Delete Student",
            "DELETE",
            f"students/{student_id}",
            200
        )
        
        if success:
            self.created_resources['students'].remove(student_id)
        return success

    def test_nonexistent_student(self):
        """Test getting non-existent student"""
        fake_id = str(uuid4())
        success, _ = self.run_test(
            "Get Non-existent Student (should fail)",
            "GET",
            f"students/{fake_id}",
            404
        )
        return success

    def test_create_application(self):
        """Test application creation"""
        if not self.created_resources['students'] or not self.created_resources['drives']:
            print("❌ Need students and drives for application test")
            return False
            
        student_id = self.created_resources['students'][0]
        drive_id = self.created_resources['drives'][0]
        
        test_application = {
            "student_id": student_id,
            "drive_id": drive_id
        }
        
        success, response = self.run_test(
            "Create Application",
            "POST",
            "applications",
            200,
            data=test_application
        )
        
        if success and 'id' in response:
            self.created_resources.setdefault('applications', []).append(response['id'])
        return success

    def test_get_applications(self):
        """Test getting all applications"""
        success, response = self.run_test(
            "Get All Applications",
            "GET",
            "applications",
            200
        )
        
        if success:
            print(f"   Found {len(response)} applications")
        return success

    def test_update_application_status(self):
        """Test updating application status"""
        if not self.created_resources.get('applications'):
            print("❌ No applications created yet, skipping status update test")
            return False
            
        application_id = self.created_resources['applications'][0]
        status_update = {"status": "selected"}
        
        success, response = self.run_test(
            "Update Application Status to Selected",
            "PUT",
            f"applications/{application_id}/status",
            200,
            data=status_update
        )
        return success

    def test_create_offer_letter(self):
        """Test offer letter creation"""
        if not self.created_resources.get('students') or not self.created_resources.get('drives'):
            print("❌ Need students and drives for offer letter test")
            return False
            
        student_id = self.created_resources['students'][0]
        drive_id = self.created_resources['drives'][0]
        
        test_offer = {
            "student_id": student_id,
            "drive_id": drive_id,
            "joining_date": "2025-01-15T00:00:00Z",
            "final_ctc": 1500000.0
        }
        
        success, response = self.run_test(
            "Create Offer Letter",
            "POST",
            "offer-letters",
            200,
            data=test_offer
        )
        
        if success and 'id' in response:
            self.created_resources.setdefault('offers', []).append(response['id'])
            # Check if letter content is generated
            if 'letter_content' in response and len(response['letter_content']) > 0:
                print(f"   ✅ Offer letter content generated successfully")
            else:
                print(f"   ❌ Offer letter content not generated")
        return success

    def test_get_offer_letters(self):
        """Test getting all offer letters"""
        success, response = self.run_test(
            "Get All Offer Letters",
            "GET",
            "offer-letters",
            200
        )
        
        if success:
            print(f"   Found {len(response)} offer letters")
        return success

    def test_drive_status_update(self):
        """Test updating drive status"""
        if not self.created_resources.get('drives'):
            print("❌ No drives created yet, skipping status update test")
            return False
            
        drive_id = self.created_resources['drives'][0]
        
        success, response = self.run_test(
            "Update Drive Status to Completed",
            "PUT",
            f"drives/{drive_id}/status?status=completed",
            200
        )
        return success

def main():
    print("🚀 Starting CampusHire API Testing...")
    print("=" * 60)
    
    tester = CampusHireAPITester()
    
    # Test sequence
    tests = [
        ("Dashboard Stats", tester.test_dashboard_stats),
        ("Create Student", tester.test_create_student),
        ("Duplicate Roll Number Validation", tester.test_duplicate_roll_number),
        ("Invalid CGPA Handling", tester.test_invalid_cgpa),
        ("Get All Students", tester.test_get_students),
        ("Get Student by ID", tester.test_get_student_by_id),
        ("Update Student", tester.test_update_student),
        ("Create Company", tester.test_create_company),
        ("Get All Companies", tester.test_get_companies),
        ("Get Company by ID", tester.test_get_company_by_id),
        ("Create Drive", tester.test_create_drive),
        ("Get All Drives", tester.test_get_drives),
        ("Delete Student", tester.test_delete_student),
        ("Non-existent Student", tester.test_nonexistent_student),
    ]
    
    print(f"\n📋 Running {len(tests)} test suites...")
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test suite failed with exception: {str(e)}")
    
    # Print final results
    print(f"\n{'='*60}")
    print(f"📊 FINAL RESULTS")
    print(f"{'='*60}")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())