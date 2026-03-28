@echo off
setlocal enabledelayedexpansion
title VoxCode Extreme Pro+ 🔥💎🚀

:: ─── Configuration ──────────────────────────────────────────────
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "PYTHON_EXE=C:\Python\python.exe"

echo.
echo  [*]  VOXCODE EXTREME PROTECTIVE (PRO+) - IGNITION  [*]
echo  ======================================================
echo.

echo [0/4]   Cleaning stale processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a >nul 2>&1

echo [1/4]  Starting AI Model Core (Port 8000)...
start "VoxCode Model Core" /D "%BACKEND_DIR%" cmd /k "%PYTHON_EXE% model_server.py"

echo [2/4]  Starting Monaco IDE (Port 5173)...
start "VoxCode Frontend" /D "%FRONTEND_DIR%" cmd /k "npm run dev"

echo [3/4]  Waiting for Brain to be ready...
powershell -Command "$p=8000; $start=Get-Date; while(1) { $s=New-Object System.Net.Sockets.TcpClient; try { $t=$s.ConnectAsync('127.0.0.1',$p); if($t.Wait(500)) { $s.Close(); break } } catch {} finally { $s.Dispose() }; if((Get-Date)-$start -gt [TimeSpan]::FromSeconds(30)) { exit 1 }; Start-Sleep -Milliseconds 500 }"
echo        -> AI Model Core is ONLINE!

echo [4/4]  Starting FastAPI API (Port 3001)...
start "VoxCode Backend" /D "%BACKEND_DIR%" cmd /k "%PYTHON_EXE% api_server.py"

echo       Finalizing startup...
powershell -Command "$p=3001; $start=Get-Date; while(1) { $s=New-Object System.Net.Sockets.TcpClient; try { $t=$s.ConnectAsync('127.0.0.1',$p); if($t.Wait(500)) { $s.Close(); break } } catch {} finally { $s.Dispose() }; if((Get-Date)-$start -gt [TimeSpan]::FromSeconds(30)) { exit 1 }; Start-Sleep -Milliseconds 500 }"
echo        -> API Server is ONLINE!

powershell -Command "$p=5173; $start=Get-Date; while(1) { $s=New-Object System.Net.Sockets.TcpClient; try { $t=$s.ConnectAsync('127.0.0.1',$p); if($t.Wait(500)) { $s.Close(); break } } catch {} finally { $s.Dispose() }; if((Get-Date)-$start -gt [TimeSpan]::FromSeconds(30)) { exit 1 }; Start-Sleep -Milliseconds 500 }"
echo        -> Monaco IDE is ONLINE!

echo.
echo  ✅ VOXCODE EXTREME IS ONLINE! 🚀
echo  ----------------------------------
echo  IDE Screen: http://localhost:5173
echo.
start http://localhost:5173
exit /b
