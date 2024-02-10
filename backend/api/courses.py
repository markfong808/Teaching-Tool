from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, \
    set_access_cookies, get_jwt, create_access_token
from sqlalchemy import extract, or_, func
from .models import MentorMeetingSettings, User, Appointment, ProgramType, Availability, AppointmentComment, ClassInformation
from . import db
from datetime import datetime, timedelta, timezone
from .mail import send_email
from ics import Calendar, Event

course = Blueprint('course', __name__)

@course.after_request
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


    

# Get all information for a course
@course.route('/courses/course-info', methods=['GET'])
@jwt_required()
def get_course_info(course_id):
    try:
        user_id = get_jwt_identity()
        course = ClassInformation.query.get(course_id)
        
        if course:
            courses = ClassInformation.query.filter_by(course_id=course_id).all()
            course_info = {
                'id': course.id,
                'name': course.class_name,
            }
            return jsonify({"courses": course_info}), 200
        else:
            return jsonify({"error": "course not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# WORKING ON RN
# Update a meeting's notes, meeting_url
@course.route('/meetings/update', methods=['POST'])
@jwt_required()
def update_meeting():
    try:
        data = request.get_json()
        appointment_id = data.get('appointment_id')
        notes = data.get('notes', None)  # Default to None if not provided
        meeting_url = data.get('meeting_url', None)  # Default to None if not provided
        appointment = Appointment.query.filter_by(id=appointment_id).first()
        if appointment:
            if notes is not None:
                appointment.notes = notes
            if meeting_url is not None:
                appointment.meeting_url = meeting_url
            db.session.commit()
            return jsonify({"message": "Meeting updated successfully"}), 200
        else:
            return jsonify({"error": "Appointment doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500