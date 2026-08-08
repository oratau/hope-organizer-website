@echo off
echo ========================================
echo   HOPE Organizer - Vercel Deployment
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - HOPE Organizer website"
    echo.
)

echo Checking Vercel CLI...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
    echo.
)

echo.
echo Starting Vercel deployment...
echo.
vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
pause
