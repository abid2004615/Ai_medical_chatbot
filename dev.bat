@echo off
echo ========================================
echo   MediChat Development Server Startup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Starting servers...
echo.

REM Start Flask backend in a new window
echo [1/3] Starting Flask Backend Server...
start "MediChat Flask" cmd /k "cd backend && python app.py"

REM Wait a bit for Flask to start
timeout /t 2 /nobreak >nul

REM Start FastAPI streaming server in a new window
echo [2/3] Starting Streaming Server...
start "MediChat Streaming" cmd /k "cd backend && uvicorn streaming_chat:app --host 0.0.0.0 --port 8000 --reload"

REM Wait a bit for streaming server to start
timeout /t 2 /nobreak >nul

REM Start frontend in a new window
echo [3/3] Starting Frontend Server...
start "MediChat Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Flask Backend:    http://localhost:5000
echo   Streaming API:    http://localhost:8000
echo   Frontend:         http://localhost:3000
echo ========================================
echo.
echo Servers are starting in separate windows.
echo Close those windows to stop the servers.
echo.
pause
