import unittest
import sys
import os
from unittest.mock import patch
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api import create_app  
from api.models import User  
from api.admin import *
from flask import json

class AdminTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    # Mock setup for User.query
    def mock_user_query(self, account_type=None, user_id=None):
        mock_user = User(id=1, first_name='Test User', email='test@example.com', 
                         account_type='student', status='active',
                         linkedin_url='https://www.linkedin.com/in/testuser/', 
                         about='I am a test user', 
                         meeting_url='https://calendly.com/testuser/',
                         auto_approve_appointments=True)
        if account_type:
            mock_user.account_type = account_type
        if user_id:
            mock_user.id = user_id
        return [mock_user]

    @patch('api.admin.User.query')
    def test_get_all_users(self, mock_query):
        mock_query.all.return_value = self.mock_user_query()
        response = self.client.get('/admin/all-users')
        self.assertEqual(response.status_code, 200)


    @patch('api.admin.User.query')
    def test_get_all_admins(self, mock_query):
        mock_query.filter_by.return_value = self.mock_user_query(account_type='admin')
        response = self.client.get('/admin/admins')
        self.assertEqual(response.status_code, 200)


    @patch('api.admin.User.query')
    def test_get_all_students(self, mock_query):
        mock_query.filter_by.return_value = self.mock_user_query(account_type='student')
        response = self.client.get('/admin/students')
        self.assertEqual(response.status_code, 200) 
        
    
    @patch('api.admin.User.query')
    def test_get_all_mentors(self, mock_query):
        mock_query.filter_by.return_value = self.mock_user_query(account_type='mentor')
        response = self.client.get('/admin/mentors')
        self.assertEqual(response.status_code, 200)
        

    @patch('api.admin.User.query')
    @patch('api.admin.db.session')
    def test_change_account_type(self, mock_db_session, mock_query):
        mock_query.get.return_value = self.mock_user_query(user_id=1)[0]
        data = {'user_id': 1, 'new_account_type': 'mentor'}
        response = self.client.post('/admin/change-account-type', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

    
    @patch('api.admin.User.query')
    @patch('api.admin.db.session')
    def test_change_account_status(self, mock_db_session, mock_query):
        mock_query.get.return_value = self.mock_user_query(user_id=1)[0]
        data = {'user_id': 1, 'new_account_status': 'inactive'}
        response = self.client.post('/admin/change-account-status', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)


if __name__ == '__main__':
    unittest.main(verbosity=2)
