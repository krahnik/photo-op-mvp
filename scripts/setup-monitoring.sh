#!/bin/bash

# Create necessary directories
mkdir -p grafana/dashboards
mkdir -p grafana/provisioning/dashboards

# Copy dashboard configuration
cp grafana/dashboards/photo-op-dashboard.json grafana/dashboards/
cp grafana/provisioning/dashboards/photo-op-dashboard.json grafana/provisioning/dashboards/

# Set up environment variables
if [ ! -f .env ]; then
    echo "Creating .env file with default values..."
    cat > .env << EOL
GRAFANA_ADMIN_PASSWORD=admin
PROMETHEUS_USERNAME=admin
PROMETHEUS_PASSWORD=admin
EOL
fi

# Start the monitoring stack
echo "Starting monitoring stack..."
docker-compose up -d prometheus grafana

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "Monitoring stack is running!"
    echo "Grafana is available at http://localhost:3000"
    echo "Prometheus is available at http://localhost:9090"
    echo "Default credentials:"
    echo "  Grafana: admin/admin"
    echo "  Prometheus: admin/admin"
else
    echo "Error: Services failed to start"
    docker-compose logs
    exit 1
fi 