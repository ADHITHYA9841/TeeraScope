@echo off
title TerraScope — Disaster Damage Intelligence Platform
color 0A

echo.
echo  ████████╗███████╗██████╗ ██████╗  █████╗ ███████╗ ██████╗ ██████╗ ██████╗ ███████╗
echo  ╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
echo     ██║   █████╗  ██████╔╝██████╔╝███████║███████╗██║     ██║   ██║██████╔╝█████╗
echo     ██║   ██╔══╝  ██╔══██╗██╔══██╗██╔══██║╚════██║██║     ██║   ██║██╔═══╝ ██╔══╝
echo     ██║   ███████╗██║  ██║██║  ██║██║  ██║███████║╚██████╗╚██████╔╝██║     ███████╗
echo     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚══════╝
echo.
echo  Disaster Damage Intelligence Platform  ^|  xView2 AI Engine
echo  ----------------------------------------------------------------
echo.

REM ─── CHECK PREREQUISITES ───────────────────────────────────────────────────
echo [1/5] Checking prerequisites...

where python >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERROR] Python is not installed or not in PATH.
    echo  Please install Python 3.9+ from https://www.python.org/downloads/
    echo  Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo  Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERROR] npm is not found. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
)

echo  [OK] Python found:
python --version
echo  [OK] Node.js found:
node --version
echo.

REM ─── GET SCRIPT DIRECTORY ──────────────────────────────────────────────────
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "VENV_DIR=%BACKEND_DIR%\venv"

echo  Project root: %ROOT_DIR%
echo.

REM ─── BACKEND SETUP ─────────────────────────────────────────────────────────
echo [2/5] Setting up Python virtual environment...

if not exist "%VENV_DIR%" (
    echo  Creating virtual environment at backend\venv ...
    python -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo  [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo  [OK] Virtual environment created.
) else (
    echo  [OK] Virtual environment already exists.
)
echo.

REM ─── INSTALL PYTHON DEPENDENCIES ───────────────────────────────────────────
echo [3/5] Installing Python backend dependencies...
echo  (This may take a few minutes on first run, especially for PyTorch)
echo.

call "%VENV_DIR%\Scripts\activate.bat"

if exist "%BACKEND_DIR%\requirements.txt" (
    pip install -r "%BACKEND_DIR%\requirements.txt" --quiet
    if errorlevel 1 (
        echo  [ERROR] Failed to install Python dependencies.
        pause
        exit /b 1
    )
    echo  [OK] Python dependencies installed.
) else (
    echo  [WARN] requirements.txt not found, skipping pip install.
)
echo.

REM ─── INSTALL FRONTEND DEPENDENCIES ─────────────────────────────────────────
echo [4/5] Installing Node.js frontend dependencies...

if not exist "%FRONTEND_DIR%\node_modules" (
    echo  Running npm install in frontend\ ...
    pushd "%FRONTEND_DIR%"
    npm install --silent
    if errorlevel 1 (
        echo  [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
    popd
    echo  [OK] Frontend dependencies installed.
) else (
    echo  [OK] node_modules already installed.
)
echo.

REM ─── LAUNCH SERVICES ───────────────────────────────────────────────────────
echo [5/5] Launching TerraScope services...
echo.

REM Start Backend API Server in new window
echo  Starting Python FastAPI backend on http://127.0.0.1:8000 ...
start "TerraScope — Backend API" cmd /k "cd /d "%BACKEND_DIR%" && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

REM Wait 3 seconds for backend to initialize before starting frontend
timeout /t 3 /nobreak >nul

REM Start Frontend Vite Dev Server in new window
echo  Starting React Vite frontend on http://127.0.0.1:5173 ...
start "TerraScope — Frontend UI" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

REM Wait for frontend to start
timeout /t 4 /nobreak >nul

echo.
echo  ────────────────────────────────────────────────────────
echo   TerraScope is starting up!
echo.
echo   Dashboard UI   →  http://127.0.0.1:5173
echo   Backend API    →  http://127.0.0.1:8000
echo   API Docs       →  http://127.0.0.1:8000/docs
echo  ────────────────────────────────────────────────────────
echo.
echo  Opening dashboard in your browser...

REM Open Dashboard in default browser
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5173"

echo.
echo  Both service windows are open. Close them to stop the servers.
echo  Press any key to close this setup window...
pause >nul
