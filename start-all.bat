@echo off
echo Starting Three Player Chess Application...

REM Start backend in new window
start "Backend Server" cmd /k "cd /d %~dp0 && gradlew.bat :backend:bootRun"

REM Wait 5 seconds for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend in new window on port 3001
start "Frontend Server" cmd /k "cd /d %~dp0frontend && set PORT=3001 && npm start"

echo Both servers are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
pause