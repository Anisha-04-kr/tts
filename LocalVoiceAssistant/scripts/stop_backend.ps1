# PowerShell script to stop local backend server process.

$Port = 8000
Write-Host "Stopping backend server process running on port $Port..." -ForegroundColor Yellow

$Connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($Connections) {
    foreach ($Conn in $Connections) {
        $PidToKill = $Conn.OwningProcess
        if ($PidToKill -gt 0) {
            Write-Host "Terminating backend process ID: $PidToKill..." -ForegroundColor Cyan
            Stop-Process -Id $PidToKill -Force -ErrorAction SilentlyContinue
        }
    }
    Write-Host "Backend server process stopped." -ForegroundColor Green
} else {
    Write-Host "No backend process found listening on port $Port." -ForegroundColor Green
}
