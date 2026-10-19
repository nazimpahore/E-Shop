# E-Shop Dev Server Runner for PowerShell
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "        Starting E-Shop (Backend + Frontend)      " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not found in PATH! Please install Node.js." -ForegroundColor Red
    Exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "[Setup] Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "[Setup] Installing backend dependencies..." -ForegroundColor Yellow
    npm --prefix backend install
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[Setup] Installing frontend dependencies..." -ForegroundColor Yellow
    npm --prefix frontend install
}

Write-Host "`nStarting both Backend (Port 5000) and Frontend (Port 3000)..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop both servers.`n" -ForegroundColor DarkGray

npm run dev
