@echo off
title VoxCode - Installing All Dependencies...

echo.
echo ========================================
echo   VoxCode - Unified Installer
echo ========================================
echo.

:: 1. Backend Dependencies
echo [1/3] Installing Python Dependencies...
cd /d "%~dp0backend"
"C:\Python\Python311\python.exe" -m pip install -r requirements.txt

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b %ERRORLEVEL%
)

:: 2. NLTK Data
echo [2/3] Downloading NLTK Datasets...
"C:\Python\Python311\python.exe" -c "import nltk; nltk.download('punkt_tab'); nltk.download('averaged_perceptron_tagger_eng'); nltk.download('wordnet')"

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to download NLTK data.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Frontend Dependencies
echo [3/3] Installing Frontend Dependencies (npm)...
cd /d "%~dp0frontend"
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install frontend dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================
echo   All dependencies installed successfully!
echo ========================================
echo.
pause
