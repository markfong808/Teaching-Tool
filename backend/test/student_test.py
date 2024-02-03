import unittest
import sys
import os
from unittest.mock import MagicMock, patch
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api import create_app
from api.models import User, ProgramType  
from api.student import *
import json


class StudentBlueprintTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    @patch('api.student.ProgramType.query')
    def test_get_program_description(self, mock_query):
        mock_program = MagicMock(spec=ProgramType, description="Test Description")
        mock_query.filter_by.return_value.first.return_value = mock_program
        response = self.client.get('/program/description?program_type=Mentoring Session')
        self.assertEqual(response.status_code, 200)
        self.assertIn("Test Description", response.get_json()['description'])
        
        
    @patch('api.student.Appointment.query')
    def test_get_available_appointment_slots(self, mock_appointment_query):
        mock_future_appointments = [MagicMock(spec=Appointment, id=1, appointment_date=datetime.now().date(), type="Mentoring Session", start_time="15:00", end_time="16:00", status="posted")]
        mock_appointment_query.filter.return_value.filter.return_value.filter.return_value.all.return_value = mock_future_appointments
        response = self.client.get('/student/appointments/available/Mentoring Session')
        self.assertEqual(response.status_code, 200)
        response = self.client.get('/student/appointments/available/Invalid Program Type')
        self.assertEqual(response.status_code, 400)
        
        
    
    @patch('api.student.get_jwt_identity')
    @patch('api.student.Appointment.query')
    @patch('api.student.User.query')
    @patch('api.student.db.session')
    @patch('api.student.send_confirmation_email')
    def test_reserve_appointment(self, mock_send_email, mock_db_session, mock_user_query, mock_appointment_query, mock_jwt_identity):
        mock_jwt_identity.return_value = 1
        mock_student = MagicMock(spec=User, id=1, account_type='student', meeting_url='http://example.com/meeting')
        mock_user_query.get.return_value = mock_student
        future_date = datetime.now() + timedelta(days=1)
        mock_appointment = MagicMock(spec=Appointment, id=1, appointment_date=future_date.strftime('%Y-%m-%d'), start_time='10:00', status='posted', mentor_id=2)
        mock_appointment_query.get.return_value = mock_appointment
        mock_send_email.return_value = True
        mock_db_session.commit = MagicMock()
        appointment_id = '1'
        data = {'notes': 'Test notes'}
        response = self.client.post(f'/student/appointments/reserve/{appointment_id}', data=json.dumps(data), content_type='application/json')
        self.assertIn(response.status_code, [201, 202])
        mock_appointment_query.get.assert_called_with(appointment_id)
        self.assertEqual(mock_appointment.student_id, 1)
        self.assertEqual(mock_appointment.notes, 'Test notes')
        mock_db_session.commit.assert_called()


    @patch('api.student.get_jwt_identity')
    @patch('api.student.Appointment.query')
    @patch('api.student.db.session')
    def test_update_meeting(self, mock_db_session, mock_appointment_query, mock_jwt_identity):
        mock_jwt_identity.return_value = 1
        mock_appointment = MagicMock(spec=Appointment)
        mock_appointment_query.filter_by.return_value.first.return_value = mock_appointment
        mock_db_session.commit = MagicMock()
        appointment_id = 1
        data = {'appointment_id': appointment_id, 'notes': 'Updated notes', 'meeting_url': 'http://example.com/meeting'}
        response = self.client.post('/meetings/update', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        mock_appointment_query.filter_by.assert_called_with(id=appointment_id)
        self.assertEqual(mock_appointment.notes, 'Updated notes')
        self.assertEqual(mock_appointment.meeting_url, 'http://example.com/meeting')
        mock_db_session.commit.assert_called()
        
        
        
    @patch('api.student.get_jwt_identity')
    @patch('api.student.Appointment.query')
    @patch('api.student.User.query')
    @patch('api.student.db.session')
    def test_cancel_appointment(self, mock_db_session, mock_user_query, mock_appointment_query, mock_jwt_identity):
        mock_jwt_identity.return_value = 1
        mock_student = MagicMock(spec=User, id=1)
        mock_user_query.get.return_value = mock_student
        future_date = datetime.now() + timedelta(days=1)
        mock_appointment = MagicMock(spec=Appointment, id=1, student_id=1, appointment_date=future_date.strftime('%Y-%m-%d'), start_time='10:00', status='reserved')
        mock_appointment_query.get.return_value = mock_appointment
        mock_db_session.commit = MagicMock()
        appointment_id = '1'
        response = self.client.post(f'/student/appointments/cancel/{appointment_id}')
        self.assertEqual(response.status_code, 200)
        mock_appointment_query.get.assert_called_with(appointment_id)
        self.assertEqual(mock_appointment.status, 'posted')
        self.assertIsNone(mock_appointment.student_id)
        self.assertIsNone(mock_appointment.notes)
        mock_db_session.commit.assert_called()
    
    
if __name__ == '__main__':
    unittest.main(verbosity=2)