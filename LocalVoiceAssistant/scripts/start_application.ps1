# Master PowerShell script launching complete Local AI Voice Assistant stack.

$ErrorActionPreference = "Stop"

$PSScriptRootPath = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Local AI Voice Assistant - Master Startup Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Start Backend Server
Write-Host "[1/2] Launching Backend FastAPI Server..." -ForegroundColor Yellow
$BackendScript = Join-Path -Path $PSScriptRootPath -ChildPath "start_backend.ps1"
Start-Process powershell -ArgumentList "-NoExit -File `"$BackendScript`""

Start-Sleep -Seconds 3

# 2. Inform User regarding Frontend
Write-Host "[2/2] Backend started successfully on http://127.0.0.1:8000." -ForegroundColor Green
Write-Host "To launch Next.js Frontend UI, open terminal in 'frontend' folder and run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "Then open http://localhost:3000 in your browser." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
