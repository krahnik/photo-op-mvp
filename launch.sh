#!/bin/bash

# ANSI color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to check if a port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Function to kill process using a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        print_message "Killing process on port $port (PID: $pid)" "$YELLOW"
        kill -9 $pid
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_message "Docker is not running. Please start Docker first." "$RED"
        exit 1
    fi
}

# Function to stop and remove existing containers
cleanup_containers() {
    print_message "Cleaning up existing containers..." "$YELLOW"
    docker-compose down --remove-orphans
}

# Function to check if a service is healthy
check_service_health() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    print_message "Waiting for $service to be healthy..." "$BLUE"
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            print_message "$service is healthy!" "$GREEN"
            return 0
        fi
        print_message "Attempt $attempt/$max_attempts: Waiting for $service..." "$YELLOW"
        sleep 2
        attempt=$((attempt + 1))
    done
    print_message "$service failed to become healthy" "$RED"
    return 1
}

# Main script
print_message "Starting Photo Op MVP Launch Script" "$BLUE"
print_message "===================================" "$BLUE"

# Check Docker
check_docker

# Define ports to check and clean up
PORTS=(3000 5000 8000 27017)  # React, Node, Python, MongoDB ports

# Kill any existing processes on required ports
print_message "Checking for existing processes..." "$YELLOW"
for port in "${PORTS[@]}"; do
    if check_port $port; then
        kill_port $port
    fi
done

# Clean up existing containers
cleanup_containers

# Start services
print_message "Starting services..." "$BLUE"
docker-compose up -d

# Check each service
check_service_health "MongoDB" 27017 || exit 1
check_service_health "Node.js API" 5000 || exit 1
check_service_health "Python AI Service" 8000 || exit 1
check_service_health "React Frontend" 3000 || exit 1

# Print success message
print_message "All services are up and running!" "$GREEN"
print_message "Frontend: http://localhost:3000" "$BLUE"
print_message "API: http://localhost:5000" "$BLUE"
print_message "AI Service: http://localhost:8000" "$BLUE"

# Print container status
print_message "\nContainer Status:" "$BLUE"
docker-compose ps 