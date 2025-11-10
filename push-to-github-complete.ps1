# ========================================
# GitHub 自动推送脚本 - 完整版
# ========================================
# 此脚本会自动完成：
# 1. 检查/创建 GitHub 仓库
# 2. 配置远程仓库
# 3. 推送所有代码
# ========================================

param(
    [Parameter(Mandatory=$false)]
    [string]$Token = ""
)

$ErrorActionPreference = "Stop"

# 配置信息
$repoName = "outfitr"
$repoOwner = "alexshen1979"
$repoUrl = "https://github.com/$repoOwner/$repoName"
$repoApiUrl = "https://api.github.com/repos/$repoOwner/$repoName"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GitHub 自动推送脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 获取 Token
if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "📋 步骤 1: 获取 Personal Access Token" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "由于 GitHub 安全策略，需要使用 Personal Access Token" -ForegroundColor White
    Write-Host ""
    Write-Host "快速创建步骤：" -ForegroundColor Cyan
    Write-Host "  1. 访问: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "  2. 点击 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor White
    Write-Host "  3. 填写备注: outfitr-push" -ForegroundColor White
    Write-Host "  4. 选择过期时间（建议: 90 days 或 No expiration）" -ForegroundColor White
    Write-Host "  5. 勾选权限: repo (这会自动选择所有 repo 相关权限)" -ForegroundColor White
    Write-Host "  6. 点击 'Generate token'" -ForegroundColor White
    Write-Host "  7. 复制生成的 token（格式: ghp_xxxxxxxxxxxx）" -ForegroundColor White
    Write-Host ""
    
    $tokenSecure = Read-Host "请输入您的 Personal Access Token" -AsSecureString
    $Token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($tokenSecure))
    
    if ([string]::IsNullOrWhiteSpace($Token)) {
        Write-Host ""
        Write-Host "❌ Token 不能为空，退出脚本" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
} else {
    Write-Host "📋 使用提供的 Token" -ForegroundColor Green
    Write-Host ""
}

# 步骤 2: 检查/创建仓库
Write-Host "📦 步骤 2: 检查 GitHub 仓库状态..." -ForegroundColor Yellow

$headers = @{
    'Authorization' = "token $Token"
    'Accept' = 'application/vnd.github.v3+json'
    'User-Agent' = 'OutfitR-Push-Script'
}

try {
    $response = Invoke-RestMethod -Uri $repoApiUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ 仓库已存在: $($response.html_url)" -ForegroundColor Green
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "📝 仓库不存在，正在创建..." -ForegroundColor Yellow
        
        try {
            $body = @{
                name = $repoName
                description = "AI-powered outfit generation platform"
                private = $false
                auto_init = $false
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType 'application/json'
            Write-Host "✅ 仓库创建成功: $($response.html_url)" -ForegroundColor Green
            Write-Host ""
        } catch {
            Write-Host ""
            Write-Host "❌ 创建仓库失败: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "   提示: Token 可能无效或权限不足" -ForegroundColor Yellow
            }
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "❌ 检查仓库失败: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 步骤 3: 配置远程仓库
Write-Host "🔗 步骤 3: 配置远程仓库..." -ForegroundColor Yellow

$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin "https://$Token@github.com/$repoOwner/$repoName.git" 2>&1 | Out-Null
    Write-Host "✅ 远程仓库已添加" -ForegroundColor Green
} else {
    git remote set-url origin "https://$Token@github.com/$repoOwner/$repoName.git" 2>&1 | Out-Null
    Write-Host "✅ 远程仓库已更新" -ForegroundColor Green
}
Write-Host ""

# 步骤 4: 推送代码
Write-Host "🚀 步骤 4: 推送代码到 GitHub..." -ForegroundColor Yellow
Write-Host ""

git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ 代码已成功推送到 GitHub！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 仓库地址: $repoUrl" -ForegroundColor Cyan
    Write-Host ""
    
    # 清除 token（安全考虑）
    git remote set-url origin "https://github.com/$repoOwner/$repoName.git" 2>&1 | Out-Null
    Write-Host "🔒 已从远程 URL 中移除 token（安全考虑）" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "✨ 完成！您现在可以在 GitHub 上查看您的代码了。" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ 推送失败" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查以下事项：" -ForegroundColor Yellow
    Write-Host "  1. Token 是否正确" -ForegroundColor White
    Write-Host "  2. Token 是否有 'repo' 权限" -ForegroundColor White
    Write-Host "  3. Token 是否已过期" -ForegroundColor White
    Write-Host "  4. 网络连接是否正常" -ForegroundColor White
    Write-Host "  5. 仓库名称是否可用（可能已被占用）" -ForegroundColor White
    Write-Host ""
    exit 1
}

