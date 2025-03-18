# test_decode.py
import base64
from PIL import Image
import io

with open("C:\\Users\\krahn\\Pictures\\Projects\\photo-op-mvp\\ai_model\\base64test1.txt", "r") as f:
    base64_str = f.read().strip()

if not base64_str.startswith("data:image/png;base64,"):
    base64_str = "data:image/png;base64," + base64_str

# If you need the prefix, keep it out here:
# base64_data = "data:image/png;base64," + base64_data

header, encoded = base64_str.split(",", 1)
decoded = base64.b64decode(encoded)
img = Image.open(io.BytesIO(decoded)).convert("RGB")
img.show()  # Should open the image if it's valid
