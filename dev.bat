@echo off
set ROOT=%~dp0

echo Starting backend...
cd /d %ROOT%backend
call venv\Scripts\activate

start cmd /k "echo ========================================== && echo BACKEND RUNNING AT: http://127.0.0.1:8000 && echo ========================================== && cd app && python main.py"

echo Starting frontend...
cd /d %ROOT%frontend
start cmd /k npm run dev