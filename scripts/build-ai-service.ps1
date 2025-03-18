# Function to check if a command exists
function Test-Command($CommandName) {
    return $null -ne (Get-Command $CommandName -ErrorAction SilentlyContinue)
}

# Function to write colored status messages
function Write-Status($Message, $Color = "White") {
    Write-Host $Message -ForegroundColor $Color
}

# Set error action preference
$ErrorActionPreference = "Stop"

try {
    Write-Status "Building AI Service Docker Image..." "Cyan"
    Write-Status "Performing pre-flight checks..." "Yellow"

    # Check if running as administrator
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Status "Warning: Script is not running as Administrator. Some operations might fail." "Yellow"
    }

    # Check if Docker is installed and running
    if (-not (Test-Command "docker")) {
        throw "Docker is not installed or not in PATH"
    }

    try {
        $null = docker info
    }
    catch {
        throw "Docker is not running or is not accessible"
    }

    # Check if we're in the right directory
    if (-not (Test-Path "ai_model\Dockerfile")) {
        throw "Dockerfile not found in ai_model directory. Please run this script from the project root directory."
    }

    # Create necessary directories
    Write-Status "Creating necessary directories..." "Gray"
    New-Item -ItemType Directory -Force -Path "ai_model\generated_images" | Out-Null

    # Check for required files
    $requiredFiles = @("requirements.txt", "app.py")
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path "ai_model\$file")) {
            throw "$file not found in ai_model directory"
        }
    }

    # Build the Docker image
    Write-Status "`nBuilding AI service Docker image..." "Green"
    Write-Status "This may take several minutes..." "Yellow"
    Write-Status "Build started at: $(Get-Date)`n" "Gray"

    docker build -t stable-diffusion-ai ./ai_model

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build AI service Docker image"
    }

    # Verify the image was created
    $imageExists = docker images stable-diffusion-ai --format "{{.Repository}}"
    if (-not $imageExists) {
        throw "Image verification failed"
    }

    # Get image details
    $imageInfo = docker images stable-diffusion-ai --format "{{.Size}},{{.CreatedAt}}"
    $imageSize, $createdAt = $imageInfo.Split(',')

    Write-Status "`nAI service Docker image built successfully!" "Green"
    Write-Status "Image name: stable-diffusion-ai" "White"
    Write-Status "Size: $imageSize" "White"
    Write-Status "Created: $createdAt" "White"
    Write-Status "`nYou can now run the full application using start-all.bat" "Cyan"
}
catch {
    Write-Status "`nError: $_" "Red"
    Write-Status "Build failed. Please check the error messages above." "Red"
    exit 1
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 