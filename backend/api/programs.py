from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, or_
from .models import ProgramType, User, Appointment, Availability, ClassTimes, ClassInformation, CourseMembers
from . import db

programs = Blueprint('programs', __name__)


def is_admin(user_id):
    user = User.query.filter_by(id=user_id).first()
    if user.account_type != 'admin':
        return False
    return True

def is_mentor(user_id):
    user = User.query.filter_by(id=user_id).first()
    if user.account_type != 'mentor':
        return False
    return True

#could be removed if you bring over the results from /student/programs in MeetingInformation.js to ScheduleNewMeeting.js
@programs.route('/programs/<course_id>', methods=['GET'])
def get_programs(course_id):
    try: 
        course = ClassInformation.query.filter_by(id=course_id).first()

        if course:
            programs = ProgramType.query.filter(and_(or_(ProgramType.class_id==course_id, ProgramType.class_id==-2), ProgramType.instructor_id==course.teacher_id)).all()
            return jsonify([{
                "id": program.id,
                "type": program.type,
                "description": program.description,
                "duration": program.duration
            } for program in programs]), 200
        else:
            return jsonify({"error": "Course not found"}), 404
    except Exception as e:
        return jsonify({"msg": "Error fetching program description data for student", "error": str(e)}), 500
    
@programs.route('/instructor/programs', methods=['GET'])
@jwt_required()
def get_instructor_programs():
    user_id = get_jwt_identity()

    try: 
        instructor = User.query.filter_by(id=user_id).first()

        if instructor:
            programs = ProgramType.query.filter(ProgramType.instructor_id==instructor.id).all()
            return jsonify([{
                "id": program.id,
                "type": program.type,
                "description": program.description,
                "duration": program.duration
            } for program in programs]), 200
        else:
            return jsonify({"error": "Instructor not found"}), 404
    except Exception as e:
        return jsonify({"msg": "Error fetching program description data for instructor", "error": str(e)}), 500
    
    
@programs.route('/student/programs', methods=['GET'])
@jwt_required()
def get_student_programs():
    try:
        user_id = get_jwt_identity()
        student = User.query.get(user_id)
        
        if student:
            all_student_courses = ClassInformation.query.join(CourseMembers, ClassInformation.id == CourseMembers.class_id).filter_by(user_id=user_id).all()

            if all_student_courses:

                all_programs = []

                for course in all_student_courses:
                    class_id = course.id

                    all_programs_in_course = ProgramType.query.filter_by(class_id=class_id).all()

                    global_programs = get_global_programs(course.teacher_id)

                    for program in all_programs_in_course:
                        program_info = {
                            'id': program.id,
                            'type': program.type,
                            'description': program.description,
                            'duration': program.duration,
                        }
                        all_programs.append(program_info)
                        
                    if global_programs is not None:
                        for global_program in global_programs:
                            if not any(existing_program['id'] == global_program['id'] for existing_program in all_programs):
                                all_programs.append(global_program)
                
                return jsonify(all_programs), 200
            else: 
                return jsonify({"error": "no courses found for student"}), 404
        else:
            return jsonify({"error": "student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def get_global_programs(instructor_id):
    try:
        mentor = User.query.get(instructor_id)
        
        if mentor:
            all_global_programs = ProgramType.query.filter(
                and_(ProgramType.class_id == -2, ProgramType.instructor_id == instructor_id)
            ).all()

            if all_global_programs:
                all_formatted_programs = []

                for program in all_global_programs:
                    program_info = {
                        'id': program.id,
                        'type': program.type,
                        'description': program.description,
                        'duration': program.duration,
                    }
                    all_formatted_programs.append(program_info)

                return all_formatted_programs
            else: 
                return None
        else:
            return None
    except Exception as e:
        return None

    

@programs.route('/program', methods=['POST'])
@jwt_required()
def create_program():
    user_id = get_jwt_identity()

    if not is_admin(user_id):
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.get_json()
    
    # Check if program with the same name already exists
    existing_program = ProgramType.query.filter_by(type=data.get('type')).first()
    if existing_program is not None:
        return jsonify({"msg": "Program with this name already exists"}), 409

    try:
        new_program = ProgramType(
            type=data.get('type'),
            description=data.get('description'),
            duration=data.get('duration')
        )
        db.session.add(new_program)
        db.session.commit()
        return jsonify({"msg": "Program created", "program": new_program.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error creating program", "error": str(e)}), 500


@programs.route('/program/<int:program_id>', methods=['GET'])
@jwt_required()
def get_program(program_id):
    program = ProgramType.query.get_or_404(program_id)
    return jsonify({
        "type": program.type,
        "description": program.description,
        "duration": program.duration
    }), 200


@programs.route('/program/<int:program_id>', methods=['POST'])
@jwt_required()
def update_program(program_id):
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({"msg": "Admin access required"}), 401

    program = ProgramType.query.get_or_404(program_id)
    data = request.get_json()
    program.type = data.get('type', program.type)
    program.description = data.get('description', program.description)
    program.duration = data.get('duration', program.duration)
    db.session.commit()
    return jsonify({"msg": "Program updated"}), 200


@programs.route('/program/<int:program_id>', methods=['DELETE'])
@jwt_required()
def delete_program(program_id):
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({"msg": "Admin access required"}), 401

    program = ProgramType.query.get_or_404(program_id)
    db.session.delete(program)
    db.session.commit()
    return jsonify({"msg": "Program deleted"}), 200


# Set the class information of a course
@programs.route('/program/setDetails', methods=['POST'])
@jwt_required()
def set_program_details():
    try:
        obj = request.get_json()
        data = obj.get('data')
        program_id = data.get('id')  
        class_id = obj.get('course_id')
        type = data.get('type')
        description = data.get('description')
        duration = data.get('duration')
        physical_location = data.get('physical_location')
        virtual_link = data.get('virtual_link')
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

        program = ProgramType.query.filter_by(id=program_id).first()

        if program:
            program.class_id = class_id
            program.type = type
            program.description = description
            program.duration = duration
            program.physical_location = physical_location
            program.virtual_link = virtual_link
            program.auto_approve_appointments = auto_approve_appointments
            program.max_daily_meetings = max_daily_meetings
            program.max_weekly_meetings = max_weekly_meetings
            program.max_monthly_meetings = max_monthly_meetings
            program.isDropins = isDropins

            db.session.commit()
            
            return jsonify({"message": "Program type updated successfully"}), 200
        else:
            return jsonify({"error": "Program type doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@programs.route('/program/delete/<int:program_id>', methods=['DELETE'])
@jwt_required()
def delete_program_type(program_id):
    try: 
        user_id = get_jwt_identity()
        if not is_mentor(user_id):
            return jsonify({"msg": "Mentor access required"}), 401

        # delete program
        program = ProgramType.query.get_or_404(program_id)
        db.session.delete(program)

        # delete appointments
        appointments = Appointment.query.filter_by(type=program_id).all()
        for appointment in appointments:
            db.session.delete(appointment)

        # delete availability
        availabilities = Availability.query.filter_by(type=program_id).all()
        for availability in availabilities:
            db.session.delete(availability)

        # delete class_times
        times = ClassTimes.query.filter_by(program_id=program_id).all()
        for time in times:
            db.session.delete(time)

        db.session.commit()
        return jsonify({"msg": "Program deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 404