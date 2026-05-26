@echo off
echo Stopping old backend...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting backend with updated code...
cd backend
start "Backend Server" cmd /k "node server.js"

echo.
echo Backend restarted! Check the new terminal window for logs.
echo.
pause

@REM Made with Bob
