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

@feedback.route('/feedback/add', methods=['POST'])
@jwt_required()
def add_feedback():
    user_id = get_jwt_identity()
    data = request.json
    appointment_id = data['appointment_id']

    # Fetch the existing feedback for the appointment
    existing_feedback = Feedback.query.filter_by(appointment_id=appointment_id).first()

    user = User.query.get(user_id)
    if not user or user.account_type not in ['student', 'mentor']:
        return jsonify({"error": "Only students and mentors can add feedback"}), 401

    # Function to update or create feedback
    def update_or_create_feedback(feedback, is_student):
        if is_student:
            feedback.student_id = user_id
            feedback.student_rating = data.get('satisfaction')
            feedback.student_notes = data.get('additional_comments')
        else:
            feedback.mentor_id = user_id
            feedback.mentor_rating = data.get('satisfaction')
            feedback.mentor_notes = data.get('additional_comments')
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



@feedback.route('/feedback/all', methods=['GET'])
@jwt_required()
def get_all_feedback():
    feedbacks = Feedback.query.all()
    if not feedbacks:
        return jsonify({"error": "No feedback found"}), 404

    feedback_list = []
    for feedback in feedbacks:
        student = User.query.get(feedback.student_id)
        mentor = User.query.get(feedback.mentor_id)
        appointment = Appointment.query.get(feedback.appointment_id)
        feedback_data = {
            "id": feedback.id,
            "appointment_type": appointment.type,
            "student_id": student.first_name,
            "student_rating": feedback.student_rating,
            "student_notes": feedback.student_notes,
            "mentor_id": mentor.first_name,
            "mentor_rating": feedback.mentor_rating,
            "mentor_notes": feedback.mentor_notes,
            "appointment_id": feedback.appointment_id,
            "appointment_data": {
                "start_time": appointment.start_time,
                "end_time": appointment.end_time,
                "appointment_date": appointment.appointment_date,
                "meeting_url": appointment.meeting_url,
                "notes": appointment.notes,                
                "student_id": appointment.student_id,
                "mentor_id": appointment.mentor_id,
                "type": appointment.type,
                "status": appointment.status
            }
        }
        feedback_list.append(feedback_data)

    return jsonify(feedback_list=feedback_list), 200

@feedback.route('/feedback/<int:appointment_id>', methods=['GET'])
def get_feedback(appointment_id):
    feedback = Feedback.query.filter_by(appointment_id=appointment_id).first()
    if not feedback:
        return jsonify({"message": "No feedback found for this appointment"}), 404

    
    feedback_data = {
        "id": feedback.id,
        "student_id": feedback.student_id,
        "student_rating": feedback.student_rating,
        "student_notes": feedback.student_notes,
        "mentor_id": feedback.mentor_id,
        "mentor_rating": feedback.mentor_rating,
        "mentor_notes": feedback.mentor_notes
    }

    return jsonify(feedback_data), 200