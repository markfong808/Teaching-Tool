from flask import Blueprint, request, jsonify, make_response
from .models import User
from werkzeug.security import generate_password_hash, check_password_hash
from . import db   ##means from __init__.py import db
from email_validator import EmailNotValidError, validate_email
from flask_jwt_extended import create_access_token, unset_jwt_cookies, \
    get_jwt_identity, set_access_cookies, get_jwt
from datetime import datetime, timedelta, timezone

auth = Blueprint('auth', __name__)         

@auth.after_request
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


@auth.route('/login', methods=['POST'])
def login():

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Validate email address
    try:
        emailinfo = validate_email(email, check_deliverability=False)
        email = emailinfo.normalized # Use normalized form of email address
    except EmailNotValidError as e:
        return jsonify({"error": "invalid email address"}), 400
    
    user = User.query.filter_by(email=email).first()
    if user:
        if check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.id)
            response = jsonify({"msg": "login successful"})
            set_access_cookies(response, access_token)
            return response
        else:
            return jsonify({"error": "Incorrect password, try again"}), 401
    else:
        return jsonify({"error": "email does not exist"}), 401


@auth.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@auth.route('/sign-up', methods=['POST'])
def sign_up():
    data = request.get_json()
    email = data.get('email')
    first_name = data.get('name')
    password1 = data.get('password')
    password2 = data.get('verifyPassword')
    user_type = data.get('userType') # "student" or "mentor"
    user_type = (str(user_type)).lower()
    
    # check if all the fields are provided
    required_fields = [email, first_name, password1, password2, user_type]
    if not all(required_fields):
        return jsonify({"error": "provide all the required fields"}), 400
    
    if user_type != "student" and user_type.lower() != "mentor":
        return jsonify({"error": "user_type field should be either 'student' or 'mentor' only"}), 400
    
    # Validate email address
    try:
        emailinfo = validate_email(email, check_deliverability=False) 
        email = emailinfo.normalized # Use normalized form of email address
    except EmailNotValidError as e:
        return jsonify({"error": str(e)}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already in use, either login or use different email"}), 400
    elif len(email) < 4:
        return jsonify({"error": "Email must be greater than 3 characters"}), 400
    elif len(first_name) < 2:
        return jsonify({"error": "First name must be greater than 1 character"}), 400
    elif password1 != password2:
        return jsonify({"error": "Passwords don't match"}), 400
    elif len(password1) < 7:
        return jsonify({"error": "Password must be at least 7 characters"}), 400
    elif user_type == "student":
        if not email.endswith('@uw.edu'):
            return jsonify({"error": "Invalid email domain. You must use your UW email"}), 400
        else:
            # Create student account
            status = "active"  # Student accounts are automatically active 
            user_id = create_account(email, first_name, 'student', status, password1)
            response = {"message": "Student account created successfully", "user_id": user_id}
            return jsonify(response), 201
    else:
        # Create mentor
        user_id = create_account(email, first_name, 'mentor', 'pending', password1)
        response = {"message": "Mentor account created successfully", "user_id": user_id}
        return jsonify(response), 201

def create_account(email, first_name, account_type, status, password1):
    new_user = User(email=email, first_name=first_name, account_type=account_type, status=status, password=generate_password_hash(password1, method='scrypt', salt_length=2))
    db.session.add(new_user)
    db.session.commit()
    return new_user.id