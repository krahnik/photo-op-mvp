import requests
import os
from requests.exceptions import RequestException
import mimetypes
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_mime_type(file_path):
    mime_type, _ = mimetypes.guess_type(file_path)
    return mime_type or 'application/octet-stream'

def main():
    # URL of your Flask container endpoint
    url = "http://localhost:5002/generate"

    # Path to a valid image file (PNG, JPG, etc.) - ideally small (e.g., 512x512)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(script_dir, "data", "testimage1.png")
    
    if not os.path.exists(image_path):
        # Try the direct path if data directory doesn't exist
        image_path = os.path.join(script_dir, "testimage1.png")
        if not os.path.exists(image_path):
            logger.error(f"Error: Image file not found at {image_path}")
            return

    logger.info(f"Using image at path: {image_path}")

    # Prompt for the AI model
    prompt = "A futuristic portrait"

    try:
        # Open the image in binary mode and send as 'image'
        with open(image_path, "rb") as f:
            mime_type = get_mime_type(image_path)
            logger.info(f"Sending file: {image_path}")
            logger.info(f"MIME type: {mime_type}")
            
            # 'files' param sends multipart/form-data
            files = {
                "image": (os.path.basename(image_path), f, mime_type)
            }
            # 'data' param for simple form fields (prompt)
            data = {
                "prompt": prompt
            }

            logger.info("Sending request to server...")
            response = requests.post(url, files=files, data=data)
            
            # Print response details
            logger.info(f"Status Code: {response.status_code}")
            logger.debug(f"Response Headers: {response.headers}")
            
            try:
                json_response = response.json()
                logger.debug("JSON Response: %s", json_response)
                
                if "error" in json_response:
                    logger.error(f"Server Error: {json_response['error']}")
                elif "image_url" in json_response:
                    logger.info("Successfully received generated image data")
                    # Save the generated image
                    import base64
                    img_data = json_response['image_url'].split(',')[1]
                    img_bytes = base64.b64decode(img_data)
                    output_path = os.path.join(script_dir, "generated_image.png")
                    with open(output_path, 'wb') as f:
                        f.write(img_bytes)
                    logger.info(f"Generated image saved to: {output_path}")
            except ValueError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.error("Non-JSON Response: %s", response.text[:500])

    except RequestException as e:
        logger.error(f"Request failed: {str(e)}")
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)

if __name__ == "__main__":
    main()
