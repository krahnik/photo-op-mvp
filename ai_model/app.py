# ai_model/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import torch
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image, ImageEnhance
import io, base64
import logging
import sys
import os
from datetime import datetime
import numpy as np
import threading
import time
import csv
import uuid
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Simplify CORS configuration to what worked before
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

# Configure image storage and tracking
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
GENERATED_IMAGES_DIR = os.path.join(APP_ROOT, 'generated_images')
CSV_FILE = os.path.join(APP_ROOT, 'image_tracking.csv')

# Ensure directories exist and are writable
os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)
logger.info(f"Generated images directory: {GENERATED_IMAGES_DIR}")

def ensure_csv_exists():
    """Ensure the CSV file exists with headers."""
    try:
        csv_dir = os.path.dirname(CSV_FILE)
        os.makedirs(csv_dir, exist_ok=True)
        
        # Check if file exists and is empty or needs to be created
        is_new_file = not os.path.exists(CSV_FILE) or os.path.getsize(CSV_FILE) == 0
        
        if is_new_file:
            with open(CSV_FILE, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['timestamp', 'filename', 'request_id', 'status'])
            logger.info(f"Created new CSV file at: {CSV_FILE}")
        
        # Verify file is writable
        with open(CSV_FILE, 'a', newline='') as f:
            pass
        
        logger.info(f"CSV file is ready at: {CSV_FILE}")
        return True
    except Exception as e:
        logger.error(f"Error setting up CSV file: {str(e)}")
        return False

# Initialize CSV file on startup
if not ensure_csv_exists():
    logger.error("Failed to initialize CSV file. Image tracking will not work!")

# Choose device based on availability (GPU is preferred)
device = "cuda" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if device == "cuda" else torch.float32
logger.info(f"Using device: {device} with dtype: {torch_dtype}")

try:
    # Load the Stable Diffusion model
    logger.info("Loading Stable Diffusion model...")
    model_id = "CompVis/stable-diffusion-v1-4"
    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        model_id,
        torch_dtype=torch_dtype,
        safety_checker=None
    )
    pipe = pipe.to(device)
    
    if device == "cuda":
        pipe.enable_attention_slicing()
        pipe.enable_sequential_cpu_offload()
    
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}", exc_info=True)
    sys.exit(1)

def track_generated_image(filename, request_id):
    """Track a generated image in the CSV file."""
    try:
        timestamp = datetime.now().isoformat()
        
        # Simple direct write to CSV
        mode = 'a' if os.path.exists(CSV_FILE) and os.path.getsize(CSV_FILE) > 0 else 'w'
        is_new_file = mode == 'w'
        
        with open(CSV_FILE, mode, newline='') as f:
            writer = csv.writer(f)
            if is_new_file:
                writer.writerow(['timestamp', 'filename', 'request_id', 'status'])
            writer.writerow([timestamp, filename, request_id, 'ready'])
            f.flush()
            os.fsync(f.fileno())
        
        # Verify write was successful
        if os.path.exists(CSV_FILE):
            with open(CSV_FILE, 'r', newline='') as f:
                content = f.read()
                if filename in content and request_id in content:
                    logger.info(f"Successfully wrote to CSV - timestamp: {timestamp}, filename: {filename}, request_id: {request_id}")
                    return True
                else:
                    raise Exception("Write verification failed")
        else:
            raise Exception("CSV file does not exist after write attempt")
            
    except Exception as e:
        logger.error(f"Error tracking image in CSV: {str(e)}")
        logger.error(f"CSV file path: {CSV_FILE}")
        logger.error(f"Current working directory: {os.getcwd()}")
        return False

def get_latest_image_for_request(request_id):
    """Get the latest generated image for a specific request ID."""
    try:
        if not os.path.exists(CSV_FILE):
            logger.error(f"CSV file not found at: {CSV_FILE}")
            return None

        with open(CSV_FILE, 'r', newline='') as f:
            reader = csv.DictReader(f)
            entries = list(reader)  # Read all entries
            
            # Filter and sort entries for this request_id
            matching_entries = [
                entry for entry in entries 
                if entry['request_id'] == request_id and entry['status'] == 'ready'
            ]
            
            if not matching_entries:
                logger.error(f"No entries found for request_id: {request_id}")
                return None
                
            # Sort by timestamp and get the latest
            latest_entry = sorted(matching_entries, key=lambda x: x['timestamp'])[-1]
            logger.info(f"Found latest image for request_id {request_id}: {latest_entry['filename']}")
            return latest_entry
            
    except Exception as e:
        logger.error(f"Error reading CSV: {str(e)}")
        return None

# Mailgun configuration
MAILGUN_API_KEY = os.getenv('MAILGUN_API_KEY')
MAILGUN_DOMAIN = os.getenv('MAILGUN_DOMAIN')
MAILGUN_FROM_EMAIL = os.getenv('MAILGUN_FROM_EMAIL', 'noreply@yourdomain.com')

def adjust_image(image, brightness=1.0, contrast=1.0, saturation=1.0):
    """Apply basic image adjustments."""
    if brightness != 1.0:
        image = ImageEnhance.Brightness(image).enhance(brightness)
    if contrast != 1.0:
        image = ImageEnhance.Contrast(image).enhance(contrast)
    if saturation != 1.0:
        image = ImageEnhance.Color(image).enhance(saturation)
    return image

# Health check endpoint
@app.route('/health')
@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "device": device,
        "torch_dtype": str(torch_dtype)
    }), 200

