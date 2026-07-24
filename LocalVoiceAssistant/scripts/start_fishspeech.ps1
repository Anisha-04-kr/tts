# PowerShell script to start local vLLM-Omni serving Fish Speech S2 Pro.

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

$ModelPath = Join-Path -Path $ProjectRoot -ChildPath "models\fishspeech\fish-speech-s2-pro"
$Port = 8002

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Starting Fish Speech S2 Pro via vLLM-Omni on Port $Port..." -ForegroundColor Cyan
Write-Host "Model Directory: $ModelPath" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# Check if model path exists
if (-not (Test-Path $ModelPath)) {
    Write-Host "[WARNING] Model path does not exist at: $ModelPath" -ForegroundColor Yellow
    Write-Host "Please place your Fish Speech S2 Pro model weights inside $ModelPath before running inference." -ForegroundColor Yellow
}

# Command to launch vLLM-Omni server process locally on port 8002
$Cmd = "vllm-omni serve '$ModelPath' --port $Port --host 127.0.0.1"
Write-Host "Executing command: $Cmd" -ForegroundColor Green

# Launch as background process or foreground depending on user preference
Invoke-Expression $Cmd
