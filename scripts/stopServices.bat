@echo off
echo Stopping Photo-Op Services...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js and try again.
    pause
    exit /b 1
)

:: Run the Node.js script to stop services
node "%~dp0stopServices.js"
if %errorlevel% neq 0 (
    echo Error: Failed to stop some services. Please check the logs above.
    pause
    exit /b 1
)

echo.
echo All services have been stopped successfully.
echo You can now close this window.
pause 