# OUTFITR - 启动所有服务器脚本
# 改进版：自动清理旧进程，避免打开过多窗口

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OUTFITR - Starting All Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$FrontendDir = Join-Path $ScriptDir "frontend"

# 检查目录是否存在
if (-not (Test-Path $BackendDir)) {
    Write-Host "错误: 找不到后端目录: $BackendDir" -ForegroundColor Red
    pause
    exit 1
}

if (-not (Test-Path $FrontendDir)) {
    Write-Host "错误: 找不到前端目录: $FrontendDir" -ForegroundColor Red
    pause
    exit 1
}

# 停止已存在的服务器进程
Write-Host "正在检查并清理旧进程..." -ForegroundColor Yellow
try {
    # 关闭已存在的服务器窗口
    Get-Process | Where-Object { 
        $_.MainWindowTitle -like "*OUTFITR*Backend*" -or 
        $_.MainWindowTitle -like "*OUTFITR*Frontend*" -or
        $_.MainWindowTitle -like "*OUTFITR-Backend*" -or
        $_.MainWindowTitle -like "*OUTFITR-Frontend*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # 查找占用3000和3001端口的进程
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    $port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    # 停止npm run dev进程（避免重复启动）
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
        $cmdLine -like "*npm*run*dev*" -or $cmdLine -like "*nodemon*" -or $cmdLine -like "*next*dev*" -or $cmdLine -like "*ts-node*index.ts*"
    } | Where-Object {
        $_.Id -in $port3000 -or $_.Id -in $port3001 -or (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine -like "*webapp*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    if ($port3000) {
        Write-Host "停止占用3000端口的进程..." -ForegroundColor Yellow
        Stop-Process -Id $port3000 -Force -ErrorAction SilentlyContinue
    }
    
    if ($port3001) {
        Write-Host "停止占用3001端口的进程..." -ForegroundColor Yellow
        Stop-Process -Id $port3001 -Force -ErrorAction SilentlyContinue
    }
    
    Start-Sleep -Seconds 2
} catch {
    Write-Host "清理进程时出现警告: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "启动后端服务器..." -ForegroundColor Green
Write-Host "后端目录: $BackendDir" -ForegroundColor Gray
Write-Host ""

# 在新窗口中启动后端服务器
$backendScript = @"
cd '$BackendDir'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'OUTFITR Backend Server' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host '后端服务器: http://localhost:3001' -ForegroundColor Green
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# 等待2秒，让后端开始启动
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "启动前端服务器..." -ForegroundColor Green
Write-Host "前端目录: $FrontendDir" -ForegroundColor Gray
Write-Host ""

# 在新窗口中启动前端服务器
$frontendScript = @"
cd '$FrontendDir'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'OUTFITR Frontend Server' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host '前端服务器: http://localhost:3000' -ForegroundColor Green
Write-Host ''
npm run dev
"@

# 检查是否已有前端窗口，如果有则先关闭
$existingFrontend = Get-Process | Where-Object { $_.MainWindowTitle -like "*OUTFITR*Frontend*" -or $_.MainWindowTitle -like "*OUTFITR-Frontend*" }
if ($existingFrontend) {
    $existingFrontend | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "服务器正在启动中..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "后端:  http://localhost:3001" -ForegroundColor Green
Write-Host "前端: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "已打开2个窗口用于显示服务器日志" -ForegroundColor Yellow
Write-Host ""

