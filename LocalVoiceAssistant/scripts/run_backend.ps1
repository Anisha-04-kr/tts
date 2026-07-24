# PowerShell script to run the backend server locally on Windows.

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

$VenvPath = Join-Path -Path $ProjectRoot -ChildPath ".venv"
$ActivateScript = Join-Path -Path $VenvPath -ChildPath "Scripts\Activate.ps1"

if (Test-Path $ActivateScript) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & $ActivateScript
}

Write-Host "Starting Local AI Voice Assistant Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
$env:PYTHONPATH = $ProjectRoot
python -m backend.main
