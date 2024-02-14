from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, \
    set_access_cookies, get_jwt, create_access_token
from sqlalchemy import extract, or_, func
from .models import MentorMeetingSettings, User, Appointment, ProgramType, Availability, AppointmentComment, ClassInformation, ClassTimes
from . import db
from datetime import datetime, timedelta, timezone
from .mail import send_email
from ics import Calendar, Event

courses = Blueprint('courses', __name__)

@courses.after_request
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
@courses.route('/course/setTime', methods=['POST'])
@jwt_required()
def set_class_time():
    try:
        data = request.get_json()
        course_id = data[0].get('id')
        classTimesTuples = []
        for entry in data:
            classTimeInformation = {
                'class_id': entry.get('id'),
                'type': entry.get('type'),
                'day': entry.get('day'),
                'start_time': entry.get('start_time'),
                'end_time': entry.get('end_time'),
            }
            classTimesTuples.append(classTimeInformation)
        
        courses = ClassTimes.query.filter_by(class_id=course_id).all()
        
        # if course already exists in the class times table, i.e. columns are populated
        if data:
            if courses:
                for course in courses:
                    db.session.delete(course)
            
            for classTimesTuple in classTimesTuples:
                new_time = ClassTimes(
                    id = classTimesTuple.class_id,
                    type = classTimesTuple.type,
                    day = classTimesTuple.day,
                    start_time = classTimesTuple.start_time,
                    end_time = classTimesTuple.end_time,
                )
                db.session.add(new_time)
            db.session.commit()
            return jsonify({"message": "Times updated successfully"}), 200
        else:
            return jsonify({"error": "No times inputted"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Set the class information of a course
@courses.route('/course/setClassDetails', methods=['POST'])
@jwt_required()
def set_class_details():
    try:
        data = request.get_json()
        course_id = data.get('id')  
        class_comment = data.get('class_comment')
        class_time = data.get('class_time')
        class_location = data.get('class_location')
        class_link = data.get('class_link')
        class_recordings_link = data.get('class_recordings_link')
        office_hours_time = data.get('office_hours_time')
        office_hours_location = data.get('office_hours_location')
        office_hours_link = data.get('office_hours_link')
        course = ClassInformation.query(id=course_id)
        if course:
            new_details = ClassInformation(
                id=course_id,
                class_comment=class_comment,
                class_time=class_time,
                class_location=class_location,
                class_link=class_link,
                class_recordings_link=class_recordings_link,
                office_hours_time=office_hours_time,
                office_hours_location=office_hours_location,
                office_hours_link=office_hours_link,
            )
            db.session.add(new_details)
            db.session.commit()
            return jsonify({"message": "Class times updated successfully"}), 200
        else:
            return jsonify({"error": "Class doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500