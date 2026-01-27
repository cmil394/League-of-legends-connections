@echo off
setlocal
set ROOT=%~dp0

echo ==========================================
echo Project setup starting...
echo ==========================================

:: Check for Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check for npm
where npm >nul 2>&1
if errorlevel 1 (
    echo npm is not installed or not in PATH.
    pause
    exit /b 1
)

echo Node and npm detected.
echo.

:: Backend setup
echo Setting up backend...
cd /d "%ROOT%backend"
call npm install
if errorlevel 1 (
    echo Backend setup failed.
    pause
    exit /b 1
)

:: Frontend setup
echo.
echo Setting up frontend...
cd /d "%ROOT%frontend"
call npm install
if errorlevel 1 (
    echo Frontend setup failed.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Setup complete!
echo You can now run run.bat to start the app.
echo ==========================================
pause