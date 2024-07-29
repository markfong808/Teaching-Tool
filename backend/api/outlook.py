import os
import webbrowser
import json
import requests
from msal import ConfidentialClientApplication, SerializableTokenCache
from flask import Flask, Blueprint, jsonify, request, redirect, session 
from flask_session import Session
from flask_cors import CORS
from requests_oauthlib import OAuth2Session
from oauthlib.oauth2 import BackendApplicationClient
from datetime import datetime
from dotenv import load_dotenv
import pytz
import jwt
from .models import db, User, CourseDetails
from dateutil import parser

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
load_dotenv()

# Create a Blueprint for the Outlook Calendar API
outlook_calendar_dp = Blueprint('outlook_calendar_dp', __name__)
CORS(outlook_calendar_dp, supports_credentials=True)  # Allow CORS with credentials

class OutlookCalendarService:
    SCOPES = [
        'User.Read',
        'Calendars.Read',
        'Calendars.ReadBasic',
        'Calendars.ReadWrite'
        # 'openid',
        # 'profile',
        # 'email',
        # 'https://graph.microsoft.com/Calendars.Read',
        # 'https://graph.microsoft.com/Calendars.ReadWrite',
        # 'https://graph.microsoft.com/User.Read'
    ]

    def __init__(self):
        self.client_id = '47eccb95-1b86-438f-96e0-f3735b6a29b0'
        self.client_secret = '~L18Q~NnPg3g4oy~HQEPw8aHBzKHLNqeJmyXccX6'
        self.tenant_id = 'f6b6dd5b-f02f-441a-99a0-162ac5060bd2'
        self.authority = f'https://login.microsoftonline.com/{self.tenant_id}'
        self.redirect_uri = 'http://localhost:5000/api/callback'
        self.cache = SerializableTokenCache()
        
        # MSAL ConfidentialClientApplication instance 
        self.client_app = ConfidentialClientApplication(
            self.client_id,
            client_credential=self.client_secret,
            authority=self.authority,
            token_cache=self.cache
        )    
       
    def get_token_from_cache(self):
            if 'token_cache' in session:
                self.cache.deserialize(session['token_cache'])
                accounts = self.client_app.get_accounts()
                if accounts:
                    token = self.client_app.acquire_token_silent(self.SCOPES, account=accounts[0])
                    if token:
                         print(f"Token retrieved: {token['access_token']}")
                    return token
            return None

    def get_calendar_service(self):
            token = self.get_token_from_cache()
            if not token:
                raise Exception("Missing credentials")
            print(f"Using token for calendar service: {token['access_token']}")
            return token['access_token']

    def get_events(self):
            try:
                token = self.get_calendar_service()
                
                headers = {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                }
 
                # Define the start and end datetime for the calendar view
                now = datetime.now(pytz.utc)  # Current time in UTC
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)  # Start of the current month
                end_date = (now.replace(year=now.year + 1, month=12, day=31, hour=23, minute=59, second=59))  # End of next year
                
                # start_date = datetime(now.year, 3, 1, 0, 0, 0, 0, pytz.utc)  # Start of March 1st of the current year
                # end_date = (now.replace(year=now.year + 1, month=12, day=31, hour=23, minute=59, second=59))  # End of next year
                
                # Convert to ISO 8601 format with 'Z' suffix for UTC
                start_date_iso = start_date.isoformat().replace('+00:00', 'Z')
                end_date_iso = end_date.isoformat().replace('+00:00', 'Z')

                events_url = f'https://graph.microsoft.com/v1.0/me/calendarView?startdatetime={start_date_iso}&enddatetime={end_date_iso}'

                events = []
                while events_url:
                    response = requests.get(events_url, headers=headers)
                    response.raise_for_status()
                    data = response.json()
                    print(f"Received {len(data.get('value', []))} events")
                    events.extend(data.get('value', []))
                    events_url = data.get('@odata.nextLink', None)
                
                return events
                
            except Exception as e:
                raise Exception(f"Error fetching events: {str(e)}")

    def create_event(self, event_details):
            try:
                token = self.get_calendar_service()
                headers = {
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }
                start_time = parser.parse(event_details['start'])
                end_time = parser.parse(event_details['end'])
            
            # Convert to the specified time zone, default to 'America/Los_Angeles' if not provided
                event_timezone = event_details.get('timeZone', 'America/Los_Angeles')
                timezone = pytz.timezone(event_timezone)
                start_time = start_time.astimezone(timezone)
                end_time = end_time.astimezone(timezone)
                
                body = {
                'subject': event_details['summary'],
                'body': {
                    'contentType': 'HTML',
                    'content': event_details.get('description', '')
                },
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': event_timezone
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': event_timezone
                },
                'location': {
                    'displayName': event_details.get('location', '')
                },
                'attendees': [
                    {
                        'emailAddress': {
                            'address': email
                        },
                        'type': 'required'
                    } for email in event_details.get('attendees', [])
                ]
            }
                create_event_url = 'https://graph.microsoft.com/v1.0/me/events'
                response = requests.post(create_event_url, headers=headers, json=body)
                response.raise_for_status()
                event_id = response.json().get('id')
                print("event_id:", event_id)
                return event_id
            except Exception as e:
                raise Exception(f"Error creating event: {str(e)}")
            
    #update event
    def update_event(self,event_id,event_details):
        try:
            token = self.get_calendar_service()
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            # Prepare the body for the PATCH request
            body = {}
            
            if 'summary' in event_details:
                body['subject'] = event_details['summary']
            if 'description' in event_details:
                body['body'] = {
                    'contentType': 'HTML',
                    'content': event_details['description']
                }
            if 'start' in event_details and 'end' in event_details:
                start_time = parser.parse(event_details['start'])
                end_time = parser.parse(event_details['end'])
                event_timezone = event_details.get('timeZone', 'UTC')
                
                body['start'] = {
                            'dateTime': start_time.isoformat(),
                            'timeZone': event_timezone
                        }
                body['end'] = {
                    'dateTime': end_time.isoformat(),
                    'timeZone': event_timezone
                }
            if 'location' in event_details:
                body['location'] = {
                    'displayName': event_details['location']
                }
            if 'attendees' in event_details:
                body['attendees'] = [
                    {
                        'emailAddress': {
                            'address': email
                        },
                        'type': 'required'
                    } for email in event_details['attendees']
                ]

            update_event_url = f'https://graph.microsoft.com/v1.0/me/events/{event_id}'
            response = requests.patch(update_event_url, headers=headers, json=body)
            response.raise_for_status()

            updated_event = response.json()
            print("Event updated:", updated_event)
            return updated_event

        except Exception as e:
            raise Exception(f"Error updating event: {str(e)}")

            
    #delete event
    def delete_event(self,event_id):
         try:
            token = self.get_calendar_service()
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            delete_event_url = f'https://graph.microsoft.com/v1.0/me/events/{event_id}'
            response = requests.delete(delete_event_url, headers=headers)
            response.raise_for_status()
            return {'status': 'Event deleted successfully'}
         except Exception as e:
            raise Exception(f"Error deleting event: {str(e)}")


         
    
    # Generate the authorization URL and save the state in the session       
    def login(self):
            auth_url = self.client_app.get_authorization_request_url(self.SCOPES, redirect_uri=self.redirect_uri)
            return auth_url       
            
    def callback(self,url):
            code = request.args.get('code')
            if not code:
                raise Exception("Authorization code not found")
            result = self.client_app.acquire_token_by_authorization_code(code, scopes=self.SCOPES, redirect_uri=self.redirect_uri)
            if "error" in result:
                raise Exception(f"Error acquiring token: {result.get('error_description')}")
            session['token_cache'] = self.cache.serialize() #Store Token Cache in Session
            print(f"Token acquired: {result['access_token']}")

            id_info = jwt.decode(result['id_token'], options={"verify_signature": False})
            user_email = id_info.get('preferred_username')
            user = User.query.filter_by(email=user_email).first()
            if not user:
                user = User(email=user_email, account_type='instructor', status='active')
                db.session.add(user)
            db.session.commit()
            return 'http://localhost:3000/OutlookCalendar'
         
        

