param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$gameUrl = 'http://127.0.0.1:4173/'
function Test-GameServer {
    try {
        $response = Invoke-WebRequest $gameUrl -TimeoutSec 2
        return $response.StatusCode -eq 200 -and $response.Content.Contains('js/app.js')
    } catch { return $false }
}
try {
    if (-not (Test-GameServer)) {
        $nodePath = (Get-Command node -ErrorAction Stop).Source
        $serverPath = Join-Path $PSScriptRoot 'tools/serve.cjs'
        $serverProcess = Start-Process -FilePath $nodePath -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru
        $ready = $false
        for ($attempt = 0; $attempt -lt 20; $attempt++) {
            if (Test-GameServer) { $ready = $true; break }
            if ($serverProcess.HasExited) { break }
            Start-Sleep -Milliseconds 250
        }
        if (-not $ready) { throw 'Game server could not start. Check whether port 4173 is used by another application.' }
    }
    Write-Host "Game ready: $gameUrl"
    if (-not $NoBrowser) { Start-Process $gameUrl }
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    if (-not $NoBrowser) { Read-Host 'Press Enter to close' }
    exit 1
}
