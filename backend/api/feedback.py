""" 
 * feedback.py
 * Last Edited: 3/24/24
 *
 * Contains functions used to manipulate the feedback for appointments
 *
 * Known Bugs:
 * - 
 *
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, set_access_cookies,\
    jwt_required, get_jwt_identity, get_jwt
from .models import User, Feedback, Appointment
from datetime import datetime, timedelta, timezone
from . import db

feedback = Blueprint('feedback', __name__)


@feedback.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original response
        return response

"""""""""""""""""""""""""""""""""""""""""""""""""""""
""               Endpoint Functions                ""
"""""""""""""""""""""""""""""""""""""""""""""""""""""

# create a new feedback tuple for the Feedback Table
@feedback.route('/feedback/add', methods=['POST'])
@jwt_required()
def add_feedback():
    user_id = get_jwt_identity()
    data = request.json
    appointment_id = data['appointment_id']

    # Fetch the existing feedback for the appointment
    existing_feedback = Feedback.query.filter_by(appointment_id=appointment_id).first()

    user = User.query.get(user_id)
    if not user or user.account_type not in ['student', 'instructor']:
        return jsonify({"error": "Only students and instructors can add feedback"}), 401

    # Function to update or create feedback
    def update_or_create_feedback(feedback, is_student):
        if is_student:
            feedback.attendee_id = user_id
            feedback.attendee_rating = data.get('satisfaction')
            feedback.attendee_notes = data.get('additional_comments')
        else:
            feedback.host_id = user_id
            feedback.host_rating = data.get('satisfaction')
            feedback.host_notes = data.get('additional_comments')
        return feedback

    try:
        # If feedback already exists, update it
        if existing_feedback:
            feedback = update_or_create_feedback(existing_feedback, user.account_type == 'student')
        else:
            # Create new feedback
            feedback = update_or_create_feedback(Feedback(appointment_id=appointment_id), user.account_type == 'student')
            db.session.add(feedback)
        db.session.commit()

        return jsonify({"message": "Feedback submitted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# fetch all feedback in the Feedback Table
# expensive performance**
@feedback.route('/feedback/all', methods=['GET'])
@jwt_required()
def get_all_feedback():
    feedbacks = Feedback.query.all()
    if not feedbacks:
        return jsonify({"error": "No feedback found"}), 404

    feedback_list = []
    for feedback in feedbacks:
        student = User.query.get(feedback.attendee_id)
        host = User.query.get(feedback.host_id)
        appointment = Appointment.query.get(feedback.appointment_id)
        feedback_data = {
            "id": feedback.id,
            "appointment_type": appointment.program_id,
            "attendee_id": student.name,
            "attendee_rating": feedback.attendee_rating,
            "attendee_notes": feedback.attendee_notes,
            "host_id": host.name,
            "host_rating": feedback.host_rating,
            "host_notes": feedback.host_notes,
            "appointment_id": feedback.appointment_id,
            "appointment_data": {
                "start_time": appointment.start_time,
                "end_time": appointment.end_time,
                "appointment_date": appointment.appointment_date,
                "meeting_url": appointment.meeting_url,
                "notes": appointment.notes,                
                "attendee_id": appointment.attendee_id,
                "host_id": appointment.host_id,
                "type": appointment.type,
                "status": appointment.status
            }
        }
        feedback_list.append(feedback_data)

    return jsonify(feedback_list=feedback_list), 200

# fetch all feedback for an appointment
@feedback.route('/feedback/<int:appointment_id>', methods=['GET'])
def get_feedback(appointment_id):
    feedback = Feedback.query.filter_by(appointment_id=appointment_id).first()
    if not feedback:
        return jsonify({"message": "No feedback found for this appointment"}), 200

    
    feedback_data = {
        "id": feedback.id,
        "attendee_id": feedback.attendee_id,
        "attendee_rating": feedback.attendee_rating,
        "attendee_notes": feedback.attendee_notes,
        "host_id": feedback.host_id,
        "host_rating": feedback.host_rating,
        "host_notes": feedback.host_notes
    }

    return jsonify(feedback_data), 200