# Backend API for Canvas Meeting Scheduler

This is the backend API for the Canvas Meeting Scheduler platform, which includes various blueprints for handling different aspects of the application, such as user management, appointment scheduling, and more.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have a basic understanding of Python and Flask.
- You have Python 3.12.1 (latest version) installed on your machine.
- Create a new sendgrid API Key

## Configuring SendGrid for Email Functionality

Canvas Meetings Scheduler requires SendGrid for handling email functionalities. Follow these steps to configure SendGrid:

1. **Create a SendGrid Account**:

   - If you don't already have a SendGrid account, sign up at [SendGrid](https://sendgrid.com/).
   - If SendGrid denies access for account creation, consult with Professor Kochanski for next steps.
   - Verify your account if required.

2. **Generate a SendGrid API Key**:

   - Once logged in, go to the [API Keys section](https://app.sendgrid.com/settings/api_keys) in your SendGrid dashboard.
   - Click on 'Create API Key'. Give it a name and select 'Full Access'.
   - Copy the public API key generated. Keep it secure as you won't be able to see it again.

3. **Configure Your `.env` File**:

   - In your `.env` file within the Canvas Meeting Scheduler backend project, set the `SENDGRID_API_KEY` variable to your newly created public SendGrid API key.
   - For the `FROM_EMAIL` variable in `.env`, use the email address associated with your SendGrid account.

   Example `.env` entries:

## API Setup

To set up the Canvas Meeting Scheduler backend API, follow these steps:

1. **Change Directory to the backend dir** (if you haven't already):
   ```bash
   cd scheduling-tools/backend
   ```
2. **Create a virtual environment in the backend directory:**
   ```bash
   python -m venv venv
   ```
3. **Activate the virtual environment**:
   - On Windows:
   ```bash
   venv\Scripts\activate
   ```
   - On macOS or Linux:
   ```bash
   source venv/bin/activate
   ```
4. **Install the required dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

5. **Create a .env file based on the sample.env file and update the required environment variables**:
   ```bash
   cp sample.env .env
   ```
   Edit the `.env` file and set your environment variables.

## Running the API

To run the API, use the following command from the `backend` directory:

```bash
python main.py
```
This will start the Flask server, and the API will be accessible at `http://localhost:5000`.

## Issues With Python Libraries
In case you run into troubles with when trying to run python main.py in the virtual enviornment (venv), you'll need to install libraries needed.
Below is a list of the libraries needed. For further help consult Professor Kochanski.
- pip install cryptography
- pip install flask_cors
- pip install python-dotenv
- pip install flask-swagger-ui
- pip install wget
- pip install pypandoc
- pip install requests
- pip install pdfkit
- pip install mysql-connector-python
- pip install google-auth
- pip install google-api-python-client
- pip install google-auth-oauthlib
- pip install pytz
- pip install Flask-Session

## Running the Tests

- Important: Prior to executing the test file, please navigate to the file containing the endpoints and temporarily comment out the @jwt_required() decorator.

### To run the tests, navigate to the `test` folder and execute:

```bash
python <fileName_test.py>
```
