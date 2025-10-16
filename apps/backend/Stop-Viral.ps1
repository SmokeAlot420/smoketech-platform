# Stop-Viral.ps1
# Stops all services for the viral content generation system

param(
    [switch]$Force,
    [switch]$KeepLangfuse,
    [switch]$KeepTemporal
)

Write-Host ""
Write-Host "🛑 Stopping Viral Content Generation System" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""

$stopped = $false

# Stop Temporal
if (-not $KeepTemporal) {
    Write-Host "⚙️  Stopping Temporal..." -ForegroundColor Cyan

    # Find and stop temporal.exe processes
    $temporalProcesses = Get-Process -Name "temporal" -ErrorAction SilentlyContinue

    if ($temporalProcesses) {
        foreach ($process in $temporalProcesses) {
            try {
                if ($Force) {
                    $process | Stop-Process -Force
                } else {
                    $process | Stop-Process
                }
                Write-Host "  ✓ Stopped Temporal process (PID: $($process.Id))" -ForegroundColor Green
                $stopped = $true
            } catch {
                Write-Host "  ⚠ Could not stop Temporal process (PID: $($process.Id))" -ForegroundColor Yellow
                Write-Host "    Error: $_" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  ℹ Temporal is not running" -ForegroundColor Gray
    }

    Write-Host ""
}

# Stop Langfuse Docker containers
if (-not $KeepLangfuse) {
    Write-Host "📊 Stopping Langfuse..." -ForegroundColor Cyan

    # Check if Docker is running
    try {
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            # Check if any Langfuse containers are running
            $langfuseContainers = docker ps --format "{{.Names}}" | Where-Object { $_ -match "langfuse" }

            if ($langfuseContainers) {
                Write-Host "  Stopping Langfuse containers..." -ForegroundColor Gray

                # Stop containers using docker-compose
                $stopProcess = Start-Process -FilePath "docker-compose" `
                    -ArgumentList "-f", "docker-compose.langfuse.yml", "down" `
                    -WorkingDirectory "E:\v2 repo\viral" `
                    -PassThru -Wait -WindowStyle Hidden

                if ($stopProcess.ExitCode -eq 0) {
                    Write-Host "  ✓ Stopped all Langfuse containers" -ForegroundColor Green
                    $stopped = $true
                } else {
                    Write-Host "  ⚠ Some containers may not have stopped properly" -ForegroundColor Yellow
                }
            } else {
                Write-Host "  ℹ No Langfuse containers are running" -ForegroundColor Gray
            }
        } else {
            Write-Host "  ℹ Docker is not running" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ℹ Docker is not accessible" -ForegroundColor Gray
    }

    Write-Host ""
}

# Kill any orphaned Node processes from workers (optional)
if ($Force) {
    Write-Host "🔧 Checking for orphaned worker processes..." -ForegroundColor Cyan

    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -match "worker" -or $_.CommandLine -match "worker"
    }

    if ($nodeProcesses) {
        Write-Host "  Found $($nodeProcesses.Count) worker process(es)" -ForegroundColor Yellow
        $response = Read-Host "  Kill worker processes? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            foreach ($process in $nodeProcesses) {
                try {
                    $process | Stop-Process -Force
                    Write-Host "  ✓ Stopped worker process (PID: $($process.Id))" -ForegroundColor Green
                    $stopped = $true
                } catch {
                    Write-Host "  ⚠ Could not stop worker process (PID: $($process.Id))" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "  ℹ No orphaned worker processes found" -ForegroundColor Gray
    }

    Write-Host ""
}

# Summary
if ($stopped) {
    Write-Host "✅ Services stopped successfully" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No services were running" -ForegroundColor Gray
}

Write-Host ""
Write-Host "💡 To restart services: viral" -ForegroundColor Cyan
Write-Host ""