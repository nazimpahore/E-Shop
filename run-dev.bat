@echo off
title E-Shop Dev Server
echo ===================================================
echo           Starting E-Shop (Backend + Frontend)
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

:: Auto-install root dependencies if needed
if not exist "node_modules" (
    echo [Setup] Installing root runner dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install root dependencies.
        pause
        exit /b 1
    )
)

:: Auto-install backend dependencies if missing
if not exist "backend\node_modules" (
    echo [Setup] Installing backend dependencies...
    call npm --prefix backend install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
)

:: Auto-install frontend dependencies if missing
if not exist "frontend\node_modules" (
    echo [Setup] Installing frontend dependencies...
    call npm --prefix frontend install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
)

echo.
echo Starting Backend (http://localhost:5000) and Frontend (http://localhost:3000)...
echo Press Ctrl+C at any time to stop both servers.
echo.

call npm run dev
