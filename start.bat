@echo off
REM EID Game Quick Start Script (Windows)
REM This script sets up and starts both backend and frontend

setlocal enabledelayedexpansion

echo ===============================================
echo EID Game - Quick Start (Windows)
echo ===============================================

REM Check for required tools
echo Checking prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    exit /b 1
)

echo Prerequisites satisfied

REM Backend setup
echo.
echo Setting up backend...
cd backend

python -m pip install --upgrade pip >nul 2>&1
pip install uv >nul 2>&1

echo Installing backend dependencies...
call uv sync

echo Backend setup complete

REM Start backend
echo Starting backend server...
start cmd /k "uv run python run.py"

cd ..

REM Frontend setup
echo.
echo Setting up frontend...
cd frontend

echo Installing frontend dependencies...
call npm install

echo Frontend setup complete

REM Start frontend
echo Starting frontend development server...
start cmd /k "npm run dev"

cd ..

echo.
echo ===============================================
echo Both servers are starting!
echo ===============================================
echo.
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo Frontend:  http://localhost:5173
echo.
echo Close the terminal windows to stop the servers.
