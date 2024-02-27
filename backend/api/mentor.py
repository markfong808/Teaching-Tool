from flask import Blueprint, request, jsonify
from .models import User, Availability, Appointment, MentorMeetingSettings, AppointmentComment, ClassInformation, CourseMembers, ProgramType
from flask_jwt_extended import jwt_required, get_jwt_identity, set_access_cookies, get_jwt, create_access_token
from sqlalchemy import extract, func, or_, and_
from . import db
from datetime import datetime, timedelta, timezone
from .mail import send_email
from ics import Calendar, Event
from .student import get_week_range

mentor = Blueprint('mentor', __name__)
allowed_availability_types = [
    "Mentoring Session", 
    "Mock Technical Interview",
    "Mock Behavorial Interview", 
    "Code Review", 
    "Personal Growth", 
    "Skill Development",
    "office_hours"
]

@mentor.after_request
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
    
def is_valid_date(date):
    try:
        input_date = datetime.strptime(date, "%Y-%m-%d").date()
        current_date = datetime.now().date()
        return input_date >= current_date
    except ValueError:
        return False
    

def is_valid_time(time):
    try:
        datetime.strptime(time, "%H:%M")
        return True
    except ValueError:
        return False
    
    
def is_start_time_before_end_time(start_time, end_time):
    try:
        start_datetime = datetime.strptime(start_time, "%H:%M")
        end_datetime = datetime.strptime(end_time, "%H:%M")
        time_difference = end_datetime - start_datetime
        min_time_difference = timedelta(minutes=30)
        if time_difference >= min_time_difference:
            return start_datetime < end_datetime
    except ValueError:
        return False


def validate_availability_data(mentor_id, availability_type, date, start_time, end_time):
    required_fields = [mentor_id, availability_type, date, start_time, end_time]

    # Check if any required field is missing
    if not all(required_fields):
        return jsonify({"error": "provide all the required fields"}), 400

    # Validate mentor
    mentor = User.query.filter_by(id=mentor_id, account_type='mentor').first()
    if not mentor:
        return jsonify({"error": "mentor not found!"}), 404

    # Validate availability_type
    if availability_type not in allowed_availability_types:
        return jsonify({"error": f"availability type '{availability_type}' not allowed"}), 400

    # Validate date
    is_date_valid = is_valid_date(date)
    if not is_date_valid:
        return jsonify({"error": "provide a valid 'YYYY-MM-DD' date format that is not in the past"}), 400

    # Validate start_time and end_time
    if not is_valid_time(start_time) or not is_valid_time(end_time) or not is_start_time_before_end_time(start_time, end_time):
        return jsonify({"error": "provide valid 'HH:MM' time formats, ensure that start_time is before end_time, and that they are at least 30 mins apart"}), 400

    return None  # Data is valid


def validate_availability_data_and_class(mentor_id, class_id, availability_id, date, start_time, end_time):
    required_fields = [mentor_id, class_id, availability_id, date, start_time, end_time]

    # Check if any required field is missing
    if not all(required_fields):
        return jsonify({"error": "provide all the required fields"}), 400

    # Validate mentor
    mentor = User.query.filter_by(id=mentor_id, account_type='mentor').first()
    if not mentor:
        return jsonify({"error": "mentor not found!"}), 404
    
    classTuple = ClassInformation.query.filter_by(id=class_id, teacher_id=mentor.id).first()
    if not classTuple:
        return jsonify({"error": "class not found!"}), 404

    # Validate availability_type
    programTuple = ProgramType.query.filter_by(id=availability_id).first()
    if not programTuple:
        return jsonify({"error": f"availability id '{availability_id}' not found"}), 400

    # Validate date
    is_date_valid = is_valid_date(date)
    if not is_date_valid:
        return jsonify({"error": "provide a valid 'YYYY-MM-DD' date format that is not in the past"}), 400

    # Validate start_time and end_time
    if not is_valid_time(start_time) or not is_valid_time(end_time) or not is_start_time_before_end_time(start_time, end_time):
        return jsonify({"error": "provide valid 'HH:MM' time formats, ensure that start_time is before end_time, and that they are at least 30 mins apart"}), 400

    return None  # Data is valid


