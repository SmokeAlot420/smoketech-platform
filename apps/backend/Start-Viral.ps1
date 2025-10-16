# Start-Viral.ps1
# Starts all services for the viral content generation system

param(
    [switch]$SkipLangfuse,
    [switch]$SkipTemporal,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 Starting Viral Content Generation System" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = New-Object System.Net.Sockets.TcpClient
    try {
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Start Langfuse (Docker containers)
if (-not $SkipLangfuse) {
    Write-Host "📊 Starting Langfuse monitoring..." -ForegroundColor Yellow

    # Check if Docker is running
    try {
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
            Write-Host "  Skipping Langfuse startup..." -ForegroundColor Yellow
        } else {
            # Check if Langfuse is already running
            if (Test-Port 3030) {
                Write-Host "  ✓ Langfuse already running on port 3030" -ForegroundColor Green
            } else {
                Write-Host "  Starting Langfuse containers..." -ForegroundColor Gray

                # Start containers in detached mode
                $langfuseProcess = Start-Process -FilePath "docker-compose" `
                    -ArgumentList "-f", "docker-compose.langfuse.yml", "up", "-d" `
                    -WorkingDirectory "E:\v2 repo\viral" `
                    -PassThru -WindowStyle Hidden

                # Wait for containers to start
                Start-Sleep -Seconds 5

                # Check if containers are running
                $runningContainers = docker ps --format "table {{.Names}}" | Select-String "langfuse"
                if ($runningContainers) {
                    Write-Host "  ✓ Langfuse containers started" -ForegroundColor Green
                    Write-Host "  📍 UI: http://localhost:3030" -ForegroundColor Cyan
                } else {
                    Write-Host "  ⚠ Langfuse may not have started properly" -ForegroundColor Yellow
                }
            }
        }
    } catch {
        Write-Host "  ❌ Docker is not installed or not accessible" -ForegroundColor Red
        Write-Host "  Skipping Langfuse startup..." -ForegroundColor Yellow
    }

    Write-Host ""
}

# Start Temporal
if (-not $SkipTemporal) {
    Write-Host "⚙️  Starting Temporal workflow engine..." -ForegroundColor Yellow

    # Check if Temporal is already running
    if (Test-Port 7233) {
        Write-Host "  ✓ Temporal already running on port 7233" -ForegroundColor Green
        Write-Host "  📍 UI: http://localhost:8233" -ForegroundColor Cyan
    } else {
        $temporalExe = "E:\v2 repo\viral\temporal.exe"

        if (Test-Path $temporalExe) {
            Write-Host "  Starting Temporal server..." -ForegroundColor Gray

            # Start Temporal in a new hidden window
            $temporalProcess = Start-Process -FilePath $temporalExe `
                -ArgumentList "server", "start-dev" `
                -WorkingDirectory "E:\v2 repo\viral" `
                -WindowStyle Hidden `
                -PassThru

            # Wait for Temporal to start
            $maxAttempts = 10
            $attempt = 0
            while ($attempt -lt $maxAttempts) {
                Start-Sleep -Seconds 2
                if (Test-Port 7233) {
                    Write-Host "  ✓ Temporal server started" -ForegroundColor Green
                    Write-Host "  📍 Server: localhost:7233" -ForegroundColor Cyan
                    Write-Host "  📍 UI: http://localhost:8233" -ForegroundColor Cyan
                    break
                }
                $attempt++
            }

            if ($attempt -eq $maxAttempts) {
                Write-Host "  ⚠ Temporal may not have started properly" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ❌ Temporal executable not found at: $temporalExe" -ForegroundColor Red
        }
    }

    Write-Host ""
}

# Summary
Write-Host "🎉 Viral Content System Status:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

if (Test-Port 3030) {
    Write-Host "✓ Langfuse:  http://localhost:3030" -ForegroundColor Green
} else {
    Write-Host "✗ Langfuse:  Not running" -ForegroundColor Red
}

if (Test-Port 8233) {
    Write-Host "✓ Temporal:  http://localhost:8233" -ForegroundColor Green
} else {
    Write-Host "✗ Temporal:  Not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "  • To start the worker: npm run worker" -ForegroundColor Gray
Write-Host "  • To start a workflow: npm run workflow" -ForegroundColor Gray
Write-Host "  • To stop services: viral stop" -ForegroundColor Gray
Write-Host "  • To check status: viral status" -ForegroundColor Gray
Write-Host ""