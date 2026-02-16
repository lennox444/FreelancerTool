@echo off
REM Freelancer Tool - Quick Setup Script (Windows)
REM This script will set up the entire application

echo.
echo ============================================
echo 🚀 Freelancer Tool - Quick Setup
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20+ first.
    pause
    exit /b 1
)

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

echo.
echo 📦 Step 1: Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo 📦 Step 2: Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo 🐳 Step 3: Starting PostgreSQL Database...
cd ..
docker-compose -f docker-compose.dev.yml up -d
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to start database
    pause
    exit /b 1
)

echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo.
echo 🗄️  Step 4: Running Database Migrations...
cd backend
call npx prisma migrate dev --name init
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Migration failed - database might already be set up
)

echo.
echo 🌱 Step 5: Seeding Demo Data...
call npm run prisma:seed
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Seeding failed - data might already exist
)

echo.
echo ============================================
echo ✅ Setup Complete!
echo ============================================
echo.
echo 🎉 You can now start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend ^&^& npm run start:dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend ^&^& npm run dev
echo.
echo 📊 Demo Account:
echo   Email:    demo@freelancer.com
echo   Password: demo123
echo.
echo 🌐 Access the app at: http://localhost:3000
echo 🔧 API Docs at: http://localhost:3001/api
echo.
pause
