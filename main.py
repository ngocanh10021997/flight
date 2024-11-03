from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
from functools import wraps
import json
from typing import TypedDict, List, Literal, Optional
from dataclasses import dataclass

app = Flask(__name__)
CORS(app)

# Secret key for JWT
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable

# In-memory storage (replace with database in production)
config = {
    "minPrice": 0,
    "maxPrice": 10000,
    "loadingTime": 2000
}

bank_info = {
    "bin": "",
    "accountNumber": "",
    "accountName": ""
}

smtp_config = {
    "email": "",
    "password": ""
}

admin_credentials = {
    "email": "admin@example.com",
    "password": "admin123"  # In production, store hashed passwords
}

# JWT Authentication decorator


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            token = token.split()[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            print(data)
        except:
            return jsonify({'message': 'Invalid token'}), 401

        return f(*args, **kwargs)
    return decorated

# Booking endpoint


@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()

    # Validate required fields
    required_fields = ['flightId', 'passengers', 'contactInfo']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    # Validate passengers
    for passenger in data['passengers']:
        passenger_fields = ['type', 'firstName',
                            'lastName', 'dob', 'nationality']
        if not all(field in passenger for field in passenger_fields):
            return jsonify({'error': 'Invalid passenger data'}), 400

        if passenger['type'] not in ['adult', 'child', 'infant']:
            return jsonify({'error': 'Invalid passenger type'}), 400

    # Validate contact info
    contact_fields = ['email', 'phone', 'address']
    if not all(field in data['contactInfo'] for field in contact_fields):
        return jsonify({'error': 'Invalid contact information'}), 400

    # Here you would typically save the booking to a database

    return jsonify({
        'message': 'Booking created successfully',
        'bookingId': 'generated-booking-id'  # Generate real booking ID in production
    }), 201

# Admin login endpoint


@app.route('/api/get-payment-status', methods=['POST'])
def get_payment_status():
    data = request.get_json()
    print(data)
    return jsonify({'message': 'Payment status fetched successfully'}), 200


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()

    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Missing credentials'}), 400

    if (data['username'] == admin_credentials['username'] and
            data['password'] == admin_credentials['password']):

        token = jwt.encode({
            'username': data['username'],
            'exp': datetime.now(datetime.UTC) + timedelta(hours=24)
        }, SECRET_KEY)

        return jsonify({'token': token})

    return jsonify({'error': 'Sai tên đăng nhập hoặc mật khẩu'}), 401

# Website Configuration endpoints


@app.route('/api/admin/config', methods=['GET'])
@token_required
def get_config():
    return jsonify(config)


@app.route('/api/admin/config', methods=['PUT'])
@token_required
def update_config():
    data = request.get_json()

    required_fields = ['minPrice', 'maxPrice', 'loadingTime']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    config.update(data)
    return jsonify(config)

# Bank Information endpoints


@app.route('/api/admin/bank-info', methods=['GET'])
@token_required
def get_bank_info():
    return jsonify(bank_info)


@app.route('/api/admin/bank-info', methods=['PUT'])
@token_required
def update_bank_info():
    data = request.get_json()

    required_fields = ['bin', 'accountNumber', 'accountName']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    bank_info.update(data)
    return jsonify(bank_info)

# SMTP Configuration endpoints


@app.route('/api/admin/smtp-config', methods=['GET'])
@token_required
def get_smtp_config():
    return jsonify(smtp_config)


@app.route('/api/admin/smtp-config', methods=['PUT'])
@token_required
def update_smtp_config():
    data = request.get_json()

    required_fields = ['email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    smtp_config.update(data)
    return jsonify(smtp_config)


if __name__ == '__main__':
    app.run(debug=True)
