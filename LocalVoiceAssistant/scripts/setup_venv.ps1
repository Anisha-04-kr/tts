# PowerShell script to create virtual environment and install backend dependencies locally on Windows.

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent
$VenvPath = Join-Path -Path $ProjectRoot -ChildPath ".venv"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Local AI Voice Assistant - Virtual Environment Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check Python 3.11+
Write-Host "[1/4] Checking local Python installation..." -ForegroundColor Yellow
$PythonVer = python --version
Write-Host "Found: $PythonVer" -ForegroundColor Green

# Create Virtual Environment inside project folder (.venv)
if (-not (Test-Path -Path $VenvPath)) {
    Write-Host "[2/4] Creating virtual environment at: $VenvPath..." -ForegroundColor Yellow
    python -m venv $VenvPath
    Write-Host "Virtual environment created successfully." -ForegroundColor Green
} else {
    Write-Host "[2/4] Virtual environment already exists at: $VenvPath" -ForegroundColor Green
}

# Activate Virtual Environment
$ActivateScript = Join-Path -Path $VenvPath -ChildPath "Scripts\Activate.ps1"
Write-Host "[3/4] Activating virtual environment..." -ForegroundColor Yellow
& $ActivateScript

# Upgrade pip and install requirements
Write-Host "[4/4] Installing backend dependencies from requirements.txt..." -ForegroundColor Yellow
$RequirementsPath = Join-Path -Path $ProjectRoot -ChildPath "backend\requirements.txt"
python -m pip install --upgrade pip
python -m pip install -r $RequirementsPath

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Setup Completed Successfully!" -ForegroundColor Green
Write-Host "To activate the environment in PowerShell, run:" -ForegroundColor Yellow
Write-Host "  .venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "To run the backend server, execute:" -ForegroundColor Yellow
Write-Host "  .\scripts\run_backend.ps1" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
