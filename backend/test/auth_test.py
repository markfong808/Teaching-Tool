import unittest
import sys
import os
from unittest.mock import MagicMock, patch
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api import create_app  
from api.models import User  
from api.auth import login, logout, sign_up, create_account
from werkzeug.security import generate_password_hash
from flask import json

class AuthTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    @patch('api.auth.User.query')
    def test_login(self, mock_query):
        # Mock User query for login
        mock_user = User(id=1, email='test@example.com', first_name='Test', password=generate_password_hash('password'), status='active')
        mock_query.filter_by.return_value.first.return_value = mock_user

        data = {'email': 'test@example.com', 'password': 'password'}
        response = self.client.post('/login', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        # Assert other response attributes

    def test_logout(self):
        response = self.client.post('/logout')
        self.assertEqual(response.status_code, 200)
        # Assert other response attributes

    @patch('api.auth.User.query')
    @patch('api.auth.db.session')
    def test_sign_up(self, mock_db_session, mock_query):
        # Mock User query to simulate that the email is not already in use
        mock_query.filter_by.return_value.first.return_value = None

        data = {'email': 'neww@uw.edu', 'name': 'New User', 'password': 'newpass', 'verifyPassword': 'newpass', 'userType': 'student'}
        response = self.client.post('/sign-up', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 201)


    @patch('api.auth.db.session')
    def test_create_account(self, mock_db_session):
        # Mock db.session.add to manually set the user ID
        def mock_add(user):
            user.id = 1  # Mocked user ID
        mock_db_session.add.side_effect = mock_add
        mock_db_session.commit = MagicMock()

        user_id = create_account('new@uw.edu', 'New User', 'student', 'active', 'newpass')
        self.assertIsNotNone(user_id)
        self.assertIsInstance(user_id, int)
        

if __name__ == '__main__':
    unittest.main(verbosity=2)
