@echo off
setlocal enabledelayedexpansion

:: ANSI color codes for output
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

:: Function to print colored messages
:print_message
echo %~1
exit /b

:: Function to check if a port is in use
:check_port
netstat -ano | find ":%1" > nul
if %errorlevel% equ 0 (
    exit /b 0
) else (
    exit /b 1
)

:: Function to kill process using a port
:kill_port
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%1"') do (
    taskkill /F /PID %%a > nul 2>&1
    echo Killing process on port %1 (PID: %%a)
)
exit /b

:: Function to check if Docker is running
:check_docker
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker first.
    exit /b 1
)
exit /b 0

:: Function to stop and remove existing containers
:cleanup_containers
echo Cleaning up existing containers...
docker-compose down --remove-orphans
exit /b

:: Function to check if a service is healthy
:check_service_health
set service=%~1
set port=%~2
set max_attempts=30
set attempt=1

echo Waiting for %service% to be healthy...
:health_loop
call :check_port %port%
if %errorlevel% equ 0 (
    echo %service% is healthy!
    exit /b 0
)
echo Attempt %attempt%/%max_attempts%: Waiting for %service%...
timeout /t 2 /nobreak > nul
set /a attempt+=1
if %attempt% leq %max_attempts% goto health_loop
echo %service% failed to become healthy
exit /b 1

:: Main script
echo Starting Photo Op MVP Launch Script
echo ===================================

:: Check Docker
call :check_docker
if %errorlevel% neq 0 exit /b 1

:: Define ports to check and clean up
set PORTS=3000 5000 8000 27017

:: Kill any existing processes on required ports
echo Checking for existing processes...
for %%p in (%PORTS%) do (
    call :check_port %%p
    if %errorlevel% equ 0 (
        call :kill_port %%p
    )
)

:: Clean up existing containers
call :cleanup_containers

:: Start services
echo Starting services...
docker-compose up -d

:: Check each service
call :check_service_health "MongoDB" 27017
if %errorlevel% neq 0 exit /b 1

call :check_service_health "Node.js API" 5000
if %errorlevel% neq 0 exit /b 1

call :check_service_health "Python AI Service" 8000
if %errorlevel% neq 0 exit /b 1

call :check_service_health "React Frontend" 3000
if %errorlevel% neq 0 exit /b 1

:: Print success message
echo All services are up and running!
echo Frontend: http://localhost:3000
echo API: http://localhost:5000
echo AI Service: http://localhost:8000

:: Print container status
echo.
echo Container Status:
docker-compose ps 