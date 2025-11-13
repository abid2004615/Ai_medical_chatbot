@echo off
echo ========================================
echo   MediChat Development Server Startup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] pnpm is not installed
    echo Installing pnpm globally...
    npm install -g pnpm
)

echo [INFO] Checking port availability...

REM Check if port 5000 is available
netstat -ano | findstr :5000 >nul
if not errorlevel 1 (
    echo [WARNING] Port 5000 is already in use
    echo Please stop the process using port 5000 or change the backend port
    pause
    exit /b 1
)

REM Check if port 3000 is available
netstat -ano | findstr :3000 >nul
if not errorlevel 1 (
    echo [WARNING] Port 3000 is already in use
    echo Please stop the process using port 3000 or change the frontend port
    pause
    exit /b 1
)

echo.
echo [1/4] Starting Backend Server...
start "MediChat Backend" cmd /k "cd backend && python app.py"
timeout /t 3 /nobreak >nul

echo [2/4] Waiting for backend to initialize...
timeout /t 2 /nobreak >nul

echo [3/4] Starting Frontend Server...
start "MediChat Frontend" cmd /k "cd frontend && pnpm dev"

echo [4/4] Servers starting...
echo.
echo ========================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Both servers are starting in separate windows.
echo Close those windows or press Ctrl+C in them to stop the servers.
echo.
echo Press any key to exit this script...
pause >nul
