@echo off
echo Building AI Service Docker Image...

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

:: Check if we're in the right directory
if not exist ai_model\Dockerfile (
    echo Error: Dockerfile not found in ai_model directory.
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Create necessary directories if they don't exist
echo Creating necessary directories...
mkdir ai_model\generated_images 2>nul

:: Check for required files
if not exist ai_model\requirements.txt (
    echo Error: requirements.txt not found in ai_model directory.
    pause
    exit /b 1
)

if not exist ai_model\app.py (
    echo Error: app.py not found in ai_model directory.
    pause
    exit /b 1
)

:: Build the Docker image
echo.
echo Building AI service Docker image...
echo This may take several minutes...
echo.

docker build -t stable-diffusion-ai ./ai_model

if %errorlevel% neq 0 (
    echo.
    echo Error: Failed to build AI service Docker image.
    echo Please check the error messages above.
    pause
    exit /b 1
)

:: Verify the image was created
docker images | findstr "stable-diffusion-ai" >nul
if %errorlevel% neq 0 (
    echo.
    echo Error: Image verification failed.
    pause
    exit /b 1
)

echo.
echo AI service Docker image built successfully!
echo Image name: stable-diffusion-ai
echo.
echo You can now run the full application using start-all.bat
pause 