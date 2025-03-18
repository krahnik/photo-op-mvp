from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import boto3
from botocore.exceptions import ClientError
import os

from config import (
    db, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME, AWS_REGION
)
from models import EventConfig, UserLead, ImageMetadata

app = Flask(__name__)
CORS(app)

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow()})

@app.route('/event-config', methods=['POST'])
def create_event_config():
    """Create a new event configuration."""
    try:
        data = request.json
        event_config = EventConfig(**data)
        result = db.event_configs.insert_one(event_config.dict())
        return jsonify({"message": "Event config created", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/event-config/<event_id>', methods=['GET'])
def get_event_config(event_id):
    """Get event configuration by ID."""
    try:
        event = db.event_configs.find_one({"_id": event_id})
        if not event:
            return jsonify({"error": "Event not found"}), 404
        return jsonify(event), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/user-lead', methods=['POST'])
def create_user_lead():
    """Create a new user lead with associated images."""
    try:
        data = request.json
        user_lead = UserLead(**data)
        result = db.user_leads.insert_one(user_lead.dict())
        return jsonify({"message": "User lead created", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/upload-image', methods=['POST'])
def upload_image():
    """Upload image to S3 bucket."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Generate unique filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{file.filename}"
        
        # Upload to S3
        s3_client.upload_fileobj(
            file,
            AWS_BUCKET_NAME,
            filename,
            ExtraArgs={'ACL': 'public-read'}
        )

        # Generate S3 URL
        image_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{filename}"
        
        return jsonify({
            "message": "Image uploaded successfully",
            "url": image_url
        }), 200
    except ClientError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003) 