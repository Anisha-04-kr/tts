# PowerShell script to restart local vLLM-Omni Fish Speech server.

$PSScriptRootPath = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

Write-Host "Restarting local vLLM-Omni Fish Speech server..." -ForegroundColor Cyan

# Stop existing process
& (Join-Path -Path $PSScriptRootPath -ChildPath "stop_fishspeech.ps1")

Start-Sleep -Seconds 2

# Start server process
& (Join-Path -Path $PSScriptRootPath -ChildPath "start_fishspeech.ps1")
