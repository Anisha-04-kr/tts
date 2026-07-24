# PowerShell diagnostic script verifying local project setup and environment.

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Local AI Voice Assistant - Environment Diagnostic" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Check Python
$PyVer = python --version
Write-Host "[✓] Python Installation: $PyVer" -ForegroundColor Green

# 2. Check Virtual Environment
$VenvPath = Join-Path -Path $ProjectRoot -ChildPath ".venv"
if (Test-Path $VenvPath) {
    Write-Host "[✓] Virtual Environment (.venv): Found at $VenvPath" -ForegroundColor Green
} else {
    Write-Host "[!] Virtual Environment (.venv): Missing. Run .\scripts\setup_venv.ps1" -ForegroundColor Red
}

# 3. Check Folders
$Folders = @(
    "backend", "frontend", "models\whisper", "models\fishspeech", "models\llm",
    "models\voices", "models\cache", "models\downloads", "models\embeddings",
    "scripts", "logs", "temp", "config"
)

foreach ($F in $Folders) {
    $FullPath = Join-Path -Path $ProjectRoot -ChildPath $F
    if (Test-Path $FullPath) {
        Write-Host "[✓] Directory '$F': Verified" -ForegroundColor Green
    } else {
        Write-Host "[!] Directory '$F': Missing" -ForegroundColor Yellow
    }
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Diagnostic Check Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
