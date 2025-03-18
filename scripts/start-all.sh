#!/bin/bash

echo "Starting Photo Op MVP Services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p grafana/dashboards
mkdir -p grafana/provisioning/dashboards

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
EOL
fi

# Start all services
echo "Starting all services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 15

# Check if services are running
echo "Checking service status..."
if docker-compose ps | grep -q "Up"; then
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
    exit 1
fi 