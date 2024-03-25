""" 
 * mail.py
 * Last Edited: 3/24/24
 *
 * Contains functions used to send emails when appointments are booked
 *
 * Known Bugs:
 * - not sure if this system works
 *
"""

# using SendGrid's Python Library
# https://github.com/sendgrid/sendgrid-python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
from dotenv import load_dotenv
import base64

"""""""""""""""""""""""""""""""""""""""""""""""""""""
""             Backend Only Functions              ""
"""""""""""""""""""""""""""""""""""""""""""""""""""""

load_dotenv()
        
# push email object to SendGrid API
def send_email(to_email, subject, html_content, ics_data):
    # Create an email message
    message = Mail(
        from_email=os.environ.get('FROM_EMAIL'),
        to_emails=to_email,
        subject=subject,
        html_content=html_content)

    # Encode the ICS data as base64
    ics_encoded = base64.b64encode(ics_data.encode()).decode()

    # Create the attachment
    attachment = Attachment()
    attachment.file_content = FileContent(ics_encoded)
    attachment.file_type = FileType('text/calendar') 
    attachment.file_name = FileName('Appointment.ics')
    attachment.disposition = Disposition('attachment')
    message.attachment = attachment

    try:
        sendgrid_client = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        sendgrid_client.send(message)
    except Exception as e:
        print(f"fwafaw: {str(e)}")