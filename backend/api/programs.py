""" 
 * programs.py
 * Last Edited: 3/24/24
 *
 * Contains functions used to CRUD programs for students and instructors
 *
 * Known Bugs:
 * - 
 *
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, or_
from .models import ProgramDetails, User, Appointment, Availability, ProgramTimes, CourseDetails, CourseMembers, AppointmentComment, Feedback, CourseTimes
from . import db

programs = Blueprint('programs', __name__)

"""""""""""""""""""""""""""""""""""""""""""""""""""""
""             Backend Only Functions              ""
"""""""""""""""""""""""""""""""""""""""""""""""""""""

# check if user_id is an instructor
def is_instructor(user_id):
    user = User.query.filter_by(id=user_id).first()
    if user.account_type != 'instructor':
        return False
    return True

# return the program name for a given program ID
def get_program_type(program_id): 
    try: 
        program = ProgramDetails.query.filter_by(id=program_id).first()

        if program:
            return program.name
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# return the course name for a course_id
def get_course_name(course_id): 
    try: 
        course = CourseDetails.query.filter_by(id=course_id).first()

        if course:
            return course.course_name
    except Exception as e:
        return jsonify({"error": str(e)}), 500

"""""""""""""""""""""""""""""""""""""""""""""""""""""
""               Endpoint Functions                ""
"""""""""""""""""""""""""""""""""""""""""""""""""""""

@programs.route('/course/details/<course_id>', methods=['GET'])
@jwt_required()
def get_courses(course_id):
    try:
        user_id = get_jwt_identity()
        instructor = User.query.get(user_id)
        
        if instructor and course_id is not None:
            course = CourseDetails.query.filter_by(id=course_id).first()

            course_info = {
                'id': course.id,
                'instructor_id': course.instructor_id,
                'quarter': course.quarter,
                'name': course.name,
                'physical_location': course.physical_location,
                'meeting_url': course.meeting_url,
                'recordings_link': course.recordings_link,
                'discord_link': course.discord_link,
                'comments': course.comments,
            }

            return jsonify(course_info), 200
        else:
            return jsonify({"error": "instructor not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# set the course attributees of a already existing course
@programs.route('/course/details', methods=['POST'])
@jwt_required()
def set_course_details():
    try:
        data = request.get_json()
        course_id = data.get('id')
        quarter = data.get('quarter')  
        name = data.get('name')
        physical_location = data.get('physical_location')
        meeting_url = data.get('meeting_url')
        recordings_link = data.get('recordings_link')
        discord_link = data.get('discord_link')
        comments = data.get('comments')

        course = CourseDetails.query.get(course_id)

        if course:
            course.quarter = quarter
            course.name = name
            course.physical_location = physical_location
            course.meeting_url = meeting_url
            course.recordings_link = recordings_link
            course.discord_link = discord_link
            course.comments = comments

            db.session.commit()
            
            return jsonify({"message": "Course details updated successfully"}), 200
        else:
            return jsonify({"error": "Course doesn't exist"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    
# get all of the times for a course
@programs.route('/course/times/<course_id>', methods=['GET'])
@jwt_required()
def get_course_times(course_id):
    try:
        course = CourseDetails.query.get(course_id)

        if course:
            course_times = CourseTimes.query.filter_by(course_id=course_id).all()
            
            if course_times:
                course_times_list = []

                for tuple in course_times:
                    course_time_info = {
                        'course_id': tuple.course_id,
                        'day': tuple.day,
                        'start_time': tuple.start_time,
                        'end_time': tuple.end_time,
                    }

                    course_times_list.append(course_time_info)
                return jsonify(course_times_list), 200
            else:
                return jsonify(None), 200
        else:
            return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    
# set the times in a course
@programs.route('/course/times/<course_id>', methods=['POST'])
@jwt_required()
def set_course_times(course_id):
    try:
        data = request.get_json()
        courseTimesTuples = []

        if data is not None:
            # set times for course
            courses = CourseTimes.query.filter_by(course_id=course_id).all()
        
            # if course already exists in the course times table, i.e. columns are populated
            if courses:
                for course in courses:
                    db.session.delete(course)
                db.session.commit()

            if len(data) > 0:
                converted_list = []
                for course_id, schedule in data.items():
                    for day, timings in schedule.items():
                        start_time = timings['start_time']
                        end_time = timings['end_time']
                        converted_list.append((day, start_time, end_time, course_id))

                for entry in converted_list:
                    new_time = CourseTimes(
                        day=entry[0],
                        start_time=entry[1],
                        end_time=entry[2],
                        course_id=entry[3],
                    )
                    courseTimesTuples.append(new_time)
                
                for courseTimesTuple in courseTimesTuples:
                    db.session.add(courseTimesTuple)
                db.session.commit()
                return jsonify({"message": "Times updated successfully"}), 200
            
            # set no times for course
            else:
                return jsonify({"message": "Times updated successfully: No times for course"}), 200
        else:
            return jsonify({"error": "Times update failed"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

# fetch all of the programs in a course, including global programs for the instructor of the course
@programs.route('/course/programs/<course_id>', methods=['GET'])
def get_programs(course_id):
    try: 
        course = CourseDetails.query.filter_by(id=course_id).first()

        if course:
            programs = ProgramDetails.query.filter(and_(or_(ProgramDetails.course_id==course_id, ProgramDetails.course_id==None), ProgramDetails.instructor_id==course.instructor_id)).all()
            return jsonify([{
                "id": program.id,
                "name": program.name,
                "description": program.description,
                "duration": program.duration
            } for program in programs]), 200
        else:
            return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        return jsonify({"msg": "Error fetching program description data for student", "error": str(e)}), 500
    
# get all of the program times for a course
@programs.route('/course/programs/times/<course_id>', methods=['GET'])
@jwt_required()
def get_times(course_id):
    try:
        if course_id == "null":
            programs = ProgramDetails.query.filter(ProgramDetails.course_id.is_(None)).all()
        else:
            programs = ProgramDetails.query.filter_by(course_id=course_id).all()
        
        if programs:
            course_times_list = []

            for program in programs:

                program_times = ProgramTimes.query.filter_by(program_id=program.id).all()

                program_name = get_program_type(program.id)

                for tuple in program_times:
                    program_time_info = {
                        'program_id': tuple.program_id,
                        'name': program_name,
                        'day': tuple.day,
                        'start_time': tuple.start_time,
                        'end_time': tuple.end_time,
                    }

                    course_times_list.append(program_time_info)
            return jsonify(course_times_list), 200
        else:
            return jsonify(None), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# set the times for all programs in a course
@programs.route('/course/programs/times/<program_id>', methods=['POST'])
@jwt_required()
def set_program_times(program_id):
    try:
        data = request.get_json()
        program_id = program_id
        courseTimesTuples = []

        if data is not None:
            # set times for course
            courses = ProgramTimes.query.filter_by(program_id=program_id).all()
        
            # if course already exists in the course times table, i.e. columns are populated
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
                    new_time = ProgramTimes(
                        day=entry[0],
                        start_time=entry[1],
                        end_time=entry[2],
                        program_id=entry[3],
                    )
                    courseTimesTuples.append(new_time)
                
                for courseTimesTuple in courseTimesTuples:
                    db.session.add(courseTimesTuple)
                db.session.commit()
                return jsonify({"message": "Times updated successfully"}), 200
            
            # set no times for course
            else:
                return jsonify({"message": "Times updated successfully: No times for course"}), 200
        else:
            return jsonify({"error": "Times update failed"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# create a new program
@programs.route('/program/create', methods=['POST'])
@jwt_required()
def add_new_program():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        instructor = User.query.get(user_id)

        if instructor:
            if data:
                name = data.get('name')
                course_id = data.get('course_id')
                isDropins = data.get('isDropins')
                isRangeBased = data.get('isRangeBased')

                program = ProgramDetails.query.filter(and_(ProgramDetails.name == name, ProgramDetails.course_id == course_id)).first()

                if program:
                    return jsonify({"error": "Program name already exists"}), 400
                else:
                    new_details = ProgramDetails(
                        name=name,
                        course_id=course_id,
                        instructor_id=user_id,
                        isDropins=isDropins,
                        isRangeBased=isRangeBased
                    )
                    db.session.add(new_details)
                    db.session.commit()

                    # Return the new program ID
                    new_program_id = new_details.id
                    return jsonify({"message": "Added to program successfully", "program_id": new_program_id}), 200
            else:
                return jsonify({"error": "Insufficient details to add program to course"}), 404
        else:
            return jsonify({"error": "Instructor not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# delete a program based on its ID and delete all connected data
@programs.route('/program/delete/<int:program_id>', methods=['DELETE'])
@jwt_required()
def delete_program_type(program_id):
    try: 
        user_id = get_jwt_identity()
        if not is_instructor(user_id):
            return jsonify({"msg": "instructor access required"}), 401

        # delete appointments
        appointments = Appointment.query.join(Availability).filter_by(program_id=program_id).all()
        for appointment in appointments:
            comments = AppointmentComment.query.filter_by(appointment_id=appointment.id).all()
            feedbacks = Feedback.query.filter_by(appointment_id=appointment.id).all()

            # delete comments
            for comment in comments:
                db.session.delete(comment)

            # delete feedback
            for feedback in feedbacks:
                db.session.delete(feedback)

            db.session.delete(appointment)

        # delete availability
        availabilities = Availability.query.filter_by(program_id=program_id).all()
        for availability in availabilities:
            db.session.delete(availability)

        # delete program_times
        times = ProgramTimes.query.filter_by(program_id=program_id).all()
        for time in times:
            db.session.delete(time)

        # delete program
        program = ProgramDetails.query.get_or_404(program_id)
        db.session.delete(program)

        db.session.commit()
        return jsonify({"msg": "Program deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# set the program attributees of a already existing program
@programs.route('/program/details', methods=['POST'])
@jwt_required()
def set_program_details():
    try:
        obj = request.get_json()
        data = obj.get('data')
        program_id = data.get('id')  
        course_id = obj.get('course_id')
        name = data.get('name')
        description = data.get('description')
        duration = data.get('duration')
        physical_location = data.get('physical_location')
        meeting_url = data.get('meeting_url')
        isDropins = data.get('isDropins')

        if isDropins:
            auto_approve_appointments = None
            max_daily_meetings = None
            max_weekly_meetings = None
            max_monthly_meetings = None
        else:
            auto_approve_appointments = data.get('auto_approve_appointments')
            max_daily_meetings = data.get('max_daily_meetings')
            max_weekly_meetings = data.get('max_weekly_meetings')
            max_monthly_meetings = data.get('max_monthly_meetings')

        if duration == '':
            duration = None

        program = ProgramDetails.query.filter_by(id=program_id).first()

        if program:
            program.course_id = course_id
            program.name = name
            program.description = description
            program.duration = duration
            program.physical_location = physical_location
            program.meeting_url = meeting_url
            program.auto_approve_appointments = auto_approve_appointments
            program.max_daily_meetings = max_daily_meetings
            program.max_weekly_meetings = max_weekly_meetings
            program.max_monthly_meetings = max_monthly_meetings
            program.isDropins = isDropins

            db.session.commit()
            
            return jsonify({"message": "Program name updated successfully"}), 200
        else:
            return jsonify({"error": "Program name doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# create a new course and adds the user who created it to CourseMembers
@programs.route('/course/create', methods=['POST'])
def create_course():
    try:
        data = request.get_json()
        name = data.get('name')
        user_id = data.get('user_id')

        if not (user_id and name):
            return jsonify({"error": "Instructor ID or Course Name is missing."}), 400

        default_program_name = "Course Details"

        new_course = CourseDetails(
            instructor_id=user_id,
            name=name,
        )
        db.session.add(new_course)
        db.session.commit()

        new_course_id = new_course.id

        new_member = CourseMembers(
            course_id=new_course_id,
            user_id=user_id,
        )
        db.session.add(new_member)

        db.session.commit()

        return jsonify({"message": "Course created successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# add user to course
@programs.route('/course/add/user', methods=['POST'])
def add_user_to_course():
    try:
        data = request.get_json()
        course_id = data.get('course_id')  
        user_id = data.get('user_id')

        if course_id & user_id:
            new_details = CourseMembers(
                course_id=course_id,
                user_id=user_id,
            )
            db.session.add(new_details)
            db.session.commit()
            
            return jsonify({"message": "Added to course successfully"}), 200
        else:
            return jsonify({"error": "Insufficient details to add user to course"}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500