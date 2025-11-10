# GitHub 自动创建仓库并推送脚本
# 使用方法：运行此脚本，然后输入您的 Personal Access Token

param(
    [Parameter(Mandatory=$false)]
    [string]$Token = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub 自动创建仓库并推送脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$repoName = "outfitr"
$repoOwner = "alexshen1979"
$repoUrl = "https://github.com/$repoOwner/$repoName"

# 如果没有提供 token，提示用户输入
if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "请按照以下步骤创建 Personal Access Token：" -ForegroundColor Yellow
    Write-Host "1. 访问: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. 点击 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor White
    Write-Host "3. 填写备注（如：outfitr-push）" -ForegroundColor White
    Write-Host "4. 选择权限：至少勾选 'repo' 权限" -ForegroundColor White
    Write-Host "5. 点击 'Generate token' 并复制 token" -ForegroundColor White
    Write-Host ""
    
    $tokenSecure = Read-Host "请输入您的 Personal Access Token" -AsSecureString
    $Token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($tokenSecure))
}

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "Token 不能为空，退出脚本" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "正在检查仓库是否存在..." -ForegroundColor Yellow

# 检查仓库是否存在
try {
    $headers = @{
        'Authorization' = "token $Token"
        'Accept' = 'application/vnd.github.v3+json'
    }
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoOwner/$repoName" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "仓库已存在: $($response.html_url)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "仓库不存在，正在创建..." -ForegroundColor Yellow
        
        # 创建仓库
        try {
            $body = @{
                name = $repoName
                description = "AI-powered outfit generation platform"
                private = $false
            } | ConvertTo-Json
            
            $headers = @{
                'Authorization' = "token $Token"
                'Accept' = 'application/vnd.github.v3+json'
            }
            
            $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType 'application/json'
            Write-Host "仓库创建成功: $($response.html_url)" -ForegroundColor Green
        } catch {
            Write-Host "创建仓库失败: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "检查仓库失败: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "正在配置远程仓库..." -ForegroundColor Yellow

# 检查是否已配置远程仓库
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin "https://$Token@github.com/$repoOwner/$repoName.git"
    Write-Host "远程仓库已添加" -ForegroundColor Green
} else {
    git remote set-url origin "https://$Token@github.com/$repoOwner/$repoName.git"
    Write-Host "远程仓库已更新" -ForegroundColor Green
}

Write-Host ""
Write-Host "正在推送代码到 GitHub..." -ForegroundColor Yellow

# 推送代码
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "代码已成功推送到 GitHub！" -ForegroundColor Green
    Write-Host "仓库地址: $repoUrl" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    # 清除 token（安全考虑）
    git remote set-url origin "https://github.com/$repoOwner/$repoName.git"
    Write-Host ""
    Write-Host "已从远程 URL 中移除 token（安全考虑）" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "推送失败，请检查：" -ForegroundColor Red
    Write-Host "1. Token 是否正确" -ForegroundColor Red
    Write-Host "2. Token 是否有 'repo' 权限" -ForegroundColor Red
    Write-Host "3. 网络连接是否正常" -ForegroundColor Red
    exit 1
}

