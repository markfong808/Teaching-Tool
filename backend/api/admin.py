from flask import Blueprint, jsonify, request
from .models import User, db
from flask_jwt_extended import create_access_token, get_jwt_identity, set_access_cookies, get_jwt
from datetime import datetime, timedelta, timezone
from . import db
from .profile import get_user_data

admin = Blueprint('admin', __name__)
allowed_account_types = ["admin", "mentor", "student"]
allowed_account_status = ["active", "inactive"]

@admin.after_request
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

# Get a list of all users and return their basic information
@admin.route('/admin/all-users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    user_list = []
    
    for user in users:
        user_data = {
            'id': user.id,
            'name': user.first_name,
            'email': user.email,
            'account_type': user.account_type,
            'status': user.status,
            'linkedin_url': user.linkedin_url,
            'about': user.about,
            'meeting_url': user.meeting_url,
            'auto_approve_appointments': user.auto_approve_appointments,
        }
        user_list.append(user_data)
    
    return jsonify({"user_list": user_list})


# Get a list of admin users in the system
@admin.route('/admin/admins', methods=['GET'])
def get_all_admins():
    admins = User.query.filter_by(account_type='admin')
    admin_list = []
    
    for admin in admins:
        admin_data = {
            'id': admin.id,
            'name': admin.first_name,
            'email': admin.email,
            'status': admin.status
        }
        admin_list.append(admin_data)
    
    return jsonify({"admins": admin_list})


# Get a list of all student users in the system
@admin.route('/admin/students', methods=['GET'])
def get_all_students():
    students = User.query.filter_by(account_type='student')
    student_list = []
    
    for student in students:
        student_data = {
            'id': student.id,
            'name': student.first_name,
            'email': student.email,
            'status': student.status
        }
        student_list.append(student_data)
    
    return jsonify({"students": student_list})


# Get a list of all mentor users in the system
@admin.route('/admin/mentors', methods=['GET'])
def get_all_mentors():
    mentors = User.query.filter_by(account_type='mentor')
    mentor_list = []
    
    for mentor in mentors:
        mentor_data = {
            'id': mentor.id,
            'name': mentor.first_name,
            'email': mentor.email,
            'status': mentor.status
        }
        mentor_list.append(mentor_data)
        
    return jsonify({"mentors": mentor_list})


# Change the account type of a user to the specified new account type
@admin.route('/admin/change-account-type', methods=['POST'])
def change_account_type():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        new_account_type = data.get('new_account_type')

        if not type(user_id) == int:
            return jsonify({"error": "user_id must be an int value"}), 400
        
        # Ensure both user_id and new_account_type are provided
        if user_id is None or new_account_type is None:
            return jsonify({"error": "Both user_id and new_account_type are required"}), 400

        # Check if the new account type is allowed
        if new_account_type not in allowed_account_types:
            return jsonify({"error": f"Account type '{new_account_type}' not allowed"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user.account_type = new_account_type
        db.session.commit()
        return jsonify({"message": "Account type changed successfully"}), 200
    
    # other exceptions 
    except Exception as e:
        db.session.rollback()  # Roll back the changes
        return jsonify({"error": str(e)}), 500


# Change the account status for a specific user.
@admin.route('/admin/change-account-status', methods=['POST'])
def change_account_status():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        new_account_status = data.get('new_account_status')
        
        if not type(user_id) == int:
            return jsonify({"error": "user_id must be an int value"}), 400
        
        # Ensure both user_id and new_account_status are provided
        if user_id is None or new_account_status is None:
            return jsonify({"error": "Both user_id and new_account_status are required"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if new_account_status not in allowed_account_status:
            return jsonify({"error": f"Account status '{new_account_status}' not allowed"}), 400
        
        user.status = new_account_status
        db.session.commit()
        return jsonify({"message": "Account status changed successfully"}), 200
    
    # other exceptions 
    except Exception as e:
        db.session.rollback()  # Roll back the changes
        return jsonify({"error": str(e)}), 500
    
    
    
@admin.route('/profile/update/<user_id>', methods=['POST'])
def update_profile(user_id):
    try:
        data = request.get_json()
        user = User.query.filter_by(id=user_id).first()

        if not user:
            return jsonify({"error": "User doesn't exist"}), 404

        # Update fields if they are provided in the request
        if 'name' in data:
            user.first_name = data['name']
        if 'linkedin_url' in data:
            user.linkedin_url = data['linkedin_url']
        if 'about' in data:
            user.about = data['about']
        if 'meeting_url' in data:
            user.meeting_url = data['meeting_url']
        if 'auto_approve_appointments' in data:
            user.auto_approve_appointments = data['auto_approve_appointments']

        db.session.commit()
        response = get_user_data(user_id)
        return jsonify(response), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500