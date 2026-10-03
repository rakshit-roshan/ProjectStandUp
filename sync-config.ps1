param (
    [string]$ConfigPath = "$PSScriptRoot\config.ini",
    [string]$OutputPath = "$PSScriptRoot\frontend\public\config.json"
)

if (Test-Path $ConfigPath) {
    $ini = @{}
    Get-Content -Path $ConfigPath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and -not $line.StartsWith(";") -and -not $line.StartsWith("[")) {
            $parts = $line.Split("=", 2)
            if ($parts.Length -eq 2) {
                $key = $parts[0].Trim()
                $val = $parts[1].Trim()
                $ini[$key] = $val
            }
        }
    }

    $jsonObj = [PSCustomObject]@{
        appName = if ($ini["app_name"]) { $ini["app_name"] } else { "StandupFlow" }
        serverPort = if ($ini["server_port"]) { [int]$ini["server_port"] } else { 8080 }
        apiBaseUrl = if ($ini["api_base_url"]) { $ini["api_base_url"] } else { "http://localhost:8080/api/v1" }
        frontendPort = if ($ini["frontend_port"]) { [int]$ini["frontend_port"] } else { 3000 }
        dbHost = if ($ini["db_host"]) { $ini["db_host"] } else { "localhost" }
        dbPort = if ($ini["db_port"]) { [int]$ini["db_port"] } else { 3306 }
        dbName = if ($ini["db_name"]) { $ini["db_name"] } else { "standupflow_db" }
    }

    $jsonObj | ConvertTo-Json | Set-Content -Path $OutputPath -Encoding UTF8
    Write-Host "[sync-config] Synchronized config.ini -> frontend/public/config.json" -ForegroundColor Green
} else {
    Write-Host "[sync-config] Warning: config.ini not found at $ConfigPath" -ForegroundColor Yellow
}
