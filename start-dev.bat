@echo off
REM Freelancer Tool - Development Start Script (Windows)
REM Starts both Backend and Frontend

echo.
echo ============================================
echo 🚀 Starting Freelancer Tool...
echo ============================================
echo.

REM Check if database is running
docker ps | findstr "freelancer-postgres-dev" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 🐳 Starting PostgreSQL...
    docker-compose -f docker-compose.dev.yml up -d
    echo ⏳ Waiting for database...
    timeout /t 3 /nobreak >nul
)

echo 🔧 Starting Backend and Frontend...
echo.
echo Opening Backend in new window...
start "Freelancer Backend" cmd /k "cd backend && npm run start:dev"

timeout /t 2 /nobreak >nul

echo Opening Frontend in new window...
start "Freelancer Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo ✅ Services starting in separate windows
echo ============================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001/api
echo.
echo Close the windows to stop the services
echo.
pause
