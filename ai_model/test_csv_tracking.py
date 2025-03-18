import requests
import json
import time
from datetime import datetime
import csv

def test_image_tracking():
    # Test data
    test_image_path = "test_image.jpg"  # Make sure this exists
    test_email = "test@example.com"
    test_name = "Test User"

    # Step 1: Generate an image
    print("Testing image generation and tracking...")
    
    # Prepare the request
    files = {
        'image': ('test_image.jpg', open(test_image_path, 'rb'), 'image/jpeg')
    }
    data = {
        'prompt': 'A test image transformation',
        'strength': '0.75',
        'guidance_scale': '7.5',
        'num_inference_steps': '50'
    }

    # Send request to generate image
    response = requests.post('http://localhost:5002/generate', files=files, data=data)
    
    if response.status_code != 200:
        print(f"Error generating image: {response.text}")
        return

    response_data = response.json()
    request_id = response_data.get('request_id')
    filename = response_data.get('filename')

    print(f"Image generated successfully:")
    print(f"Request ID: {request_id}")
    print(f"Filename: {filename}")

    # Step 2: Update status to emailed
    print("\nTesting status update...")
    
    status_data = {
        'request_id': request_id,
        'status': 'emailed'
    }

    status_response = requests.post(
        'http://localhost:5002/updateStatus',
        json=status_data
    )

    if status_response.status_code != 200:
        print(f"Error updating status: {status_response.text}")
        return

    print("Status updated successfully")

    # Step 3: Verify CSV contents
    print("\nVerifying CSV contents...")
    try:
        with open('image_tracking.csv', 'r') as f:
            reader = csv.reader(f)
            rows = list(reader)
            
            # Skip header row
            for row in rows[1:]:
                if row[2] == request_id:  # Check request_id column
                    print(f"Found matching entry in CSV:")
                    print(f"Timestamp: {row[0]}")
                    print(f"Filename: {row[1]}")
                    print(f"Request ID: {row[2]}")
                    print(f"Status: {row[3]}")
                    return
                    
        print("No matching entry found in CSV")
    except Exception as e:
        print(f"Error reading CSV: {str(e)}")

if __name__ == "__main__":
    test_image_tracking() 