def is_existing_availability(mentor_id, availability_type, date, start_time, end_time):
    existing_availabilities = Availability.query.filter_by(user_id=mentor_id, date=date).all()
    
    for existing_availability in existing_availabilities:
        if (start_time < existing_availability.end_time and end_time > existing_availability.start_time):
            return True  # There is a time overlap

    return False  # No time overlap found

def is_existing_availability_in_class(mentor_id, program_id, date, start_time, end_time):
    existing_availabilities = Availability.query.filter_by(user_id=mentor_id, type=program_id, date=date).all()
    
    for existing_availability in existing_availabilities:
        if (start_time < existing_availability.end_time and end_time > existing_availability.start_time):
            return True  # There is a time overlap

    return False  # No time overlap found

def send_confirmation_email(appointment):
    student = User.query.get(appointment.student_id)
    mentor = User.query.get(appointment.mentor_id)

    if student and mentor:
        student_email_subject = f'{appointment.type} Status Update'
        if appointment.status == 'reserved':
            student_email_content = f'Your {appointment.type} appointment with {mentor.first_name} has been reserved for {appointment.appointment_date} at {appointment.start_time}.'
        else:
            student_email_content = f'Your {appointment.type} appointment has been rejected for unknown reason {appointment.appointment_date} at {appointment.start_time}.'
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
        send_email(student.email, student_email_subject, student_email_content, ics_data)
        return True
    return False

