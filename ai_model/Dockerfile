# ai_model/Dockerfile
FROM nvidia/cuda:12.4.0-runtime-ubuntu22.04

# Install Python and required system packages
RUN apt-get update && apt-get install -y \
    python3.9 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

# Create data directory and copy test image
RUN mkdir -p /app/data
COPY testimage1.png /app/data/

# Copy the application code
COPY app.py .

# Create cache directory with correct permissions
RUN mkdir -p /root/.cache/huggingface && chmod -R 777 /root/.cache/huggingface

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

CMD ["python3", "app.py"]
