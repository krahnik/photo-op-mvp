@echo off

:: Create necessary directories
mkdir grafana\dashboards 2>nul
mkdir grafana\provisioning\dashboards 2>nul

:: Copy dashboard configuration
copy grafana\dashboards\photo-op-dashboard.json grafana\dashboards\
copy grafana\provisioning\dashboards\photo-op-dashboard.json grafana\provisioning\dashboards\

:: Set up environment variables
if not exist .env (
    echo Creating .env file with default values...
    (
        echo GRAFANA_ADMIN_PASSWORD=admin
        echo PROMETHEUS_USERNAME=admin
        echo PROMETHEUS_PASSWORD=admin
    ) > .env
)

:: Start the monitoring stack
echo Starting monitoring stack...
docker-compose up -d prometheus grafana

:: Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak

:: Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo Monitoring stack is running!
    echo Grafana is available at http://localhost:3000
    echo Prometheus is available at http://localhost:9090
    echo Default credentials:
    echo   Grafana: admin/admin
    echo   Prometheus: admin/admin
) else (
    echo Error: Services failed to start
    docker-compose logs
    exit /b 1
) 