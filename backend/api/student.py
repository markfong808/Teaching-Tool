from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, \
    set_access_cookies, get_jwt, create_access_token
from sqlalchemy import extract, or_, and_, func
from .models import MentorMeetingSettings, User, Appointment, ProgramType, Availability, AppointmentComment, ClassInformation, CourseMembers, ClassTimes
from . import db
from datetime import datetime, timedelta, timezone
from .mail import send_email
from ics import Calendar, Event

student = Blueprint('student', __name__)
program_types = [
    "Mentoring Session", 
    "Mock Technical Interview",
    "Mock Behavorial Interview", 
    "Code Review", 
    "Personal Growth", 
    "Skill Development",
    "office_hours"
]

@student.after_request
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
@student.route('/student/courses', methods=['GET'])
@jwt_required()
def get_courses():
    try:
        user_id = get_jwt_identity()
        student = User.query.get(user_id)
        
        if student:
            student_courses_info = ClassInformation.query.join(CourseMembers, ClassInformation.id == CourseMembers.class_id).filter_by(user_id=user_id).all()

            courses_list = []
            for course in student_courses_info:
                courseTimes = findStandardTimes(course.id, "Class Times")
                
                courseTuple = ClassInformation.query.filter(ClassInformation.id == course.id).first()

                globalOfficeHours = findInstructorOfficeHours(-2, "Office Hours", courseTuple.teacher_id)

                courseOfficeHours = findStandardTimes(course.id, "Office Hours")

                if courseOfficeHours != "No Known Office Hours":
                    officeHours = courseOfficeHours
                else:
                    officeHours = globalOfficeHours

                course_info = {
                    'id': course.id,
                    'class_name': course.class_name,
                    'class_comment': course.class_comment,
                    'class_location': course.class_location,
                    'class_link': course.class_link,
                    'class_recordings_link': course.class_recordings_link,
                    'office_hours_location': course.office_hours_location,
                    'office_hours_link': course.office_hours_link,
                    'discord_link': course.discord_link,
                    'teacher_id': course.teacher_id,
                    'class_times': courseTimes,
                    'office_hours': officeHours
                }
                courses_list.append(course_info)
            return jsonify(courses_list), 200
        else:
            return jsonify({"error": "student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def convert_to_standard_time(military_time):
    military_time_obj = datetime.strptime(military_time, "%H:%M")
    formatted_hours = military_time_obj.strftime("%I").lstrip("0")
    standard_time = military_time_obj.strftime(f"{formatted_hours}:%M %p")

    return standard_time

def findStandardTimes(id, type):
    try:
        times = (
            ClassTimes.query
            .join(ProgramType, ClassTimes.program_id == ProgramType.id)
            .filter(ClassTimes.class_id == id, ProgramType.type == type)
            .all()
        )

        if len(times) > 0:
            tempString =""
            for obj in times:
                if tempString != "":
                    tempString += "/"
                tempString += (obj.day + " " + convert_to_standard_time(obj.start_time) + "-" + convert_to_standard_time(obj.end_time))
            times = tempString
        else:
            times = "No Known " + type

        return times
    except Exception as e:
        return jsonify({"error": str(e)}), 500   
    
def findInstructorOfficeHours(id, type, instructor_id):
    try:
        times = (
            ClassTimes.query
            .join(ProgramType, ClassTimes.program_id == ProgramType.id)
            .filter(ClassTimes.class_id == id, ProgramType.type == type, ProgramType.instructor_id == instructor_id)
            .all()
        )

        if len(times) > 0:
            tempString =""
            for obj in times:
                if tempString != "":
                    tempString += "/"
                tempString += (obj.day + " " + convert_to_standard_time(obj.start_time) + "-" + convert_to_standard_time(obj.end_time))
            times = tempString
        else:
            times = "No Known " + type

        return times
    except Exception as e:
        return jsonify({"error": str(e)}), 500  


@student.route('/program/description', methods=['GET'])
def get_program_description():
    program_type = request.args.get('program_type')
    if not program_type:
        return jsonify(error='Program type is required'), 400

    program = ProgramType.query.filter_by(name=program_type).first()
    if program:
        return jsonify(description=program.description), 200
    else:
        return jsonify(error='Program type does not exist'), 404


# Returns a list of appointments that have been reserved by the students with a specific mentor
@student.route('/student/appointments/<class_id>', methods=['GET'])
@jwt_required()
def get_student_appointments_for_class(class_id):
    student_id = get_jwt_identity()
    meeting_type = request.args.get('type', 'all')
    current_time_pst = datetime.utcnow() - timedelta(hours=8)
    current_date_str = current_time_pst.strftime('%Y-%m-%d')
    current_time_str = current_time_pst.strftime('%H:%M')

    #if not class_id:
        #return jsonify({"error": "class_id undefined for appointments"}), 404

    appointments_query = Appointment.query.filter(Appointment.student_id == student_id)

    # single course
    #if class_id != '-1':
        #appointments_query = appointments_query.filter(Appointment.class_id == class_id)

    if meeting_type in ['upcoming', 'past', 'pending']:
        if meeting_type == 'upcoming':
            appointments_query = appointments_query.filter(
                or_(
                    Appointment.appointment_date > current_date_str,
                    and_(
                        Appointment.appointment_date == current_date_str,
                        Appointment.start_time >= current_time_str
                    )
                ),
                Appointment.status == 'reserved'
            )
        elif meeting_type == 'past':
            appointments_query = appointments_query.filter(
                or_(
                    Appointment.appointment_date < current_date_str,
                    and_(
                        Appointment.appointment_date == current_date_str,
                        Appointment.start_time < current_time_str
                    )
                ),
                Appointment.status.in_(['reserved', 'completed', 'rejected', 'missed', 'canceled'])
            )
        elif meeting_type == 'pending':
            appointments_query = appointments_query.filter(
                or_(
                    Appointment.appointment_date > current_date_str,
                    and_(
                        Appointment.appointment_date == current_date_str,
                        Appointment.start_time >= current_time_str
                    )
                ),
                Appointment.status == 'pending'
            )

    student_appointments = []
    appointments = appointments_query.all()

    for appt in appointments:
        mentor = User.query.get(appt.mentor_id) if appt.mentor_id else None
        mentor_info = {
            "first_name": mentor.first_name,
            "email": mentor.email,
            "about": mentor.about,
            "social_url": mentor.linkedin_url
        } if mentor else {}

        program_type = get_program_type(appt.type)
        course_name = get_course_name(appt.class_id)

        student_appointments.append({
            "appointment_id": appt.id,
            "program_id": appt.type,
            "type": program_type,
            "class_name": course_name,
            "date": appt.appointment_date,
            "start_time": appt.start_time,
            "end_time": appt.end_time,
            "status": appt.status,
            "notes": appt.notes,
            "physical_location": appt.physical_location,
            "meeting_url": appt.meeting_url,
            "mentor": mentor_info
        })

    return jsonify(student_appointments=student_appointments), 200


# helper function to get program_type
def get_program_type(program_id): 
    try: 
        program = ProgramType.query.filter_by(id=program_id).first()

        if program:
            return program.type
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# helper function to get course_name
def get_course_name(course_id): 
    try: 
        course = ClassInformation.query.filter_by(id=course_id).first()

        if course:
            return course.class_name
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Retrieve available appointments to reserve
@student.route('/student/appointments-available/<program_type>/<course_id>', methods=['GET'])
def get_available_appointments(program_type, course_id):
    now = datetime.now()

    program = ProgramType.query.filter_by(id=program_type).first()

    if program:

        if program.class_id == -2:
            course_id = -2
        
        future_appointments = Appointment.query.filter(
            (Appointment.status == 'posted') &
            (Appointment.type == program_type) &
            (Appointment.class_id == course_id) &
            (Appointment.appointment_date > now.date())
        ).all()

        available_appointments = []
        for appt in future_appointments:
            appointment_data = {
                "appointment_id": appt.id,
                "physical_location": appt.physical_location,
                "date": appt.appointment_date,
                "type": appt.type,
                "start_time": appt.start_time,
                "end_time": appt.end_time,
                "status": appt.status,
                "meeting_url": appt.meeting_url
            }
            available_appointments.append(appointment_data)
                
        return jsonify({"available_appointments": available_appointments})
    else:
        return jsonify({"error": "Program Type not found"}), 404


# Retrieve available appointments to reserve
@student.route('/student/appointments/available/<program_type>', methods=['GET'])
def get_available_appointment_slots(program_type):
    now = datetime.now()
    
    future_appointments = Appointment.query.filter(
        (Appointment.status == 'posted') &
        (Appointment.type == program_type) &
        (Appointment.appointment_date > now.date())
    ).all()

    available_appointments = []
    for appt in future_appointments:
        appointment_data = {
            "appointment_id": appt.id,
            "date": appt.appointment_date,
            "type": appt.type,
            "start_time": appt.start_time,
            "end_time": appt.end_time,
            "status": appt.status
        }
        available_appointments.append(appointment_data)
            
    return jsonify({"available_appointments": available_appointments})


# Helper function to send confirmation email to student and mentor
def send_confirmation_email(appointment):
    student = User.query.get(appointment.student_id)
    mentor = User.query.get(appointment.mentor_id)

    if student and mentor:
        student_email_subject = f'{appointment.type} confirmation: {appointment.appointment_date} at {appointment.start_time}.'
        student_email_content = f'Your {appointment.type} appointment with {mentor.first_name} is confirmed for {appointment.appointment_date} at {appointment.start_time}.'

        mentor_email_subject = f'{appointment.type} confirmation: {appointment.appointment_date} at {appointment.start_time}.'
        mentor_email_content = f'Your {appointment.type} appointment with {student.first_name} is confirmed for {appointment.appointment_date} at {appointment.start_time}.'

        # Create datetime objs for ics file
        timezone_offset = "-08:00"  # PST timezone offset
        date_obj = datetime.strptime(appointment.appointment_date, "%Y-%m-%d")
        start_time_obj = datetime.strptime(appointment.start_time, "%H:%M")
        end_time_obj = datetime.strptime(appointment.end_time, "%H:%M")

        # Combine date and time
        combined_start_datetime = date_obj + timedelta(hours=start_time_obj.hour, minutes=start_time_obj.minute)
        combined_end_datetime = date_obj + timedelta(hours=end_time_obj.hour, minutes=end_time_obj.minute)

        # Format the combined datetime with timezone offset
        formatted_start_datetime = combined_start_datetime.strftime("%Y-%m-%dT%H:%M:%S") + timezone_offset
        formatted_end_datetime = combined_end_datetime.strftime("%Y-%m-%dT%H:%M:%S") + timezone_offset
        
        # Create an .ics file for the appointment
        cal = Calendar()
        event = Event()
        event.name = appointment.type
        event.begin = formatted_start_datetime
        event.end = formatted_end_datetime
        cal.events.add(event)
        ics_data = cal.serialize()
        
        # Attach the .ics file to the email
        send_email(mentor.email, student_email_subject, student_email_content, ics_data)
        return True
    return False



# Helper function to get the start and end dates of the week for a given date
def get_week_range(date_str):
    date = datetime.strptime(date_str, '%Y-%m-%d')
    start_of_week = date - timedelta(days=date.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    return start_of_week.strftime('%Y-%m-%d'), end_of_week.strftime('%Y-%m-%d')

def update_appointments_status(mentor_id, appointment_date, scope):
    parsed_appointment_date = datetime.strptime(appointment_date, '%Y-%m-%d')
    if scope == 'daily':
        # Update appointments for the day
        appointments = Appointment.query.filter(
            Appointment.mentor_id == mentor_id,
            func.date(Appointment.appointment_date) == appointment_date,
            Appointment.status == 'posted'
        ).all()
        # Update the availability for the day
        availabilities = Availability.query.filter(
            Availability.user_id == mentor_id,
            func.date(Availability.date) == appointment_date
        ).all()
    elif scope == 'weekly':
        start_of_week, end_of_week = get_week_range(appointment_date)
        # Update appointments for the week
        appointments = Appointment.query.filter(
            Appointment.mentor_id == mentor_id,
            func.date(Appointment.appointment_date).between(start_of_week, end_of_week),
            Appointment.status == 'posted'
        ).all()
        # Update availabilities for the week
        availabilities = Availability.query.filter(
            Availability.user_id == mentor_id,
            func.date(Availability.date).between(start_of_week, end_of_week)
        ).all()
    elif scope == 'monthly':
        #Your code here
        appointments = Appointment.query.filter(
            Appointment.mentor_id == mentor_id,
            extract('month', func.date(Appointment.appointment_date)) == parsed_appointment_date.month,
            extract('year', func.date(Appointment.appointment_date)) == parsed_appointment_date.year,
            Appointment.status == 'posted'
        ).all()

        # Update availabilities for the month
        availabilities = Availability.query.filter(
            Availability.user_id == mentor_id,
            extract('month', func.date(Availability.date)) == parsed_appointment_date.month,
            extract('year', func.date(Availability.date)) == parsed_appointment_date.year
        ).all()
        
    # Set all fetched appointments to 'inactive'
    for appt in appointments:
        appt.status = 'inactive'

    # Set all fetched availabilities to 'inactive'
    for avail in availabilities:
        avail.status = 'inactive'
    db.session.commit()


@student.route('/student/appointments/reserve/<appointment_id>/<course_id>', methods=['POST'])
@jwt_required()
def reserve_appointment(appointment_id, course_id):
    try:
        data = request.get_json()
        student_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment or appointment.status != 'posted':
            return jsonify({"error": "Appointment is not available for reservation"}), 400

        student = User.query.get(student_id)
        if not student or student.account_type != 'student':
            return jsonify({"error": "Only students are allowed to book sessions!"}), 400

        current_time = datetime.now() - timedelta(hours=8)
        appointment_datetime = datetime.strptime(appointment.appointment_date + ' ' + appointment.start_time, '%Y-%m-%d %H:%M')
        if appointment_datetime <= current_time:
            return jsonify({"error": "Cannot reserve past appointments"}), 400

        mentor_limits = ProgramType.query.filter_by(id=appointment.type).first()

        # Calculate week range for the appointment
        start_of_week, end_of_week = get_week_range(appointment.appointment_date)

        # Count current reserved and pending appointments for the day
        daily_count = Appointment.query.filter(
            Appointment.mentor_id == appointment.mentor_id,
            func.date(Appointment.appointment_date) == appointment.appointment_date,
            Appointment.status.in_(['reserved', 'pending'])
        ).count()

        # Count current reserved and pending appointments for the week
        weekly_count = Appointment.query.filter(
            Appointment.mentor_id == appointment.mentor_id,
            func.date(Appointment.appointment_date).between(start_of_week, end_of_week),
            Appointment.status.in_(['reserved', 'pending'])
        ).count()
        
        parsed_appointment_date = datetime.strptime(appointment.appointment_date, '%Y-%m-%d')

        # Count current reserved and pending appointments for the month
        monthly_count = Appointment.query.filter(
            Appointment.mentor_id == appointment.mentor_id,
            extract('month', func.date(Appointment.appointment_date)) == parsed_appointment_date.month,
            extract('year', func.date(Appointment.appointment_date)) == parsed_appointment_date.year,
            Appointment.status.in_(['reserved', 'pending'])
        ).count()
        
        # Check against daily and weekly limits
        if (not mentor_limits) or (daily_count < mentor_limits.max_daily_meetings and \
            weekly_count < mentor_limits.max_weekly_meetings and monthly_count < mentor_limits.max_monthly_meetings):
            try:
                appointment.student_id = student_id
                appointment.notes = data.get('notes', None)
                if mentor_limits.auto_approve_appointments:
                    appointment.status = 'reserved'
                else:
                    appointment.status = 'pending'
                appointment.class_id = course_id
                    
                # Check if this appointment hits the daily or weekly limit
                hits_daily_limit = daily_count + 1 == mentor_limits.max_daily_meetings
                hits_weekly_limit = weekly_count + 1 == mentor_limits.max_weekly_meetings
                hits_monthly_limit = monthly_count + 1 == mentor_limits.max_monthly_meetings
                db.session.commit()
                
                if hits_daily_limit:
                    update_appointments_status(appointment.mentor_id, appointment.appointment_date, 'daily')
                elif hits_weekly_limit:
                    update_appointments_status(appointment.mentor_id, appointment.appointment_date, 'weekly')
                elif hits_monthly_limit:
                    update_appointments_status(appointment.mentor_id, appointment.appointment_date, 'monthly')

                
                if appointment.status == 'reserved':
                    send_email_success = send_confirmation_email(appointment)
                    if send_email_success:
                        return jsonify({"message": "Appointment reserved and confirmation email sent", "status": appointment.status}), 201
                    else:
                        return jsonify({"message": "Appointment reserved but email not sent", "status": appointment.status}), 202
                else:
                    return jsonify({"message": "Appointment pending approval", "status": appointment.status}), 201
            except Exception as e:
                db.session.rollback()
                print(f"Exception: {str(e)}")
                return jsonify({"error": f"Exception: {str(e)}"}), 500
        else:
            # Update remaining slots if limits are reached
            if daily_count >= mentor_limits.max_daily_meetings:
                update_appointments_status(appointment.mentor_id, appointment.appointment_date, 'daily')
            elif weekly_count >= mentor_limits.max_weekly_meetings:
                update_appointments_status(appointment.mentor_id, appointment.appointment_date, 'weekly')
            return jsonify({"message": "Meeting limit reached"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update a meeting's notes, meeting_url
@student.route('/meetings/update', methods=['POST'])
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


# Cancel a specific appointment by its ID if it has been booked by the student
@student.route('/student/appointments/cancel/<appointment_id>', methods=['POST'])
@jwt_required()
def cancel_appointment(appointment_id):
    try:
        student_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        student = User.query.get(student_id)
        
        if not appointment or not student:
            return jsonify({"error": "Appointment or student doesn't exist"}), 404
        
        # Check if the appointment was booked by this student 
        if appointment.status == 'reserved' or appointment.status == 'pending' and appointment.student_id == student.id:
            current_time = datetime.now() - timedelta(hours=8)
            appointment_datetime = datetime.strptime(appointment.appointment_date + ' ' + appointment.start_time, '%Y-%m-%d %H:%M')
            
            #check if the appointment is in the future
            if appointment_datetime > current_time:
                # Make the appointment available for reservation
                appointment.status = 'posted'
                appointment.meeting_url = None
                appointment.student_id = None
                appointment.notes = None
                db.session.commit()
                return jsonify({"message": "Appointment cancelled successfully"}), 200
            else:
                return jsonify({"error": "Past appointments cannot be cancelled"}), 400
        else:
            return jsonify({"error": "Appointment cannot be cancelled"}), 400
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Create comments for specific appointment as a student
@student.route('/student/appointments/<appointment_id>/comment', methods=['POST'])
@jwt_required()
def create_comment(appointment_id):
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        appointment_comment = data.get('appointment_comment')
        appointment = Appointment.query.get(appointment_id)
        student = User.query.get(user_id)
        
        if student and appointment:
            new_comment = AppointmentComment(
                appointment_id=appointment_id,
                user_id=user_id,
                appointment_comment=appointment_comment,
                created_at=datetime.now()
            )
            db.session.add(new_comment)
            db.session.commit()
            return jsonify({"message": "comment created successfully"}), 200 
        else:
            return jsonify({"error": "appointment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Get comments for specific appointment as a mentor
@student.route('/student/appointments/<appointment_id>/comment', methods=['GET'])
@jwt_required()
def get_comments(appointment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        student = User.query.get(user_id)
        
        if student and appointment:
            comments = AppointmentComment.query.filter_by(appointment_id=appointment_id).join(User, AppointmentComment.user_id == User.id).all()
            comments_list = []
            for comment in comments:
                comment_info = {
                    'id': comment.id,
                    'name': comment.user.first_name,
                    'user_id': comment.user_id,
                    'appointment_comment': comment.appointment_comment,
                    'created_at': comment.created_at
                }
                comments_list.append(comment_info)
            return jsonify({"comments": comments_list}), 200
        else:
            return jsonify({"error": "appointment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Delete comments for specific appointment as a mentor
@student.route('/student/appointments/<appointment_id>/comment/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(appointment_id, comment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        student = User.query.get(user_id)
        comment = AppointmentComment.query.get(comment_id)
        
        if student and appointment and comment:
            if comment.user_id == user_id:
                db.session.delete(comment)
                db.session.commit()
                return jsonify({"message": "comment deleted successfully"}), 200
            else:
                return jsonify({"error": "unauthorized"}), 403
        else:
            return jsonify({"error": "appointment or comment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Get all dropins for the courses a student is in
@student.route('/student/dropins/<course_id>', methods=['GET'])
@jwt_required()
def get_student_dropins(course_id):
    try:
        user_id = get_jwt_identity()
        student = User.query.get(user_id)
        
        if student:
            courses = CourseMembers.query.filter(CourseMembers.user_id==user_id)

            if course_id != '-1':
                courses = courses.filter(CourseMembers.class_id==course_id).all()
            else: 
                courses = courses.all()

            if courses:

                for course in courses:
                    course_information = ClassInformation.query.filter(ClassInformation.id == course.class_id).first()
                    programs_in_course = ProgramType.query.filter(ProgramType.class_id == course.class_id).all()

                    all_formatted_programs = []

                    if programs_in_course:
                        for program in programs_in_course:
                            program_info = {
                                'id': program.id,
                                'isDropins': program.isDropins,
                            }
                            all_formatted_programs.append(program_info)
                        
                    # get global programs and add them to programs_in_course
                    global_programs = get_global_programs(course_information.teacher_id)
                    global_programs = [{'id': program['id'], 'isDropins': program['isDropins']} for program in global_programs]

                    for program in global_programs:
                        all_formatted_programs.append(program)

                    # then filter by isDropins == True
                    all_formatted_programs = [program for program in all_formatted_programs if program.get('isDropins') == True]

                    # join with availability
                    dropin_times = []

                    for program in all_formatted_programs:
                        #print(program)
                        availabilities = Availability.query.filter_by(type=program.get('id')).all()

                        for availability in availabilities:
                            program_type = get_program_type(availability.type)
                            availability_info = {
                                'id': availability.id,
                                'class_id': availability.class_id,
                                'type': program_type,
                                'date': availability.date,
                                'start_time': availability.start_time,
                                'end_time': availability.end_time,
                            }
                            dropin_times.append(availability_info)

                    return jsonify(dropin_times), 200
            else:
                return jsonify({"error": "courses not found"}), 404
        else:
            return jsonify({"error": "student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# helper function to get program_type
def get_program_type(program_id): 
    try: 
        program = ProgramType.query.filter_by(id=program_id).first()

        if program:
            return program.type
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# helper function to get course_name
def get_course_name(course_id): 
    try: 
        course = ClassInformation.query.filter_by(id=course_id).first()

        if course:
            return course.class_name
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get all programs for each course a user is registered in
@student.route('/student/get/appointment-programs', methods=['GET'])
@jwt_required()
def get_appointment_programs():
    try:
        user_id = get_jwt_identity()
        student = User.query.get(user_id)
        
        if student:
            all_student_courses = ClassInformation.query.join(CourseMembers, ClassInformation.id == CourseMembers.class_id).filter_by(user_id=user_id).all()
            class_info = [{'class_id': course.id, 'class_name': course.class_name} for course in all_student_courses]

            if all_student_courses:

                courses_with_programs = []

                for entry in class_info:
                    class_id = entry['class_id']

                    all_programs_in_course = ProgramType.query.filter_by(class_id=class_id).all()

                    course = ClassInformation.query.filter_by(id=class_id).first()

                    global_programs = get_global_programs(course.teacher_id)
                    course_with_programs = []

                    for program in all_programs_in_course:
                        if program.isDropins == False:
                            program_info = {
                                'id': program.id,
                                'type': program.type,
                                'description': program.description,
                                'duration': program.duration,
                                'physical_location': program.physical_location,
                                'virtual_link': program.virtual_link,
                                'auto_approve_appointments': program.auto_approve_appointments,
                                'max_daily_meetings': program.max_daily_meetings,
                                'max_weekly_meetings': program.max_weekly_meetings,
                                'max_monthly_meetings': program.max_monthly_meetings,
                                'isDropins': program.isDropins,
                            }
                            course_with_programs.append(program_info)
                        
                    if global_programs is not None:
                        for global_program in global_programs:
                            if global_program['isDropins'] == False:
                                course_with_programs.append(global_program)

                    formatTuple = {
                        'id': class_id,
                        'class_name': entry['class_name'],
                        'programs': course_with_programs
                    }

                    courses_with_programs.append(formatTuple)
                
                return jsonify(courses_with_programs), 200
            else: 
                return jsonify({"error": "no courses found for mentor"}), 404
        else:
            return jsonify({"error": "mentor not found"}), 404
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
                        'physical_location': program.physical_location,
                        'virtual_link': program.virtual_link,
                        'auto_approve_appointments': program.auto_approve_appointments,
                        'max_daily_meetings': program.max_daily_meetings,
                        'max_weekly_meetings': program.max_weekly_meetings,
                        'max_monthly_meetings': program.max_monthly_meetings,
                        'isDropins': program.isDropins,
                    }
                    all_formatted_programs.append(program_info)

                return all_formatted_programs
            else: 
                return None
        else:
            return jsonify({"error": "mentor not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500