import unittest
import json
import sys
import os
from unittest.mock import patch
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api import create_app  
from api.models import User  
from api.profile import get_user_data  
from api.profile import update_profile


# Before running this file, make sure you comment out 
# @jwt_required() in the profile.py for every endpoint
class ProfileTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:pass@localhost/mydatabase'
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()
    
    
    # Test get_user_profile
    @patch('api.profile.get_jwt_identity')
    @patch('api.profile.User.query')
    def test_get_user_profile(self, mock_query, mock_jwt_identity):
        # Mock a User object
        mock_user = User(id=1, first_name='Test User', email='test@example.com', account_type='student', status='active',
                         linkedin_url='https://www.linkedin.com/in/testuser/', about='I am a test user', meeting_url='https://calendly.com/testuser/',
                         auto_approve_appointments=True)
        mock_query.get.return_value = mock_user
        response = self.client.get('/profile')
        self.assertEqual(response.status_code, 200)


    # Test get_user_data
    @patch('api.profile.User.query')
    def test_get_user_data_user_exists(self, mock_query):
        # Mock the User object and its query
        mock_user = User(id=1, first_name='Test User', email='test@example.com', 
                         account_type='student', status='active',
                         linkedin_url='https://www.linkedin.com/in/testuser/', 
                         about='I am a test user', 
                         meeting_url='https://calendly.com/testuser/',
                         auto_approve_appointments=True)
        mock_query.get.return_value = mock_user

        # Test get_user_data for an existing user
        result, status_code = get_user_data(1)
        self.assertEqual(status_code, 200)
        self.assertIsNotNone(result)
        self.assertEqual(result['id'], 1)
        self.assertEqual(result['name'], 'Test User')
        self.assertEqual(result['email'], 'test@example.com')
        self.assertEqual(result['account_type'], 'student')
        self.assertEqual(result['status'], 'active')
        self.assertEqual(result['linkedin_url'], 'https://www.linkedin.com/in/testuser/')
        self.assertEqual(result['about'], 'I am a test user')
        self.assertEqual(result['meeting_url'], 'https://calendly.com/testuser/')
        self.assertEqual(result['auto_approve_appointments'], True)

    @patch('api.profile.User.query')
    def test_get_user_data_user_not_found(self, mock_query):
        # Mock the User query to return None (user not found)
        mock_query.get.return_value = None

        # Test get_user_data for a non-existing user
        result, status_code = get_user_data(999213) 
        self.assertEqual(status_code, 404)
        self.assertEqual(result, {'error': 'User does not exist'})

    # Test update_profile
    @patch('api.profile.get_jwt_identity')
    @patch('api.profile.User.query')
    @patch('api.profile.db.session')
    def test_update_profile_user_exists(self, mock_db_session, mock_query, mock_jwt_identity):
        # Mock user and JWT identity
        mock_user = User(id=1, first_name='Test User', email='test@example.com', 
                         account_type='student', status='active',
                         linkedin_url='https://www.linkedin.com/in/testuser/', 
                         about='I am a test user', 
                         meeting_url='https://calendly.com/testuser/',
                         auto_approve_appointments=True)
        mock_query.filter_by.return_value.first.return_value = mock_user
        mock_jwt_identity.return_value = 1

        # Mock data to update
        update_data = {
            'name': 'Updated Name',
            'about': 'Updated About',
            'linkedin_url': 'https://www.linkedin.com/in/updated/',
            'meeting_url': 'https://calendly.com/updated/'
        }

        # Call the endpoint
        response = self.client.post('/profile/update', data=json.dumps(update_data), content_type='application/json')

        # Assert the response
        self.assertEqual(response.status_code, 200)
        self.assertIn('Updated Name', response.get_data(as_text=True))

        # Assert that the commit was called
        mock_db_session.commit.assert_called()

    @patch('api.profile.User.query')
    @patch('api.profile.get_jwt_identity')
    def test_update_profile_user_not_found(self, mock_jwt_identity, mock_query):
        # Mock user query to return None (user not found)
        mock_query.filter_by.return_value.first.return_value = None
        mock_jwt_identity.return_value = 999  # Assuming 999 is an ID that does not exist

        # Mock data to update
        update_data = {'name': 'Updated Name'}

        # Call the endpoint
        response = self.client.post('/profile/update', data=json.dumps(update_data), content_type='application/json')

        # Assert the response
        self.assertEqual(response.status_code, 404)
        self.assertIn("User doesn't exist", response.get_data(as_text=True))
    
if __name__ == '__main__':
    unittest.main(verbosity=2)
