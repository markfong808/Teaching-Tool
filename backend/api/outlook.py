import os
import webbrowser
import json
import requests
from msal import ConfidentialClientApplication
from flask import Flask, Blueprint, jsonify, request, redirect, session ,url_for,render_template
from flask_cors import CORS
from requests_oauthlib import OAuth2Session
from oauthlib.oauth2 import BackendApplicationClient
import logging


# Create a Blueprint for the Outlook Calendar API
outlook_calendar_dp = Blueprint('outlook_calendar_dp', __name__)
CORS(outlook_calendar_dp, supports_credentials=True)


client_id = '47eccb95-1b86-438f-96e0-f3735b6a29b0'
client_secret = '~L18Q~NnPg3g4oy~HQEPw8aHBzKHLNqeJmyXccX6'
tenant_id = 'f6b6dd5b-f02f-441a-99a0-162ac5060bd2'
redirect_uri = 'http://localhost:5000/api/callback'
authority = f'https://login.microsoftonline.com/{tenant_id}'
# authority = 'https://login.microsoftonline.com/common'

# class OutlookCalendarService:
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
    
app = ConfidentialClientApplication(client_id,client_credential=client_secret,authority=authority)


# initiate the authentication flow 
@outlook_calendar_dp.route('/login')
def login():
    auth_url = app.get_authorization_request_url(scopes=SCOPES, redirect_uri=redirect_uri)
    return redirect(auth_url)

# Handle the callback from Microsoft
@outlook_calendar_dp.route('/callback')
def callback():
    code = request.args.get('code')
    print(f'Authorization code received: {code}')

    if not code:
        return 'Authorization code not found', 400
    
    try:
        result = app.acquire_token_by_authorization_code(code, scopes=SCOPES, redirect_uri=redirect_uri)
        access_token = result.get('access_token')
        print(f'Access token obtained: {access_token}')

        if not access_token:
            return 'Access token not obtained', 400
        
        # session storage
        session['access_token'] = access_token
        response = jsonify({"msg": "login successful!"})
        return response 
    
    except Exception as e:
        error_message = f'Error occurred: {str(e)}'
        print(error_message)
        app.logger.error(error_message)  # Log the error
        return error_message, 500

"""""""""""""""""""""""""""""""""""""""""""""""""""""
""               Endpoint Functions                ""
"""""""""""""""""""""""""""""""""""""""""""""""""""""

# retrieve calendar events
@outlook_calendar_dp.route('/get_calendar_events', methods=['GET'])
def get_calendar_events():
    # Check if access token is present in session
    if 'access_token' not in session:
        return jsonify({'error': 'Access token not found in session'}), 401

    # Retrieve access token from session
    access_token = session['access_token']

    # Microsoft Graph API endpoint to get calendar events
    graph_api_endpoint = 'https://graph.microsoft.com/v1.0/me/calendar/events'

    # Set headers for the request, including the Authorization header with the access token
    headers = {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
    }

    try:
        # Make a GET request to Microsoft Graph API
        response = requests.get(graph_api_endpoint, headers=headers)
        events = response.json().get('value', [])
        return jsonify(events)
    
    except requests.exceptions.HTTPError as http_err:
        return jsonify({'error': f'HTTP error occurred: {http_err}'})

        