# Serve generated images
@app.route('/generated_images/<path:filename>')
@app.route('/api/generated_images/<path:filename>')
def serve_image(filename):
    """Serve generated images."""
    logger.info(f"Serving image: {filename}")
    return send_from_directory(GENERATED_IMAGES_DIR, filename)

# Generate image endpoint
@app.route('/generate', methods=['POST'])
@app.route('/api/generate', methods=['POST'])
def generate():
    """Handle image generation requests."""
    try:
        logger.info("Received generate request")
        logger.debug(f"Request Headers: {request.headers}")
        logger.debug(f"Files in request: {request.files}")
        logger.debug(f"Form data in request: {request.form}")

        if 'image' not in request.files:
            logger.error("No image file in request")
            return jsonify({"error": "No image file in request"}), 400

        # Generate a unique request ID
        request_id = str(uuid.uuid4())[:8]
        logger.info(f"Generated request_id: {request_id}")
        
        # Get the image file
        image_file = request.files['image']
        logger.info(f"Processing image file: {image_file.filename}")

        # Read and preprocess the image
        image = Image.open(image_file).convert('RGB')
        logger.info(f"Image loaded successfully: size={image.size}, mode={image.mode}")

        # Get generation parameters
        prompt = request.form.get('prompt', "A photo of a person")
        strength = float(request.form.get('strength', 0.75))
        guidance_scale = float(request.form.get('guidance_scale', 7.5))
        num_inference_steps = int(request.form.get('num_inference_steps', 50))

        logger.info(f"Starting image generation with prompt: {prompt}")

        # Generate the image
        output = pipe(
            prompt=prompt,
            image=image,
            strength=strength,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps
        ).images[0]

        logger.info("Image generation completed successfully")

        # Generate filename with request ID and save the image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f'generated_{request_id}_{timestamp}.png'
        output_path = os.path.join(GENERATED_IMAGES_DIR, filename)
        
        # Save the image
        output.save(output_path)
        logger.info(f"Saved generated image to {output_path}")

        # Track the generated image in CSV - with better error handling
        if not track_generated_image(filename, request_id):
            logger.warning("Failed to track image in CSV, but continuing with response")

        # Convert the image to base64 for immediate response
        buffered = io.BytesIO()
        output.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        response_data = {
            "success": True,
            "image": img_str,
            "filename": filename,
            "request_id": request_id
        }
        logger.info(f"Sending response with request_id: {request_id}")
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error generating image: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Status check endpoint
@app.route('/status/<request_id>', methods=['GET'])
@app.route('/api/status/<request_id>', methods=['GET'])
def check_status(request_id):
    """Check the status of an image generation request."""
    latest_image = get_latest_image_for_request(request_id)
    if latest_image:
        return jsonify({
            "status": "ready",
            "filename": latest_image['filename']
        })
    return jsonify({"status": "not_found"}), 404

# Email endpoint
@app.route('/sendEmail', methods=['POST'])
def send_email():
    try:
        logger.info(f"Received email request with form data: {request.form}")
        
        # Get data from form
        email = request.form.get('email')
        name = request.form.get('name', 'User')
        request_id = request.form.get('request_id')

        if not email or not request_id:
            logger.error("Missing required fields in request")
            return jsonify({"error": "Missing required fields"}), 400

        logger.info(f"Processing email request for {email} with request_id: {request_id}")

        # Get the latest image for this request_id from our tracking system
        latest_image = get_latest_image_for_request(request_id)
        if not latest_image:
            logger.error(f"No image found for request ID: {request_id}")
            return jsonify({"error": "Image not found"}), 404

        image_path = os.path.join(GENERATED_IMAGES_DIR, latest_image['filename'])
        if not os.path.exists(image_path):
            logger.error(f"Image file not found at path: {image_path}")
            return jsonify({"error": "Image file not found"}), 404

        # Read the image file
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Send email using Mailgun
        if not MAILGUN_API_KEY or not MAILGUN_DOMAIN:
            logger.error("Mailgun configuration missing")
            return jsonify({"error": "Email service not configured"}), 500

        logger.info(f"Sending email via Mailgun to {email}")
        response = requests.post(
            f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
            auth=("api", MAILGUN_API_KEY),
            files=[("attachment", ("transformed_image.png", image_data, "image/png"))],
            data={
                "from": f"Photo-Op <{MAILGUN_FROM_EMAIL}>",
                "to": [email],
                "subject": "Your Transformed Image",
                "text": f"Hello {name},\n\nHere's your transformed image from Photo-Op!\n\nBest regards,\nThe Photo-Op Team"
            }
        )
        
        logger.info(f"Mailgun API response: {response.status_code} - {response.text}")
        
        if response.status_code == 200:
            logger.info("Email sent successfully")
            return jsonify({"success": True, "message": "Email sent successfully"})
        else:
            logger.error(f"Mailgun API error: {response.text}")
            return jsonify({"error": "Failed to send email", "details": response.text}), 500

    except Exception as e:
        logger.error(f"Error in send_email: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/updateStatus', methods=['POST'])
def update_status():
    """Update the status of an image in the tracking CSV."""
    try:
        data = request.get_json()
        request_id = data.get('request_id')
        new_status = data.get('status')

        if not request_id or not new_status:
            return jsonify({"error": "Missing request_id or status"}), 400

        if update_image_status(request_id, new_status):
            return jsonify({"success": True, "message": "Status updated successfully"})
        else:
            return jsonify({"error": "Failed to update status"}), 500

    except Exception as e:
        logger.error(f"Error updating status: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)