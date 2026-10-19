@echo off
title E-Shop Launcher
echo ===================================================
echo     Starting E-Shop in Dedicated Terminal Windows
echo ===================================================
echo.

cd /d "%~dp0"

:: Check for node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/2] Launching Backend on Port 5000...
start "E-Shop Backend (Port 5000)" cmd /k "npm --prefix backend run dev"

echo [2/2] Launching Frontend on Port 3000...
start "E-Shop Frontend (Port 3000)" cmd /k "npm --prefix frontend run dev"

echo.
echo Both servers have been launched in separate terminal windows!
echo - Backend API:  http://localhost:5000
echo - Frontend App: http://localhost:3000
echo.
pause
