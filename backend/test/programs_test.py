import os
import sys
import unittest
from unittest.mock import patch, MagicMock
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api import create_app
from api.models import ProgramType, User
from api.programs import is_admin
from flask import json

class ProgramsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    @patch('api.programs.ProgramType.query')
    def test_get_programs(self, mock_query):
        # Create a mock program object with serializable attributes
        mock_program = MagicMock()
        mock_program.id = 1
        mock_program.name = "Program 1"
        mock_program.description = "Desc 1"
        mock_program.duration = 60

        # Set the return value of the query to a list containing the mock program
        mock_query.all.return_value = [mock_program]

        response = self.client.get('/programs')
        self.assertEqual(response.status_code, 200)
        
        
    @patch('api.programs.ProgramType.query')
    def test_get_program(self, mock_program_query):
        mock_program = MagicMock(spec=ProgramType)
        mock_program.name = "Program Name"
        mock_program.description = "Program Description"
        mock_program.duration = 120
        mock_program_query.get_or_404.return_value = mock_program

        program_id = 1
        response = self.client.get(f'/program/{program_id}')

        self.assertEqual(response.status_code, 200)
        mock_program_query.get_or_404.assert_called_with(program_id)
        response_data = json.loads(response.get_data(as_text=True))
        self.assertEqual(response_data['name'], "Program Name")
        self.assertEqual(response_data['description'], "Program Description")
        self.assertEqual(response_data['duration'], 120)

    @patch('api.programs.get_jwt_identity')
    @patch('api.programs.User.query')
    @patch('api.programs.ProgramType.query')
    @patch('api.programs.db.session')
    def test_create_program(self, mock_db_session, mock_program_query, mock_user_query, mock_jwt_identity):
        mock_jwt_identity.return_value = 1
        mock_admin_user = MagicMock(spec=User, id=1, account_type='admin')
        mock_user_query.filter_by.return_value.first.return_value = mock_admin_user
        mock_program_query.filter_by.return_value.first.return_value = None
        mock_db_session.add = MagicMock()
        mock_db_session.commit = MagicMock()

        data = {'name': 'New Program', 'description': 'New Description', 'duration': 60}
        response = self.client.post('/program', data=json.dumps(data), content_type='application/json')

        self.assertEqual(response.status_code, 201)
        mock_program_query.filter_by.assert_called_with(name='New Program')
        mock_db_session.add.assert_called()
        mock_db_session.commit.assert_called()
        

    @patch('api.programs.User.query')
    def test_is_admin(self, mock_user_query):
        mock_admin = MagicMock(spec=User, account_type='admin')
        mock_user_query.filter_by.return_value.first.return_value = mock_admin

        user_id = 1
        result = is_admin(user_id)
        self.assertTrue(result)

        # Test for non-admin user
        mock_non_admin = MagicMock(spec=User, account_type='user')
        mock_user_query.filter_by.return_value.first.return_value = mock_non_admin
        result = is_admin(user_id)
        self.assertFalse(result)


    @patch('api.programs.get_jwt_identity')
    @patch('api.programs.ProgramType.query')
    @patch('api.programs.User.query')
    @patch('api.programs.db.session')
    def test_update_program(self, mock_db_session, mock_user_query, mock_program_query, mock_jwt_identity):
        mock_jwt_identity.return_value = 1
        mock_admin_user = MagicMock(spec=User, id=1, account_type='admin')
        mock_user_query.filter_by.return_value.first.return_value = mock_admin_user
        mock_program_query.filter_by.return_value.first.return_value = None
        mock_program = MagicMock(spec=ProgramType)
        mock_program_query.get_or_404.return_value = mock_program
        mock_db_session.add = MagicMock()
        mock_db_session.commit = MagicMock()

        program_id = 1
        data = {'name': 'Updated Program', 'description': 'Updated Description', 'duration': 90}
        response = self.client.post(f'/program/{program_id}', data=json.dumps(data), content_type='application/json')

        self.assertEqual(response.status_code, 200)
        mock_program_query.get_or_404.assert_called_with(program_id)
        self.assertEqual(mock_program.name, 'Updated Program')
        self.assertEqual(mock_program.description, 'Updated Description')
        self.assertEqual(mock_program.duration, 90)
        mock_db_session.commit.assert_called()
    
    
    @patch('api.programs.get_jwt_identity')
    @patch('api.programs.ProgramType.query')
    @patch('api.programs.User.query')
    @patch('api.programs.db.session')
    def test_delete_program(self, mock_db_session, mock_user_query, mock_program_query, mock_jwt_identity):
        # Mock get_jwt_identity to return an admin user's ID
        mock_admin_user = MagicMock(spec=User, id=1, account_type='admin')
        mock_user_query.filter_by.return_value.first.return_value = mock_admin_user
        mock_program_query.filter_by.return_value.first.return_value = None
        mock_program = MagicMock(spec=ProgramType)
        mock_program_query.get_or_404.return_value = mock_program
        mock_db_session.add = MagicMock()
        mock_db_session.commit = MagicMock()
        mock_db_session.delete = MagicMock()

        program_id = 1
        response = self.client.delete(f'/program/{program_id}')

        self.assertEqual(response.status_code, 200)
        mock_program_query.get_or_404.assert_called_with(program_id)
        mock_db_session.delete.assert_called_with(mock_program)
        mock_db_session.commit.assert_called()
    
    
if __name__ == '__main__':
    unittest.main(verbosity=2)
