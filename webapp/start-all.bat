@echo off
chcp 65001 >nul
echo ========================================
echo OUTFITR - Starting All Servers
echo ========================================
echo.

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend"

:: 检查目录是否存在
if not exist "%BACKEND_DIR%" (
    echo Error: Backend directory not found: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo Error: Frontend directory not found: %FRONTEND_DIR%
    pause
    exit /b 1
)

:: 停止占用端口的进程
echo Checking for existing servers...
echo.

:: 使用PowerShell来清理进程
powershell -Command "try { $p3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($p3000) { Stop-Process -Id $p3000 -Force -ErrorAction SilentlyContinue; Write-Host 'Stopped process on port 3000' } } catch {}"
powershell -Command "try { $p3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($p3001) { Stop-Process -Id $p3001 -Force -ErrorAction SilentlyContinue; Write-Host 'Stopped process on port 3001' } } catch {}"

timeout /t 1 /nobreak >nul

echo.
echo Starting Backend Server...
echo Backend directory: %BACKEND_DIR%
echo.

:: 在新窗口中启动后端服务器（使用唯一窗口标题避免重复）
start "OUTFITR-Backend" cmd /k "cd /d %BACKEND_DIR% && echo ======================================== && echo OUTFITR Backend Server && echo ======================================== && echo. && echo Backend: http://localhost:3001 && echo. && npm run dev"

:: 等待2秒，让后端开始启动
timeout /t 2 /nobreak >nul

echo.
echo Starting Frontend Server...
echo Frontend directory: %FRONTEND_DIR%
echo.

:: 在新窗口中启动前端服务器（使用唯一窗口标题避免重复）
start "OUTFITR-Frontend" cmd /k "cd /d %FRONTEND_DIR% && echo ======================================== && echo OUTFITR Frontend Server && echo ======================================== && echo. && echo Frontend: http://localhost:3000 && echo. && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Two windows have been opened for the servers.
echo You can close this window now.
echo.
pause
