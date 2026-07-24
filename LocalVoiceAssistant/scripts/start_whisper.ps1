# PowerShell script to start local Whisper Large V3 server.

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

$ModelPath = Join-Path -Path $ProjectRoot -ChildPath "models\whisper\whisper-large-v3"
$Port = 8001

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Starting Whisper Large V3 ASR Server on Port $Port..." -ForegroundColor Cyan
Write-Host "Model Directory: $ModelPath" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

if (-not (Test-Path $ModelPath)) {
    Write-Host "[WARNING] Whisper model directory does not exist: $ModelPath" -ForegroundColor Yellow
    Write-Host "Please place your Whisper Large V3 model weights inside $ModelPath" -ForegroundColor Yellow
}

$Cmd = "python -m whisper_server --model '$ModelPath' --port $Port --host 127.0.0.1"
Write-Host "Executing command: $Cmd" -ForegroundColor Green
Invoke-Expression $Cmd
