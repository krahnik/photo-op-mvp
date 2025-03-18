#!/bin/bash

echo "Starting Photo Op MVP Services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node > /dev/null 2>&1; then
    echo "Error: Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm > /dev/null 2>&1; then
    echo "Error: npm is not installed. Please install npm and try again."
    exit 1
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p grafana/dashboards
mkdir -p grafana/provisioning/dashboards
mkdir -p server/data
mkdir -p server/logs
mkdir -p server/uploads

# Copy dashboard configuration
echo "Setting up monitoring dashboards..."
cp grafana/dashboards/photo-op-dashboard.json grafana/dashboards/
cp grafana/provisioning/dashboards/photo-op-dashboard.json grafana/provisioning/dashboards/

# Set up environment variables if not exists
if [ ! -f .env ]; then
    echo "Creating .env file with default values..."
    cat > .env << EOL
GRAFANA_ADMIN_PASSWORD=admin
PROMETHEUS_USERNAME=admin
PROMETHEUS_PASSWORD=admin
MONGODB_URI=mongodb://mongodb:27017
DATABASE_NAME=photo_op
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-secret-key
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
AI_SERVICE_URL=http://localhost:5002
PORT=5000
EOL
fi

# Install dependencies if node_modules doesn't exist
echo "Checking and installing dependencies..."
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install
    cd ..
fi

# Start all services
echo "Starting all services..."

# Start Docker services
docker-compose up -d

# Wait for Docker services to be ready
echo "Waiting for Docker services to be ready..."
sleep 15

# Start Node.js server
echo "Starting Node.js server..."
cd server && npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if services are running
echo "Checking service status..."
if docker-compose ps | grep -q "Up" && kill -0 $SERVER_PID 2>/dev/null; then
    echo
    echo "All services are running successfully!"
    echo
    echo "Service URLs:"
    echo "  Main Application: http://localhost:3000"
    echo "  API Server: http://localhost:5000"
    echo "  AI Service: http://localhost:5002"
    echo "  Database Service: http://localhost:5003"
    echo "  Grafana Dashboard: http://localhost:3000"
    echo "  Prometheus: http://localhost:9090"
    echo
    echo "Default credentials:"
    echo "  Grafana: admin/admin"
    echo "  Prometheus: admin/admin"
    echo
    echo "Note: Please update the .env file with your actual credentials and API keys."
else
    echo "Error: Some services failed to start"
    docker-compose logs
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "Node.js server failed to start"
    fi
    exit 1
fi

# Trap SIGINT and SIGTERM signals and clean up
trap 'kill $SERVER_PID 2>/dev/null; docker-compose down; exit 0' SIGINT SIGTERM

# Keep script running
wait 