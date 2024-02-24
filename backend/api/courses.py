from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, \
    set_access_cookies, get_jwt, create_access_token
from sqlalchemy import extract, or_, func
from .models import MentorMeetingSettings, User, Appointment, ProgramType, Availability, AppointmentComment, ClassInformation, ClassTimes, CourseMembers
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
    

# Get all courses a user is registered in
@courses.route('/course/times/<course_id>', methods=['GET'])
@jwt_required()
def get_times(course_id):
    try:
        courseTimes = ClassTimes.query.filter_by(class_id=course_id).all()
        
        if courseTimes:
            course_times_list = []
            for courseTime in courseTimes:
                course_time_info = {
                    'type': courseTime.type,
                    'day': courseTime.day,
                    'start_time': courseTime.start_time,
                    'end_time': courseTime.end_time,
                    'program_id': courseTime.program_id,
                }
                course_times_list.append(course_time_info)
            return jsonify(course_times_list), 200
        else:
            return jsonify(None), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get all program times for a program
@courses.route('/program/times/<program_id>', methods=['GET'])
@jwt_required()
def get_program_times(program_id):
    try:
        programTimes = ClassTimes.query.filter_by(program_id=program_id).all()
        
        if programTimes:
            program_times_list = []
            for programTime in programTimes:
                program_time_info = {
                    'type': programTime.type,
                    'day': programTime.day,
                    'start_time': programTime.start_time,
                    'end_time': programTime.end_time,
                }
                program_times_list.append(program_time_info)
            return jsonify(program_times_list), 200
        else:
            return jsonify(None), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Set the classtime of a course
@courses.route('/course/setTime/<class_id>', methods=['POST'])
@jwt_required()
def set_class_time(class_id):
    try:
        data = request.get_json()
        course_id = class_id
        classTimesTuples = []

        if data is not None:
            # set times for course
            courses = ClassTimes.query.filter_by(class_id=course_id).all()
        
            # if course already exists in the class times table, i.e. columns are populated
            if courses:
                for course in courses:
                    db.session.delete(course)
                db.session.commit()

            if len(data) > 0:
                converted_list = []

                for program_id, schedule in data.items():
                    for day, timings in schedule.items():
                        start_time = timings['start_time']
                        end_time = timings['end_time']
                        converted_list.append((day, start_time, end_time, program_id))

                for entry in converted_list:
                    new_time = ClassTimes(
                        class_id=course_id,
                        type="TEMP",                                                     #remove types from classTimes
                        day=entry[0],
                        start_time=entry[1],
                        end_time=entry[2],
                        program_id=entry[3],
                    )
                    classTimesTuples.append(new_time)
                
                for classTimesTuple in classTimesTuples:
                    db.session.add(classTimesTuple)
                db.session.commit()
                return jsonify({"message": "Times updated successfully"}), 200
            # set no times for course
            else:
                return jsonify({"message": "Times updated successfully: No times for class"}), 200
        else:
            return jsonify({"error": "Times update failed"}), 404
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
        class_location = data.get('class_location')
        class_link = data.get('class_link')
        class_recordings_link = data.get('class_recordings_link')
        office_hours_location = data.get('office_hours_location')
        office_hours_link = data.get('office_hours_link')
        discord_link = data.get('discord_link')

        course = ClassInformation.query.filter_by(id=course_id).first()

        if course:
            db.session.delete(course)
            new_details = ClassInformation(
                id=course_id,
                class_comment=class_comment,
                class_location=class_location,
                class_link=class_link,
                class_recordings_link=class_recordings_link,
                office_hours_location=office_hours_location,
                office_hours_link=office_hours_link,
                discord_link=discord_link
            )
            db.session.add(new_details)
            db.session.commit()
            
            return jsonify({"message": "Class times updated successfully"}), 200
        else:
            return jsonify({"error": "Class doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Create a new course and adds the user who created it to CourseMembers
@courses.route('/course/add-course', methods=['POST'])
@jwt_required()
def add_new_course():
    try:
        data = request.get_json()
        class_name = data.get('class_name')
        user_id = data.get('user_id')
        role = data.get('role')

        if data:
            new_details = ClassInformation(
                teacher_id=user_id,
                class_name=class_name,
            )
            db.session.add(new_details)
            db.session.commit()
            
            new_course_id = new_details.id

            if new_course_id & user_id:
                new_details = CourseMembers(
                    class_id=new_course_id,
                    user_id=user_id,
                    role=role,
                )
                db.session.add(new_details)
                db.session.commit()
            
                return jsonify({"message": "Added to course successfully"}), 200
            else:
                return jsonify({"error": "Insufficient details to add user to course"}), 404
        else:
            return jsonify({"error": "Teacher ID doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Add user to course
@courses.route('/course/add-user', methods=['POST'])
@jwt_required()
def add_user_to_course():
    try:
        data = request.get_json()
        course_id = data.get('class_id')  
        user_id = data.get('user_id')
        role = data.get('role')

        if course_id & user_id:
            new_details = CourseMembers(
                class_id=course_id,
                user_id=user_id,
                role=role,
            )
            db.session.add(new_details)
            db.session.commit()
            
            return jsonify({"message": "Added to course successfully"}), 200
        else:
            return jsonify({"error": "Insufficient details to add user to course"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Create a new course and adds the user who created it to CourseMembers
@courses.route('/course/add-program', methods=['POST'])
@jwt_required()
def add_new_program():
    try:
        data = request.get_json()
        name = data.get('name')
        course_id = data.get('course_id')

        if data:
            new_details = ProgramType(
                type=name,
                class_id=course_id,
            )
            db.session.add(new_details)
            db.session.commit()
            
            return jsonify({"message": "Added to program successfully"}), 200
        else:
            return jsonify({"error": "Insufficient details to add program to course"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500