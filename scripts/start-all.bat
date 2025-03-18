@echo off
echo Starting Photo Op MVP Services...

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

:: Create necessary directories
echo Creating necessary directories...
mkdir grafana\dashboards 2>nul
mkdir grafana\provisioning\dashboards 2>nul

:: Copy dashboard configuration
echo Setting up monitoring dashboards...
copy grafana\dashboards\photo-op-dashboard.json grafana\dashboards\
copy grafana\provisioning\dashboards\photo-op-dashboard.json grafana\provisioning\dashboards\

:: Set up environment variables if not exists
if not exist .env (
    echo Creating .env file with default values...
    (
        echo GRAFANA_ADMIN_PASSWORD=admin
        echo PROMETHEUS_USERNAME=admin
        echo PROMETHEUS_PASSWORD=admin
        echo MONGODB_URI=mongodb://mongodb:27017
        echo DATABASE_NAME=photo_op
        echo CLIENT_URL=http://localhost:3000
        echo JWT_SECRET=your-secret-key
        echo MAILGUN_API_KEY=your-mailgun-api-key
        echo MAILGUN_DOMAIN=your-mailgun-domain
    ) > .env
)

:: Start all services
echo Starting all services...
docker-compose up -d

:: Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 15 /nobreak

:: Check if services are running
echo Checking service status...
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo.
    echo All services are running successfully!
    echo.
    echo Service URLs:
    echo   Main Application: http://localhost:3000
    echo   API Server: http://localhost:5000
    echo   AI Service: http://localhost:5002
    echo   Database Service: http://localhost:5003
    echo   Grafana Dashboard: http://localhost:3000
    echo   Prometheus: http://localhost:9090
    echo.
    echo Default credentials:
    echo   Grafana: admin/admin
    echo   Prometheus: admin/admin
    echo.
    echo Note: Please update the .env file with your actual credentials and API keys.
) else (
    echo Error: Some services failed to start
    docker-compose logs
    exit /b 1
) 