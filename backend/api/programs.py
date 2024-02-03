from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import ProgramType, User
from . import db

programs = Blueprint('programs', __name__)


def is_admin(user_id):
    user = User.query.filter_by(id=user_id).first()
    if user.account_type != 'admin':
        return False
    return True

@programs.route('/programs', methods=['GET'])
def get_programs():
    programs = ProgramType.query.all()
    return jsonify([{
        "id": program.id,
        "name": program.name,
        "description": program.description,
        "duration": program.duration
    } for program in programs]), 200
    

@programs.route('/program', methods=['POST'])
@jwt_required()
def create_program():
    user_id = get_jwt_identity()

    if not is_admin(user_id):
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.get_json()
    
    # Check if program with the same name already exists
    existing_program = ProgramType.query.filter_by(name=data.get('name')).first()
    if existing_program is not None:
        return jsonify({"msg": "Program with this name already exists"}), 409

    try:
        new_program = ProgramType(
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


@programs.route('/program/<int:program_id>', methods=['GET'])
@jwt_required()
def get_program(program_id):
    program = ProgramType.query.get_or_404(program_id)
    return jsonify({
        "name": program.name,
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
    program.name = data.get('name', program.name)
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