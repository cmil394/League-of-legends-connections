@echo off
set ROOT=%~dp0

echo Starting backend...
cd /d %ROOT%backend
call npm install

start cmd /k "echo ========================================== && echo BACKEND RUNNING AT: http://127.0.0.1:3001 && echo ========================================== && node index.js"

echo Starting frontend...
cd /d %ROOT%frontend
start cmd /k npm run dev