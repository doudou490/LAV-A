@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install Node.js 18+ then run this file again.
  pause
  exit /b 1
)
set /p ADMIN_PASSWORD=Enter your Admin password (minimum 8 characters): 
if "%ADMIN_PASSWORD%"=="" set ADMIN_PASSWORD=Lavea@2026
start "Lavea Server" cmd /k "node server.js"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/admin"
