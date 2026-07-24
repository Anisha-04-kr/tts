# PowerShell script to restart local backend server.

$PSScriptRootPath = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

Write-Host "Restarting Local AI Voice Assistant Backend..." -ForegroundColor Cyan
& (Join-Path -Path $PSScriptRootPath -ChildPath "stop_backend.ps1")

Start-Sleep -Seconds 2

& (Join-Path -Path $PSScriptRootPath -ChildPath "start_backend.ps1")
