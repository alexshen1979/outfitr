@echo off
chcp 65001 >nul
echo ========================================
echo Starting OUTFITR Frontend Server...
echo ========================================
cd /d %~dp0
echo Current directory: %CD%
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting server...
call npm run dev
pause


