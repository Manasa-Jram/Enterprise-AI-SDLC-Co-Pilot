# Restart Script for Enterprise AI SDLC Co-Pilot
# This script stops and restarts both backend and frontend servers

Write-Host "`n🔄 Restarting Enterprise AI SDLC Co-Pilot Servers..." -ForegroundColor Cyan

# Stop existing Node processes (optional - only if you want to kill all)
Write-Host "`n⏹️  Stopping existing Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Gray
    Write-Host "Please manually stop your backend and frontend terminals (Ctrl+C)" -ForegroundColor Yellow
    Write-Host "Or run: Get-Process -Name node | Stop-Process -Force" -ForegroundColor Gray
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Green
}

Write-Host "`n📝 Instructions:" -ForegroundColor Cyan
Write-Host "1. Open TWO separate terminals" -ForegroundColor White
Write-Host "2. In Terminal 1 (Backend):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host "`n3. In Terminal 2 (Frontend):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host "`n✅ After restart, test at: http://localhost:5173" -ForegroundColor Green
Write-Host "📡 Backend API: http://localhost:3001" -ForegroundColor Green
Write-Host "`n"

# Made with Bob
