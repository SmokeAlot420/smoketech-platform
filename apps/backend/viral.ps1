# viral.ps1
# Main entry point for managing the viral content generation system

param(
    [string]$Command = "start",
    [switch]$Help
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

function Show-Help {
    Write-Host ""
    Write-Host "Viral Content Generation System Manager" -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: viral [command] [options]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Green
    Write-Host "  start       Start all services (default)" -ForegroundColor White
    Write-Host "  stop        Stop all services" -ForegroundColor White
    Write-Host "  restart     Restart all services" -ForegroundColor White
    Write-Host "  status      Check service status" -ForegroundColor White
    Write-Host "  logs        View service logs" -ForegroundColor White
    Write-Host "  worker      Start the Temporal worker" -ForegroundColor White
    Write-Host "  workflow    Start a new workflow" -ForegroundColor White
    Write-Host "  help        Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  viral                    # Start all services" -ForegroundColor Gray
    Write-Host "  viral stop               # Stop all services" -ForegroundColor Gray
    Write-Host "  viral status             # Check if services are running" -ForegroundColor Gray
    Write-Host "  viral logs langfuse      # View Langfuse logs" -ForegroundColor Gray
    Write-Host ""
}

if ($Help) {
    Show-Help
    exit 0
}

switch ($Command.ToLower()) {
    "start" {
        & "$scriptPath\Start-Viral.ps1"
    }

    "stop" {
        & "$scriptPath\Stop-Viral.ps1"
    }

    "restart" {
        Write-Host "Restarting services..." -ForegroundColor Yellow
        & "$scriptPath\Stop-Viral.ps1"
        Start-Sleep -Seconds 2
        & "$scriptPath\Start-Viral.ps1"
    }

    "status" {
        Write-Host ""
        Write-Host "Service Status Check" -ForegroundColor Cyan
        Write-Host "====================" -ForegroundColor Cyan
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

        # Check Temporal
        if (Test-Port 7233) {
            Write-Host "Temporal Server:  RUNNING (localhost:7233)" -ForegroundColor Green
            if (Test-Port 8233) {
                Write-Host "Temporal UI:      http://localhost:8233" -ForegroundColor Green
            }
        } else {
            Write-Host "Temporal:         NOT RUNNING" -ForegroundColor Red
        }

        # Check Langfuse
        if (Test-Port 3030) {
            Write-Host "Langfuse:         http://localhost:3030" -ForegroundColor Green
        } else {
            Write-Host "Langfuse:         NOT RUNNING" -ForegroundColor Red
        }

        # Check Docker containers if Docker is available
        try {
            docker info 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "Docker Containers:" -ForegroundColor Yellow
                $containers = docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "langfuse"
                if ($containers) {
                    foreach ($container in $containers) {
                        Write-Host "  $container" -ForegroundColor Gray
                    }
                } else {
                    Write-Host "  No Langfuse containers running" -ForegroundColor Gray
                }
            }
        } catch {
            # Docker not available
        }

        # Check for running processes
        Write-Host ""
        Write-Host "Processes:" -ForegroundColor Yellow
        $temporal = Get-Process -Name "temporal" -ErrorAction SilentlyContinue
        if ($temporal) {
            Write-Host "  temporal.exe (PID: $($temporal.Id))" -ForegroundColor Green
        } else {
            Write-Host "  temporal.exe not running" -ForegroundColor Gray
        }

        Write-Host ""
    }

    "logs" {
        $service = $args[0]
        if (-not $service) {
            Write-Host "Specify a service: viral logs [langfuse|temporal]" -ForegroundColor Yellow
        } elseif ($service -eq "langfuse") {
            docker-compose -f "$scriptPath\docker-compose.langfuse.yml" logs -f --tail=50
        } elseif ($service -eq "temporal") {
            Write-Host "Temporal logs are shown in the console where it is running" -ForegroundColor Yellow
        } else {
            Write-Host "Unknown service: $service" -ForegroundColor Red
        }
    }

    "worker" {
        Write-Host "Starting Temporal worker..." -ForegroundColor Cyan
        Set-Location $scriptPath
        npm run worker
    }

    "workflow" {
        Write-Host "Starting new workflow..." -ForegroundColor Cyan
        Set-Location $scriptPath
        npm run workflow
    }

    "help" {
        Show-Help
    }

    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Use viral help for available commands" -ForegroundColor Yellow
    }
}