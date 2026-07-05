@echo off
setlocal enabledelayedexpansion
title VoxCode - Unified Pro+ Dependency Installer 🛠️💎

:: ─── 1. Configuration & Path Setup ──────────────────────────────────
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "WORKSPACE_DIR=%ROOT_DIR%workspace-mvp"

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
echo ========================================================
echo   VoxCode Pro+ - Unified System & Model Installer 🛠️
echo ========================================================
echo   Python Exe : %PYTHON_EXE%
echo   Root Dir   : %ROOT_DIR%
echo ========================================================
echo.

:: 1. Backend Dependencies
echo [1/4] Installing Backend Python Dependencies...
cd /d "%BACKEND_DIR%"
"%PYTHON_EXE%" -m pip install --upgrade pip
"%PYTHON_EXE%" -m pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b %ERRORLEVEL%
)

:: 2. NLP & Speech Model Pre-Caching
echo.
echo [2/4] Pre-Downloading NLTK & SentenceTransformer NLP Models...
"%PYTHON_EXE%" -c "import nltk; nltk.download('punkt_tab'); nltk.download('averaged_perceptron_tagger_eng'); nltk.download('wordnet')"
"%PYTHON_EXE%" -c "from sentence_transformers import SentenceTransformer; print('Pre-caching all-MiniLM-L6-v2...'); SentenceTransformer('all-MiniLM-L6-v2')"
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Some NLP models failed to pre-cache. They will download on first run.
)

:: 3. Pro Studio Frontend Dependencies
echo.
echo [3/4] Installing Pro Studio Frontend Dependencies (npm)...
cd /d "%FRONTEND_DIR%"
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Pro Studio frontend dependencies.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Workspace MVP Dependencies
echo.
echo [4/4] Installing Workspace MVP Dependencies (npm)...
cd /d "%WORKSPACE_DIR%"
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Workspace MVP dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo   ✅ ALL VOXCODE PRO+ DEPENDENCIES INSTALLED! 🚀
echo ========================================================
echo   You can now launch any mode:
echo     - start.bat             (Standard Pro+ Studio)
echo     - start_hardened.bat    (Zero-Trust Hardened Mode)
echo     - start_workspace.bat   (Workspace MVP)
echo ========================================================
echo.
pause
