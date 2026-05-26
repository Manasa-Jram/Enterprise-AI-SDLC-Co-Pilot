@echo off
REM Enterprise AI SDLC Co-Pilot - Stop Script for Windows
REM This script stops all backend and frontend servers

echo.
echo 🛑 Stopping Enterprise AI SDLC Co-Pilot servers...
echo.

REM Kill any processes on port 3000 (Frontend alternate)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Stopping process on Port 3000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill any processes on port 3001 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo Stopping Backend Server (Port 3001, PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill any processes on port 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo Stopping Frontend Server (Port 5173, PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ✅ All servers stopped
echo.
pause

@REM Made with Bob
