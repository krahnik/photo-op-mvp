@echo off
echo Starting Photo Op MVP Services...

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js and try again.
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install npm and try again.
    exit /b 1
)

:: Create necessary directories
echo Creating necessary directories...
mkdir grafana\dashboards 2>nul
mkdir grafana\provisioning\dashboards 2>nul
mkdir server\logs 2>nul
mkdir server\uploads 2>nul
mkdir server\data 2>nul

:: Copy dashboard configuration
echo Setting up monitoring dashboards...
copy grafana\dashboards\photo-op-dashboard.json grafana\dashboards\ >nul 2>&1
copy grafana\provisioning\dashboards\photo-op-dashboard.json grafana\provisioning\dashboards\ >nul 2>&1

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
        echo AI_SERVICE_URL=http://localhost:5002
        echo PORT=5000
    ) > .env
)

:: Install server dependencies if needed
if not exist server\node_modules (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

:: Start all services
echo Starting all services...

:: Start Docker services
docker-compose up -d

:: Wait for Docker services to be ready
echo Waiting for Docker services to be ready...
timeout /t 15 /nobreak >nul

:: Start Node.js server
echo Starting Node.js server...
cd server
start /B cmd /C "npm start > logs\server.log 2>&1"
cd ..

:: Wait for server to start
timeout /t 5 /nobreak >nul

:: Check if services are running
echo Checking service status...
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    :: Check if Node.js server is running
    tasklist | findstr "node.exe" >nul
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
        echo.
        echo Server logs can be found in server\logs\server.log
        echo.
        echo Press Ctrl+C to stop all services...
    ) else (
        echo Error: Node.js server failed to start
        type server\logs\server.log
        exit /b 1
    )
) else (
    echo Error: Some Docker services failed to start
    docker-compose logs
    exit /b 1
)

:: Keep the script running
:loop
timeout /t 1 /nobreak >nul
goto loop

:: This label is called when Ctrl+C is pressed
:cleanup
echo.
echo Stopping all services...
taskkill /F /IM node.exe >nul 2>&1
docker-compose down
exit /b 0 