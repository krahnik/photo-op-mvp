# ai/app.py
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate():
    # Simulate processing delay
    import time
    time.sleep(2)  # 2 seconds delay to simulate processing
    # Return a placeholder image URL (you can replace this later)
    return jsonify({"image_url": "https://placekitten.com/512/512"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
