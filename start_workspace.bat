@echo off
setlocal enabledelayedexpansion
title VoxCode Workspace MVP 🌐💎🚀

:: ─── 1. Configuration & Path Setup ──────────────────────────────────
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "WORKSPACE_DIR=%ROOT_DIR%frontend-next"

:: Dynamic Python Detection
set "PYTHON_EXE="
if exist "C:\Python\python.exe" (
    set "PYTHON_EXE=C:\Python\python.exe"
) else if exist "C:\Python\Python311\python.exe" (
    set "PYTHON_EXE=C:\Python\Python311\python.exe"
) else if exist "%ROOT_DIR%venv\Scripts\python.exe" (
    set "PYTHON_EXE=%ROOT_DIR%venv\Scripts\python.exe"
) else (
    for /f "tokens=*" %%p in ('where python 2^>nul') do (
        if not defined PYTHON_EXE set "PYTHON_EXE=%%p"
    )
)

if not defined PYTHON_EXE (
    echo [ERROR] Could not find Python! Please install Python 3.11+ or check your PATH.
    pause
    exit /b 1
)

echo.
echo  [*]  VOXCODE WORKSPACE MVP - IGNITION  [*]
echo  ==========================================
echo  Root Dir   : %ROOT_DIR%
echo  Python Exe : %PYTHON_EXE%
echo  Mode       : Workspace MVP + AI Core
echo.

:: ─── 2. Clean Stale Processes ────────────────────────────────────────
echo [0/4]   Cleaning stale processes on ports 8000, 3000, 3001, 3002, 5174...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174 2^>nul') do taskkill /F /PID %%a >nul 2>&1

:: ─── 3. Start AI Model Core (Port 8000) ──────────────────────────────
echo [1/4]  Starting AI Model Core (Port 8000)...
start "VoxCode Model Core (Port 8000)" /D "%BACKEND_DIR%" cmd /k "%PYTHON_EXE% model_server.py"

:: ─── 4. Start Next.js Workspace Frontend (Port 3002) ─────────────────────
echo [2/4]  Starting Next.js Workspace Frontend (Port 3002)...
start "VoxCode Next.js Workspace (Port 3002)" /D "%WORKSPACE_DIR%" cmd /k "npm run dev -- --port 3002"

:: ─── 5. Wait for AI Model Core ───────────────────────────────────────
echo [3/4]  Waiting for AI Model Core to be ready...
powershell -Command "$p=8000; $start=Get-Date; while(1) { $s=New-Object System.Net.Sockets.TcpClient; try { $t=$s.ConnectAsync('127.0.0.1',$p); if($t.Wait(500)) { $s.Close(); break } } catch {} finally { $s.Dispose() }; if((Get-Date)-$start -gt [TimeSpan]::FromSeconds(30)) { exit 1 }; Start-Sleep -Milliseconds 500 }"
if %ERRORLEVEL% neq 0 (
    echo [WARNING] AI Model Core took longer than 30s to respond. Continuing startup...
) else (
    echo        -> AI Model Core is ONLINE!
)

:: ─── 6. Start FastAPI Backend (Port 3001) ────────────────────────────
echo [4/4]  Starting FastAPI Backend Engine (Port 3001)...
start "VoxCode Backend Engine (Port 3001)" /D "%BACKEND_DIR%" cmd /k "%PYTHON_EXE% -m uvicorn api_server:app --host 0.0.0.0 --port 3001 --reload"

:: ─── 7. Final Verification & Launch ──────────────────────────────────
echo        Finalizing startup & verifying endpoints...
powershell -Command "$p=3001; $start=Get-Date; while(1) { $s=New-Object System.Net.Sockets.TcpClient; try { $t=$s.ConnectAsync('127.0.0.1',$p); if($t.Wait(500)) { $s.Close(); break } } catch {} finally { $s.Dispose() }; if((Get-Date)-$start -gt [TimeSpan]::FromSeconds(30)) { exit 1 }; Start-Sleep -Milliseconds 500 }"
if %ERRORLEVEL% eq 0 (
    echo        -> API Server is ONLINE!
)

powershell -Command "$p=3002; $start=Get-Date; while(1) { $s=New-Object System.Net.Sockets.TcpClient; try { $t=$s.ConnectAsync('127.0.0.1',$p); if($t.Wait(500)) { $s.Close(); break } } catch {} finally { $s.Dispose() }; if((Get-Date)-$start -gt [TimeSpan]::FromSeconds(30)) { exit 1 }; Start-Sleep -Milliseconds 500 }"
if %ERRORLEVEL% eq 0 (
    echo        -> Next.js Workspace is ONLINE!
)

echo.
echo  🌐 VOXCODE WORKSPACE MVP IS LIVE! 🚀
echo  ------------------------------------------------------
echo  Next.js Studio : http://localhost:3002
echo  Backend API    : http://localhost:3001/docs
echo  AI Model Core  : http://localhost:8000/docs
echo  ------------------------------------------------------
echo.
start http://localhost:3002
exit /b
