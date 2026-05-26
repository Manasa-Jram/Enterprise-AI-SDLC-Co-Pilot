@echo off
REM Enterprise AI SDLC Co-Pilot - Start Script for Windows
REM This script starts both backend and frontend servers in separate windows

echo.
echo 🚀 Starting Enterprise AI SDLC Co-Pilot...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Kill any existing processes on ports 3000, 3001 and 5173
echo 🔍 Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo 🛑 Stopping process on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo 🛑 Stopping process on port 3001...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo 🛑 Stopping process on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM Check if dependencies are installed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
    echo.
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
    echo.
)

REM Start backend server in a new window
echo 🔧 Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend server in a new window
echo 🎨 Starting Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting in separate windows
echo.
echo 📝 Access the application at: http://localhost:5173
echo 📝 Backend API at: http://localhost:3001
echo.
echo Press any key to exit this window (servers will continue running)...
pause >nul

@REM Made with Bob
