# test_ai_container.py
import requests
import json

def main():
    # 1) Read the base64 from file
    with open("C:\\Users\\krahn\\Pictures\\Projects\\photo-op-mvp\\ai_model\\base64test1.txt", "r") as f:
        base64_str = f.read()

    # 2) Clean up newlines
    base64_str = base64_str.replace("\n", "").replace("\r", "")

    # 3) Ensure prefix is present
    if not base64_str.startswith("data:image/png;base64,"):
        base64_str = "data:image/png;base64," + base64_str
        print(base64_str[:100])

    # 4) Build the JSON payload
    payload = {
        "prompt": "A futuristic portrait",
        "photo": base64_str
    }

    # 5) Send the request to your container
    # Assuming your container is mapped to host port 5002
    url = "http://localhost:5002/generate"
    response = requests.post(url, json=payload)
    
    # 6) Check response
    if response.status_code == 200:
        data = response.json()
        print("Success! Got a transformed image in base64:")
        print(data["image_url"][:100] + "...")  # Just print first 100 chars
    else:
        print(f"Request failed with status code {response.status_code}")
        print("Response text:", response.text)

if __name__ == "__main__":
    main()