@mentor.route('/meeting/update/status', methods=['POST'])
@jwt_required()
def update_meeting_status():
    try:
        data = request.get_json()
        appointment_id = data.get('appointment_id')
        status = data.get('status')
        appointment = Appointment.query.get(appointment_id)
        if appointment:
            appointment.status = status
            db.session.commit()
            if appointment.status == 'reserved':
                send_confirmation_email(appointment)
            return jsonify({"message": "status updated successfully"}), 200
        else:
            return jsonify({"error": "appointment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update mentor auto-approve setting
@mentor.route('/mentor/settings/auto-approve', methods=['POST'])
@jwt_required()
def set_auto_approve():
    mentor_id = get_jwt_identity()
    data = request.get_json()
    auto_approve = data.get('auto_approve', True)
    
    mentor = User.query.filter_by(id=mentor_id, account_type='mentor').first()
    if mentor:
        mentor.auto_approve_appointments = auto_approve
        db.session.commit()
        return jsonify({"message": "Auto-approve setting updated successfully"}), 200
    else:
        return jsonify({"error": "Mentor not found!"}), 404

# Returns a list of appointments that have been reserved by the students with a specific mentor
@mentor.route('/mentor/appointments', methods=['GET'])
@jwt_required()
def get_mentor_appointments():
    mentor_id = get_jwt_identity()
    meeting_type = request.args.get('type', 'all')
    current_time_pst = datetime.utcnow() - timedelta(hours=8)  # Adjust for PST
    current_date_str = current_time_pst.strftime('%Y-%m-%d')
    current_time_str = current_time_pst.strftime('%H:%M')

    appointments = Appointment.query.filter_by(mentor_id=mentor_id)
    
    if meeting_type in ['upcoming', 'past', 'pending']:
        if meeting_type == 'upcoming':
            appointments = appointments.filter(
                or_(
                    Appointment.appointment_date > current_date_str,
                    (Appointment.appointment_date == current_date_str) & (Appointment.start_time >= current_time_str)
                ),
                Appointment.status == 'reserved'
            )
        elif meeting_type == 'past':
            appointments = appointments.filter(
                or_(
                    Appointment.appointment_date < current_date_str,
                    (Appointment.appointment_date == current_date_str) & (Appointment.start_time < current_time_str)
                ),
                Appointment.status.in_(['reserved', 'completed', 'rejected', 'missed', 'canceled'])
            )
        elif meeting_type == 'pending':
            appointments = appointments.filter(
                or_(
                    Appointment.appointment_date > current_date_str,
                    (Appointment.appointment_date == current_date_str) & (Appointment.start_time >= current_time_str)
                ),
                Appointment.status == 'pending'
            )

    mentor_appointments = []
    for appt in appointments.all():
        student = User.query.get(appt.student_id) if appt.student_id else None
        student_info = {
            "first_name": student.first_name,
            "email": student.email,
            "about": student.about,
            "social_url": student.linkedin_url
        } if student else {}

        mentor_appointments.append({
            "appointment_id": appt.id,
            "type": appt.type,
            "date": appt.appointment_date,
            "start_time": appt.start_time,
            "end_time": appt.end_time,
            "status": appt.status,
            "notes": appt.notes,
            "meeting_url": appt.meeting_url,
            "student": student_info
        })

    return jsonify(mentor_appointments=mentor_appointments), 200
    
    
# Get the appointments for this mentor with a status of pending and
# let the mentor change the status to reserved or rejected
@mentor.route('/mentor/appointments/pending', methods=['POST'])
@jwt_required()
def update_mentor_appointment_status():
    try:
        data = request.get_json()
        appointment_id = data.get('appointment_id')
        mentor_id = get_jwt_identity()
        status = data.get('status')
        
        appointment = Appointment.query.filter_by(id=appointment_id, mentor_id=mentor_id).first()
        
        if not appointment:
            return jsonify({"error": "appointment not found"}), 404
        
        if status not in ['reserved', 'rejected']:
            return jsonify({"error": "invalid status"}), 400
        
        if appointment.status == 'pending':
            appointment.status = status
            db.session.commit()
            
            if status == 'reserved':
                send_email_success = send_confirmation_email(appointment)
            if send_email_success:
                return jsonify({"message": "appointment reserved successfully and confirmation email sent"}), 201
            else:
                return jsonify({"message": "appointment reserved successfullly but couldn't send confirmation email"}), 202
        else:
            return jsonify({"error": "appointment status cannot be updated"}), 400
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    
# Get a list of availabilities added by a specific mentor
@mentor.route('/mentor/availability', methods=['GET'])
@jwt_required()
def get_mentor_availability():
    try:
        # check if mentor exists
        mentor_id = get_jwt_identity()
        mentor = User.query.filter_by(id=mentor_id, account_type='mentor').first()
        if not mentor:
            return jsonify({"error": "mentor not found!"}), 404
        
        current_date = datetime.now().date()
        # get the availability data for the specified mentor
        availability_data = Availability.query.filter(
            and_(Availability.user_id == mentor_id, Availability.date > str(current_date))
        ).all()
        availability_list = []
        for availability in availability_data:
            availability_info = {
                'id': availability.id,
                'type': availability.type,
                'date': availability.date,
                'start_time': availability.start_time,
                'end_time': availability.end_time,
                'status': availability.status
            }
            availability_list.append(availability_info)
        return jsonify({"mentor_availability": availability_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
# Generate appointment events at 30-minute intervals within the specified time range.
def generate_appointment_events(mentor_id, availability_type, date, start_time, end_time, availability_id):
    try:
        start_datetime = datetime.strptime(start_time, "%H:%M")
        end_datetime = datetime.strptime(end_time, "%H:%M")

        while start_datetime + timedelta(minutes=30) <= end_datetime:
            new_appointment = Appointment(
                type=availability_type,
                mentor_id=mentor_id,
                appointment_date=date,
                start_time=start_datetime.strftime("%H:%M"),
                end_time=(start_datetime + timedelta(minutes=30)).strftime("%H:%M"),
                status="posted",
                availability_id=availability_id
            )
            start_datetime += timedelta(minutes=30)
            db.session.add(new_appointment)
        
        db.session.commit()
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

# Generate appointment events at 30-minute intervals within the specified time range.
def generate_appointment_tuples(mentor_id, course_id, program_id, date, start_time, end_time, physical_location, virtual_link, availability_id, timeSplit):
    try:
        start_datetime = datetime.strptime(start_time, "%H:%M")
        end_datetime = datetime.strptime(end_time, "%H:%M")

        if timeSplit == 0:
            new_appointment = Appointment(
                type=program_id,
                mentor_id=mentor_id,
                class_id=course_id,
                appointment_date=date,
                start_time=start_datetime.strftime("%H:%M"),
                end_time=end_datetime.strftime("%H:%M"),
                status="posted",
                physical_location=physical_location,
                meeting_url=virtual_link,
                availability_id=availability_id
            )
            db.session.add(new_appointment)
        else:
            while start_datetime + timedelta(minutes=timeSplit) <= end_datetime:
                new_appointment = Appointment(
                    type=program_id,
                    mentor_id=mentor_id,
                    class_id=course_id,
                    appointment_date=date,
                    start_time=start_datetime.strftime("%H:%M"),
                    end_time=(start_datetime + timedelta(minutes=timeSplit)).strftime("%H:%M"),
                    status="posted",
                    physical_location=physical_location,
                    meeting_url=virtual_link,
                    availability_id=availability_id
                )
                start_datetime += timedelta(minutes=timeSplit)
                db.session.add(new_appointment)
        
        db.session.commit()
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

# Add all mentor availability
@mentor.route('/mentor/add-all-availability/<class_id>', methods=['POST'])
@jwt_required()
def add_all_mentor_availability(class_id):
    try:
        data = request.get_json()
        mentor_id = get_jwt_identity()
        allAvailabilties = data.get('availabilities')
        timeSplit = data.get('duration')
        physical_location = data.get('physical_location')
        virtual_link = data.get('virtual_link')
        
        if timeSplit:
            timeSplit = int(timeSplit)
        else: 
            timeSplit = 0

        for availabilityEntry in allAvailabilties:
            add_mentor_single_availability(class_id, mentor_id, availabilityEntry, physical_location, virtual_link, timeSplit)

        return jsonify({"message": "all availability added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def add_mentor_single_availability(class_id, mentor_id, data, physical_location, virtual_link, timeSplit):
    try:
        program_id = data.get('id')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        course = ClassInformation.query.filter_by(id=class_id).first()

        if course:
        
            # Validate the data
            validation_result = validate_availability_data_and_class(mentor_id, class_id, program_id, date, start_time, end_time)
            if validation_result:
                return validation_result
            
            # Check if the same availability already exists for the mentor
            if is_existing_availability_in_class(mentor_id, program_id, date, start_time, end_time):
                return jsonify({"error": "availability time conflict or it already exists for this mentor"}), 400
            
            current_time = datetime.now() - timedelta(hours=8)
            availability_datetime = datetime.strptime(date + ' ' + start_time, '%Y-%m-%d %H:%M')
            
            if availability_datetime > current_time:
                # Add the new availability
                new_availability = Availability(
                    user_id=mentor_id,
                    class_id=class_id,
                    type=program_id,
                    date=date,
                    start_time=start_time,
                    end_time=end_time, 
                    status='active'
                )
                db.session.add(new_availability) 
                db.session.commit()
                
                # Generate appointment events
                generate_appointment_tuples(mentor_id, class_id, program_id, date, start_time, end_time, physical_location, virtual_link, new_availability.id, timeSplit)
                return jsonify({"message": "availability added successfully"}), 201
            else:
                return jsonify({"error": "appointment datetime must be in the future"}), 400
        else: 
            return jsonify({"error": "course not found"}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

# Add mentor availability
@mentor.route('/mentor/add-availability', methods=['POST'])
@jwt_required()
def add_mentor_availability():
    try:
        data = request.get_json()
        mentor_id = get_jwt_identity()
        availability_type = data.get('type')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        # Validate the data
        validation_result = validate_availability_data(mentor_id, availability_type, date, start_time, end_time)
        if validation_result:
            return validation_result
        
        # Check if the same availability already exists for the mentor
        if is_existing_availability(mentor_id, availability_type, date, start_time, end_time):
            return jsonify({"error": "availability time conflict or it already exists for this mentor"}), 400
        
        current_time = datetime.now() - timedelta(hours=8)
        availability_datetime = datetime.strptime(date + ' ' + start_time, '%Y-%m-%d %H:%M')
        
        if availability_datetime > current_time:
             # Add the new availability
            new_availability = Availability(
                user_id=mentor_id,
                type=availability_type,
                date=date,
                start_time=start_time,
                end_time=end_time, 
                status='active'
            )
            db.session.add(new_availability) 
            db.session.commit()
            
            # Generate appointment events
            generate_appointment_events(mentor_id, availability_type, date, start_time, end_time, new_availability.id)
            return jsonify({"message": "availability added successfully"}), 201
        else:
            return jsonify({"error": "appointment datetime must be in the future"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    
@mentor.route('/mentor/delete-availability/<availability_id>', methods=['DELETE'])
@jwt_required()
def delete_mentor_availabililty(availability_id):
    try:
        mentor_id = get_jwt_identity()        
        mentor = User.query.filter_by(id=mentor_id, account_type='mentor').first() 
        if mentor:
            availability = Availability.query.get(availability_id)

            if availability and availability.user_id == int(mentor_id):
                db.session.delete(availability)
                db.session.commit()
                return jsonify({"message": "delete successful"}), 200
            else:
                return jsonify({"error": "availability not found"}), 404
        else:
            return jsonify({"error": "unauthorized"}), 403
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# Cancel a specific appointment by its ID if it has been booked by the student
@mentor.route('/mentor/appointments/cancel/<appointment_id>', methods=['POST'])
@jwt_required()
def cancel_appointment(appointment_id):
    try:
        mentor_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        mentor = User.query.get(mentor_id)
        
        if not appointment or not mentor:
            return jsonify({"error": "Appointment or mentor doesn't exist"}), 404
        
        # Check if the appointment was booked by this mentor 
        if appointment.status == 'reserved' or appointment.status == 'pending' \
                and appointment.mentor_id == mentor.id:
            current_time = datetime.now() - timedelta(hours=8)
            appointment_datetime = datetime.strptime(appointment.appointment_date + ' ' + appointment.start_time, '%Y-%m-%d %H:%M')
            
            #check if the appointment is in the future
            if appointment_datetime > current_time:
                # Make the appointment available for reservation
                appointment.status = 'canceled'
                db.session.commit()
                return jsonify({"message": "Appointment cancelled successfully"}), 200
            else:
                return jsonify({"error": "Past appointments cannot be cancelled"}), 400
        else:
            return jsonify({"error": "Appointment cannot be cancelled"}), 400
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@mentor.route('/mentor/meeting/limits', methods=['POST'])
@jwt_required()
def update_mentor_meeting_limits():
    try:
        data = request.get_json()
        mentor_id = get_jwt_identity()
        max_daily_meetings = data.get('daily_limit')
        max_weekly_meetings = data.get('weekly_limit')
        max_monthly_meetings = data.get('total_limit')
        
        mentor = User.query.filter_by(id=mentor_id, account_type='mentor').first()
        if mentor:
            mentor_settings = mentor.mentor_settings
            if mentor_settings:
                mentor_settings.max_daily_meetings = max_daily_meetings
                mentor_settings.max_weekly_meetings = max_weekly_meetings
                mentor_settings.max_monthly_meetings = max_monthly_meetings
            else:
                mentor_settings = MentorMeetingSettings(
                    mentor_id=mentor_id,
                    max_daily_meetings=max_daily_meetings,
                    max_weekly_meetings=max_weekly_meetings,
                    max_monthly_meetings=max_monthly_meetings
                )
                db.session.add(mentor_settings)
            db.session.commit()
            return jsonify({"message": "meeting limits updated successfully"}), 200
        else:
            return jsonify({"error": "mentor not found!"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@mentor.route('/mentor/meeting/limits', methods=['GET'])
@jwt_required()
def get_meeting_limits():
    try:
        mentor_id = get_jwt_identity()
        mentor = User.query.filter_by(id=mentor_id, account_type='mentor').first()
        if mentor:
            mentor_settings = mentor.mentor_settings
            if mentor_settings:
                return jsonify({
                    "daily_limit": mentor_settings.max_daily_meetings,
                    "weekly_limit": mentor_settings.max_weekly_meetings,
                    "total_limit": mentor_settings.max_monthly_meetings
                }), 200
            else:
                return jsonify({
                    "daily_limit": '',
                    "weekly_limit": '',
                    "total_limit": ''
                }), 200
        else:
            return jsonify({"error": "mentor not found!"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mentor.route('/mentor/availability/status', methods=['POST'])
@jwt_required()
def update_availability_status():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        availability_id = data.get('availability_id')
        status = data.get('status')

        mentor = User.query.filter_by(id=user_id, account_type='mentor').first()
        if not mentor or not mentor.mentor_settings:
            return jsonify({"error": "Mentor settings not found"}), 404

        availability = Availability.query.filter_by(id=availability_id, user_id=user_id).first()
        if availability:
            parsed_appointment_date = datetime.strptime(availability.date, '%Y-%m-%d')
            start_of_week, end_of_week = get_week_range(availability.date)

            if status == 'inactive':
                availability.status = status
                appointments = Appointment.query.filter_by(availability_id=availability_id, status='posted').all()
                for appointment in appointments:
                    appointment.status = 'inactive'
                db.session.commit()
            elif status == 'active':
                monthly_count = Appointment.query.filter(
                    Appointment.mentor_id == user_id,
                    extract('month', func.date(Appointment.appointment_date)) == parsed_appointment_date.month,
                    extract('year', func.date(Appointment.appointment_date)) == parsed_appointment_date.year,
                    Appointment.status.in_(['reserved', 'pending'])
                ).count()

                weekly_count = Appointment.query.filter(
                    Appointment.mentor_id == user_id,
                    func.date(Appointment.appointment_date).between(start_of_week, end_of_week),
                    Appointment.status.in_(['reserved', 'pending'])
                ).count()

                daily_count = Appointment.query.filter(
                    Appointment.mentor_id == user_id,
                    func.date(Appointment.appointment_date) == parsed_appointment_date,
                    Appointment.status.in_(['reserved', 'pending'])
                ).count()

                error_message = "Meeting limit reached"
                if monthly_count >= mentor.mentor_settings.max_monthly_meetings:
                    error_message = "Monthly meeting limit reached"
                elif weekly_count >= mentor.mentor_settings.max_weekly_meetings:
                    error_message = "Weekly meeting limit reached"
                elif daily_count >= mentor.mentor_settings.max_daily_meetings:
                    error_message = "Daily meeting limit reached"

                if error_message != "Meeting limit reached":
                    return jsonify({"error": error_message}), 409

                appointments = Appointment.query.filter_by(availability_id=availability_id, status='inactive').all()
                availability.status = status
                for appointment in appointments:
                    appointment.status = 'posted'
                db.session.commit()
            return jsonify({"message": "status updated successfully"}), 200
        else:
            return jsonify({"error": "availability not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# Create comments for specific appointment as a mentor
@mentor.route('/mentor/appointments/<appointment_id>/comment', methods=['POST'])
@jwt_required()
def create_comment(appointment_id):
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        appointment_comment = data.get('appointment_comment')
        appointment = Appointment.query.get(appointment_id)
        mentor = User.query.get(user_id)
        
        if mentor and appointment:
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
        print(e)
        return jsonify({"error": str(e)}), 500
    
# Get comments for specific appointment as a mentor
@mentor.route('/mentor/appointments/<appointment_id>/comment', methods=['GET'])
@jwt_required()
def get_comments(appointment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        mentor = User.query.get(user_id)

        if mentor and appointment:
            comments = AppointmentComment.query.filter_by(appointment_id=appointment_id).join(User, AppointmentComment.user_id == User.id).all()
            comments_list = []
            for comment in comments:
                comment_info = {
                    'id': comment.id,
                    'name': comment.user.first_name,  # Assuming first_name is the field name in User table
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
@mentor.route('/mentor/appointments/<appointment_id>/comment/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(appointment_id, comment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        mentor = User.query.get(user_id)
        comment = AppointmentComment.query.get(comment_id)
        
        if mentor and appointment and comment:
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
    
# Get all programs for each course a user is registered in
@mentor.route('/mentor/courses', methods=['GET'])
@jwt_required()
def get_courses():
    try:
        user_id = get_jwt_identity()
        dataType = request.args.get('type')
        mentor = User.query.get(user_id)
        print(dataType)
        
        if mentor:
            all_mentor_courses = ClassInformation.query.join(CourseMembers, ClassInformation.id == CourseMembers.class_id).filter_by(user_id=user_id).all()
            class_info = [{'class_id': course.id, 'class_name': course.class_name} for course in all_mentor_courses]

            if all_mentor_courses:

                courses_with_programs = []

                for entry in class_info:
                    class_id = entry['class_id']

                    all_programs_in_course = ProgramType.query.filter_by(class_id=class_id).all()
                    course_with_programs = []

                    for program in all_programs_in_course:
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
                        }
                        course_with_programs.append(program_info)

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
    

# Get a list of availabilities added by a specific mentor
@mentor.route('/mentor/availability/<class_id>', methods=['GET'])
@jwt_required()
def get_mentor_availabilities(class_id):
    try:
        # check if mentor exists
        mentor_id = get_jwt_identity()
        mentor = User.query.filter_by(id=mentor_id, account_type='mentor').first()
        if not mentor:
            return jsonify({"error": "mentor not found!"}), 404
        
        current_date = datetime.now().date()

        # get the availability data for the specified mentor
        if class_id:
            if (class_id == '-1'):
                availability_data = Availability.query.filter(
                    and_(Availability.user_id == mentor_id, Availability.date > str(current_date))
                ).all()
            else:
                availability_data = Availability.query.filter(
                    and_(Availability.user_id == mentor_id, Availability.date > str(current_date), Availability.class_id == class_id)
                ).all()
                
            availability_list = []
            for availability in availability_data:
                program_type = get_program_type(availability.type)
                course_name = get_course_name(availability.class_id)

                availability_info = {
                    'id': availability.id,
                    'type': program_type,
                    'class_name': course_name,
                    'date': availability.date,
                    'start_time': availability.start_time,
                    'end_time': availability.end_time,
                    'status': availability.status
                }
                availability_list.append(availability_info)
            return jsonify({"mentor_availability": availability_list}), 200
        else:
            return jsonify({"error": "class_id undefined for availability"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Returns a list of appointments that have been reserved by the students with a specific mentor
@mentor.route('/mentor/appointments/<class_id>', methods=['GET'])
@jwt_required()
def get_mentor_appointments_for_class(class_id):
    mentor_id = get_jwt_identity()
    meeting_type = request.args.get('type', 'all')
    current_time_pst = datetime.utcnow() - timedelta(hours=8)  # Adjust for PST
    current_date_str = current_time_pst.strftime('%Y-%m-%d')
    current_time_str = current_time_pst.strftime('%H:%M')

    if not class_id:
        return jsonify({"error": "class_id undefined for appointments"}), 404

    appointments_query = Appointment.query.filter(Appointment.mentor_id == mentor_id)

    if class_id != '-1':
        appointments_query = appointments_query.filter(Appointment.class_id == class_id)

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

    mentor_appointments = []
    appointments = appointments_query.all()

    for appt in appointments:
        student = User.query.get(appt.student_id) if appt.student_id else None
        student_info = {
            "first_name": student.first_name,
            "email": student.email,
            "about": student.about,
            "social_url": student.linkedin_url
        } if student else {}

        program_type = get_program_type(appt.type)
        course_name = get_course_name(appt.class_id)

        mentor_appointments.append({
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
            "mentor": student_info
        })

    return jsonify(mentor_appointments=mentor_appointments), 200

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