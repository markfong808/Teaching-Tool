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
    

# WORKING ON RN
# Set the classtime of a course
@course.route('/course/setTime', methods=['POST'])
@jwt_required()
def set_class_time():
    try:
        data = request.get_json()
        course_id = data.get('course_id')
        weekdays = data.get('weekdays')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        course = ClassInformation.query(id=course_id)
        #appointment = Appointment.query.filter_by(id=appointment_id).first()
        if course:
            course.class_days = weekdays
            course.class_start_time = start_time
            course.class_end_time = end_time
            db.session.commit()
            return jsonify({"message": "Class times updated successfully"}), 200
        else:
            return jsonify({"error": "Class doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500