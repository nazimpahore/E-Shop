#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "==================================================="
echo "        Starting E-Shop (Backend + Frontend)      "
echo "==================================================="

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not found in PATH! Please install Node.js."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[Setup] Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "[Setup] Installing backend dependencies..."
    npm --prefix backend install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "[Setup] Installing frontend dependencies..."
    npm --prefix frontend install
fi

echo ""
echo "Starting Backend (http://localhost:5000) and Frontend (http://localhost:3000)..."
echo "Press Ctrl+C to stop both servers."
echo ""

npm run dev
