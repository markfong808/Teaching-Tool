""" 
 * admin.py
 * Last Edited: 3/24/24
 *
 * Contains functions used by admin user account_type
 *
 * Known Bugs:
 * - Has not been revised to work with Canvas Meeting Scheduler. All functions are from instructor Network
 *
"""

from flask import Blueprint, jsonify, request
from .models import User, ProgramDetails, db
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, set_access_cookies, get_jwt
from datetime import datetime, timedelta, timezone
from . import db
from .user import get_user_data

admin = Blueprint('admin', __name__)
allowed_account_types = ["admin", "instructor", "student"]
allowed_account_status = ["active", "inactive"]

# token generator
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
    
"""""""""""""""""""""""""""""""""""""""""""""""""""""
""             Backend Only Functions              ""
"""""""""""""""""""""""""""""""""""""""""""""""""""""

# check if user_id is an admin
def is_admin(user_id):
    user = User.query.filter_by(id=user_id).first()
    if user.account_type != 'admin':
        return False
    return True

"""""""""""""""""""""""""""""""""""""""""""""""""""""
""               Endpoint Functions                ""
"""""""""""""""""""""""""""""""""""""""""""""""""""""

# Get a list of all users and return their basic information
@admin.route('/admin/all-users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    user_list = []
    
    for user in users:
        user_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'account_type': user.account_type,
            'status': user.status,
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
            'name': admin.name,
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
            'name': student.name,
            'email': student.email,
            'status': student.status
        }
        student_list.append(student_data)
    
    return jsonify({"students": student_list})


# Get a list of all instructor users in the system
@admin.route('/admin/instructors', methods=['GET'])
def get_all_instructors():
    instructors = User.query.filter_by(account_type='instructor')
    instructor_list = []
    
    for instructor in instructors:
        instructor_data = {
            'id': instructor.id,
            'name': instructor.name,
            'email': instructor.email,
            'status': instructor.status
        }
        instructor_list.append(instructor_data)
        
    return jsonify({"instructors": instructor_list})


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
    
# update the profile for a given user based on their ID
@admin.route('/profile/update/<user_id>', methods=['POST'])
def update_profile(user_id):
    try:
        data = request.get_json()
        user = User.query.filter_by(id=user_id).first()

        if not user:
            return jsonify({"error": "User doesn't exist"}), 404

        # Update fields if they are provided in the request
        if 'name' in data:
            user.name = data['name']

        db.session.commit()
        response = get_user_data(user_id)
        return jsonify(response), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# create a new program using type, description, and duration
@admin.route('/program', methods=['POST'])
@jwt_required()
def create_program():
    user_id = get_jwt_identity()

    if not is_admin(user_id):
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.get_json()
    
    # Check if program with the same name already exists
    existing_program = ProgramDetails.query.filter_by(name=data.get('name')).first()
    if existing_program is not None:
        return jsonify({"msg": "Program with this name already exists"}), 409
    
    try:
        new_program = ProgramDetails(
            name=data.get('name'),
            description=data.get('description'),
            duration=data.get('duration')
        )
        db.session.add(new_program)
        db.session.commit()
        return jsonify({"msg": "Program created", "program": new_program.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error creating program", "error": str(e)}), 500
    
# update the program details of a program based on its ID
@admin.route('/program/<int:program_id>', methods=['POST'])
@jwt_required()
def update_program(program_id):
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({"msg": "Admin access required"}), 401

    program = ProgramDetails.query.get_or_404(program_id)
    data = request.get_json()
    program.name = data.get('name', program.name)
    program.description = data.get('description', program.description)
    program.duration = data.get('duration', program.duration)
    db.session.commit()
    return jsonify({"msg": "Program updated"}), 200

# delete the program using its ID
@admin.route('/program/<int:program_id>', methods=['DELETE'])
@jwt_required()
def delete_program(program_id):
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({"msg": "Admin access required"}), 401

    program = ProgramDetails.query.get_or_404(program_id)
    db.session.delete(program)
    db.session.commit()
    return jsonify({"msg": "Program deleted"}), 200