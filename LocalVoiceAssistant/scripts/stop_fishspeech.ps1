# PowerShell script to stop local vLLM-Omni Fish Speech server process.

$Port = 8002

Write-Host "Stopping local vLLM-Omni Fish Speech server process running on port $Port..." -ForegroundColor Yellow

$Connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($Connections) {
    foreach ($Conn in $Connections) {
        $PidToKill = $Conn.OwningProcess
        if ($PidToKill -gt 0) {
            Write-Host "Terminating process ID: $PidToKill listening on port $Port..." -ForegroundColor Cyan
            Stop-Process -Id $PidToKill -Force -ErrorAction SilentlyContinue
        }
    }
    Write-Host "Fish Speech vLLM-Omni server process stopped." -ForegroundColor Green
} else {
    Write-Host "No process found listening on port $Port." -ForegroundColor Green
}
