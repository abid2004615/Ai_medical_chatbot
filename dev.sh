#!/bin/bash

echo "========================================"
echo "  MediChat Development Server Startup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python is not installed"
    echo "Please install Python from https://www.python.org/downloads/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "[WARNING] pnpm is not installed"
    echo "Installing pnpm globally..."
    npm install -g pnpm
fi

echo "[INFO] Checking port availability..."

# Check if port 5000 is available
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[WARNING] Port 5000 is already in use"
    echo "Please stop the process using port 5000 or change the backend port"
    exit 1
fi

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[WARNING] Port 3000 is already in use"
    echo "Please stop the process using port 3000 or change the frontend port"
    exit 1
fi

echo ""
echo "[1/4] Starting Backend Server..."
cd backend && python3 app.py &
BACKEND_PID=$!
cd ..

echo "[2/4] Waiting for backend to initialize..."
sleep 3

echo "[3/4] Starting Frontend Server..."
cd frontend && pnpm dev &
FRONTEND_PID=$!
cd ..

echo "[4/4] Servers starting..."
echo ""
echo "========================================"
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