"""""""""""""""""""""""""""""""""""""""""""""""""""""
""               Endpoint Functions                ""
"""""""""""""""""""""""""""""""""""""""""""""""""""""
# Instantiate the outlookCalendarService class
outlook_calendar_service = OutlookCalendarService()

# retrieve calendar events
@outlook_calendar_dp.route('/get_calendar_events', methods=['GET'])
def get_calendar_events():
    if 'token_cache' not in session:
        return jsonify({'error': 'Missing credentials'}), 401
    try:
        events = outlook_calendar_service.get_events()
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': 'An error occurred', 'details': str(e)}), 500

# initiate the authentication flow  (Microsoft Outlook button On-click)
@outlook_calendar_dp.route('/login')
def login():
    try:
      auth_url = outlook_calendar_service.login()
      print("Redirecting to authorization URL:", auth_url) 
      return redirect(auth_url)
    except Exception as e:
         return jsonify({'error': str(e)}), 500

# Handle the callback from Microsoft
@outlook_calendar_dp.route('/callback')
def callback():
    try:
        redirect_url = outlook_calendar_service.callback(request.url)
        return redirect(redirect_url)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create new event
@outlook_calendar_dp.route('/create_event',methods=['POST'])
def create_event():
        if 'token_cache' not in session:
            return jsonify({'error': 'Missing credentials'}), 401
        
        event_details = request.json
        
        try:
            event_id = outlook_calendar_service.create_event(event_details)
            return jsonify({'event_id': event_id}), 200
        except Exception as e:
            return jsonify({'error': 'An error occurred', 'details': str(e)}), 500


#delete event
@outlook_calendar_dp.route('/delete_event/<event_id>',methods=['DELETE'])
def delete_event(event_id):
     if 'token_cache' not in session:
            return jsonify({'error': 'Missing credentials'}), 401
     try:
        print(f"Deleting event with ID: {event_id}")
        result = outlook_calendar_service.delete_event(event_id)
        return jsonify({'message': result}), 200
     except Exception as e:
        return jsonify({'error': str(e)}), 500

#update event
@outlook_calendar_dp.route('/update_event/<event_id>',methods=['PATCH'])
def update_event(event_id):
    if 'token_cache' not in session:
        return jsonify({'error': 'Missing credentials'}), 401
    
    event_details = request.json
    
    try:
        updated_event = outlook_calendar_service.update_event(event_id, event_details)
        return jsonify(updated_event), 200
    except Exception as e:
        return jsonify({'error': 'An error occurred', 'details': str(e)}), 500
       
# clear the session credentials
@outlook_calendar_dp.route('/logout', methods=['POST'])
def logout():
    # Clear session data
    session.clear()

    return jsonify({'message': 'Logout successful'}), 200
    




    
    
    