@echo off
title FreelanceFlow - Dev Start
cd /d "%~dp0"

echo.
echo  ==========================================
echo   FreelanceFlow - Starte Entwicklungsumgebung
echo  ==========================================
echo.

REM --- Datenbank starten (falls nicht laeuft) ---
docker ps | findstr "freelancer-postgres-dev" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [1/3] Starte PostgreSQL (Docker)...
    docker-compose -f docker-compose.dev.yml up -d
    echo  [1/3] Warte auf Datenbank...
    timeout /t 4 /nobreak >nul
) else (
    echo  [1/3] PostgreSQL laeuft bereits.
)

REM --- Backend starten ---
echo  [2/3] Starte Backend (Port 3001)...
start "FreelanceFlow Backend" cmd /k "cd /d "%~dp0backend" && npm run start:dev"
timeout /t 2 /nobreak >nul

REM --- Frontend starten ---
echo  [3/3] Starte Frontend (Port 3000)...
start "FreelanceFlow Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  ==========================================
echo   Alles gestartet!
echo  ==========================================
echo.
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:3001/api
echo.
echo  Browser oeffnet sich in 8 Sekunden...
echo.
timeout /t 8 /nobreak >nul

REM --- Browser oeffnen ---
start http://localhost:3000

echo  Fertig. Dieses Fenster kann geschlossen werden.
timeout /t 3 /nobreak >nul
