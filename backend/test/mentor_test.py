import unittest
import sys
import os
from unittest.mock import MagicMock, patch
from flask import json, jsonify
from datetime import datetime, timedelta
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api import create_app
from api.models import User, Availability, Appointment
from backend.api.instructor import *

class instructorTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    def test_is_valid_date(self):
        future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        self.assertTrue(is_valid_date(future_date))
        today_date = datetime.now().strftime("%Y-%m-%d")
        self.assertTrue(is_valid_date(today_date))
        past_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        self.assertFalse(is_valid_date(past_date))
        self.assertFalse(is_valid_date("invalid-date"))

    def test_is_valid_time(self):
        self.assertTrue(is_valid_time("15:30"))
        self.assertFalse(is_valid_time("25:30"))

    def test_is_start_time_before_end_time(self):
        self.assertTrue(is_start_time_before_end_time("09:00", "10:00"))
        self.assertFalse(is_start_time_before_end_time("10:00", "10:00"))
        self.assertFalse(is_start_time_before_end_time("11:00", "10:00"))
        self.assertFalse(is_start_time_before_end_time("10:00", "10:29"))
        self.assertFalse(is_start_time_before_end_time("10:00", "invalid-time"))
        self.assertFalse(is_start_time_before_end_time("invalid-time", "11:00"))
        

    @patch('api.instructor.get_jwt_identity')
    @patch('api.instructor.Availability.query')
    @patch('api.instructor.db.session')
    def test_add_instructor_availability(self, mock_db_session, mock_availability_query, mock_jwt_identity):
        # Set up mocks
        mock_jwt_identity.return_value = 1
        mock_availability_query.filter_by.return_value.all.return_value = []
        mock_db_session.add = MagicMock()
        mock_db_session.commit = MagicMock()

        # Define test data
        data = {
            'type': 'instructoring Session',
            'date': '2023-12-25',
            'start_time': '10:00',
            'end_time': '11:00'
        }
        response = self.client.post('/instructor/add-availability', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 201)

    # Tests for other endpoints and functions...
    @patch('api.instructor.Appointment.query')
    @patch('api.instructor.db.session')
    @patch('api.instructor.send_confirmation_email')
    def test_update_meeting_status(self, mock_send_email, mock_db_session, mock_appointment_query):
        # Mock Appointment query and db session
        mock_appointment = MagicMock(spec=Appointment)
        mock_appointment_query.get.return_value = mock_appointment
        mock_db_session.commit = MagicMock()

        # Mock data for the request
        data = {
            'appointment_id': 1,
            'status': 'reserved'
        }
        response = self.client.post('/meeting/update/status', data=json.dumps(data), content_type='application/json')

        self.assertEqual(response.status_code, 200)
        mock_appointment_query.get.assert_called_with(1)
        mock_db_session.commit.assert_called()
        mock_send_email.assert_called_with(mock_appointment)
        
    
    @patch('api.instructor.get_jwt_identity')
    @patch('api.instructor.User.query')
    @patch('api.instructor.db.session')
    def test_set_auto_approve(self, mock_db_session, mock_user_query, mock_jwt_identity):
        # Mock get_jwt_identity, User query, and db session
        mock_jwt_identity.return_value = 1
        mock_instructor = MagicMock(spec=User)
        mock_user_query.filter_by.return_value.first.return_value = mock_instructor
        mock_db_session.commit = MagicMock()

        # Mock data for the request
        data = {'auto_approve': True}
        response = self.client.post('/instructor/settings/auto-approve', data=json.dumps(data), content_type='application/json')

        self.assertEqual(response.status_code, 200)
        mock_user_query.filter_by.assert_called_with(id=1, account_type='instructor')
        self.assertTrue(mock_instructor.auto_approve_appointments)
        mock_db_session.commit.assert_called()
    
    
    @patch('api.instructor.get_jwt_identity')
    @patch('api.instructor.Appointment.query')
    @patch('api.instructor.db.session')
    @patch('api.instructor.send_confirmation_email')
    def test_update_instructor_appointment_status(self, mock_send_email, mock_db_session, mock_appointment_query, mock_jwt_identity):
        # Mock get_jwt_identity, Appointment query, db session, and send_confirmation_email
        mock_jwt_identity.return_value = 1
        mock_appointment = MagicMock(spec=Appointment, id=1, instructor_id=1, status='pending')
        mock_appointment_query.filter_by.return_value.first.return_value = mock_appointment
        mock_db_session.commit = MagicMock()
        mock_send_email.return_value = True

        # Mock data for the request
        data = {'appointment_id': 1, 'status': 'reserved'}
        response = self.client.post('/instructor/appointments/pending', data=json.dumps(data), content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        mock_appointment_query.filter_by.assert_called_with(id=1, instructor_id=1)
        self.assertEqual(mock_appointment.status, 'reserved')
        mock_db_session.commit.assert_called()
        mock_send_email.assert_called_with(mock_appointment)
        
    
    @patch('api.instructor.get_jwt_identity')
    @patch('api.instructor.User.query')
    @patch('api.instructor.Availability.query')
    def test_get_instructor_availability(self, mock_availability_query, mock_user_query, mock_jwt_identity):
        # Mock get_jwt_identity, User query, and Availability query
        mock_jwt_identity.return_value = 1
        mock_instructor = MagicMock(spec=User, id=1, account_type='instructor')
        mock_user_query.filter_by.return_value.first.return_value = mock_instructor

        mock_availability = MagicMock(spec=Availability)
        mock_availability.id = 1
        mock_availability.type = 'instructoring Session'
        mock_availability.date = '2023-04-01'
        mock_availability.start_time = '10:00'
        mock_availability.end_time = '11:00'
        mock_availability_query.filter_by.return_value.all.return_value = [mock_availability]

        response = self.client.get('/instructor/availability')

        self.assertEqual(response.status_code, 200)
        mock_user_query.filter_by.assert_called_with(id=1, account_type='instructor')
        mock_availability_query.filter_by.assert_called_with(user_id=1)
        
        
    @patch('api.instructor.get_jwt_identity')
    @patch('api.instructor.User.query')
    @patch('api.instructor.Availability.query')
    @patch('api.instructor.db.session')
    def test_delete_instructor_availability(self, mock_db_session, mock_availability_query, mock_user_query, mock_jwt_identity):
        # Mock get_jwt_identity, User query, Availability query, and db session
        mock_jwt_identity.return_value = 1
        mock_instructor = MagicMock(spec=User, id=1, account_type='instructor')
        mock_user_query.filter_by.return_value.first.return_value = mock_instructor
        mock_availability = MagicMock(spec=Availability, id=1, user_id=1)
        mock_availability_query.get.return_value = mock_availability
        mock_db_session.commit = MagicMock()

        availability_id = '1'
        response = self.client.delete(f'/instructor/delete-availability/{availability_id}')

        self.assertEqual(response.status_code, 200)
        mock_availability_query.get.assert_called_with(availability_id)  
        mock_db_session.delete.assert_called_with(mock_availability)
        mock_db_session.commit.assert_called()
        
        
    @patch('api.instructor.get_jwt_identity')
    @patch('api.instructor.Appointment.query')
    @patch('api.instructor.User.query')
    @patch('api.instructor.db.session')
    def test_cancel_appointment(self, mock_db_session, mock_user_query, mock_appointment_query, mock_jwt_identity):
        # Mock get_jwt_identity, Appointment query, User query, and db session
        mock_jwt_identity.return_value = 1
        mock_instructor = MagicMock(spec=User, id=1)
        mock_user_query.get.return_value = mock_instructor

        future_date = datetime.now() + timedelta(days=1)
        mock_appointment = MagicMock(spec=Appointment, id=1, instructor_id=1, appointment_date=future_date.strftime('%Y-%m-%d'), start_time='10:00', status='reserved')
        mock_appointment_query.get.return_value = mock_appointment
        mock_db_session.commit = MagicMock()

        appointment_id = '1'
        response = self.client.post(f'/instructor/appointments/cancel/{appointment_id}')

        # Assertions
        self.assertEqual(response.status_code, 200)
        mock_appointment_query.get.assert_called_with(appointment_id)
        self.assertEqual(mock_appointment.status, 'canceled')
        mock_db_session.commit.assert_called()
    
if __name__ == '__main__':
    unittest.main(verbosity=2)
