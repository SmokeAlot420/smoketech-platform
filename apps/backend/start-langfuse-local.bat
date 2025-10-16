@echo off
REM START LOCAL LANGFUSE - Self-hosted monitoring for Windows

echo.
echo 🚀 Starting Local Langfuse...
echo ================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Start Langfuse services
echo 📦 Starting Langfuse containers...
docker-compose -f docker-compose.langfuse.yml up -d

REM Wait for services to be ready
echo.
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose -f docker-compose.langfuse.yml ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo.
    echo ✅ Langfuse is running!
    echo.
    echo 🌐 Access Langfuse UI at: http://localhost:3030
    echo.
    echo 📝 First Time Setup:
    echo 1. Go to http://localhost:3030
    echo 2. Create your account - it's local, so use any email
    echo 3. Create a new project called "QuoteMoto Viral"
    echo 4. Get your API keys from Settings -^> API Keys
    echo 5. Add them to your .env file:
    echo    LANGFUSE_PUBLIC_KEY=your_public_key
    echo    LANGFUSE_SECRET_KEY=your_secret_key
    echo    LANGFUSE_URL=http://localhost:3030
    echo.
    echo 💡 To stop Langfuse: docker-compose -f docker-compose.langfuse.yml down
    echo 💡 To view logs: docker-compose -f docker-compose.langfuse.yml logs -f
    echo.
    echo Press any key to continue...
    pause >nul
) else (
    echo ❌ Failed to start Langfuse. Check Docker logs.
    docker-compose -f docker-compose.langfuse.yml logs
    pause
)