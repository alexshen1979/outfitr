# GitHub 推送脚本
# 使用方法：运行此脚本，然后输入您的 Personal Access Token

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub 代码推送脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否已配置远程仓库
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "正在添加远程仓库..." -ForegroundColor Yellow
    git remote add origin https://github.com/alexshen1979/outfitr.git
    Write-Host "远程仓库已添加" -ForegroundColor Green
} else {
    Write-Host "远程仓库已配置: $remoteExists" -ForegroundColor Green
}

Write-Host ""
Write-Host "请按照以下步骤创建 Personal Access Token：" -ForegroundColor Yellow
Write-Host "1. 访问: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "2. 点击 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor White
Write-Host "3. 填写备注（如：outfitr-push）" -ForegroundColor White
Write-Host "4. 选择权限：至少勾选 'repo' 权限" -ForegroundColor White
Write-Host "5. 点击 'Generate token' 并复制 token" -ForegroundColor White
Write-Host ""

# 提示用户输入 token
$token = Read-Host "请输入您的 Personal Access Token（输入时不会显示）" -AsSecureString
$tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))

if ([string]::IsNullOrWhiteSpace($tokenPlain)) {
    Write-Host "Token 不能为空，退出脚本" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "正在推送代码到 GitHub..." -ForegroundColor Yellow

# 使用 token 配置远程 URL
$remoteUrl = "https://$tokenPlain@github.com/alexshen1979/outfitr.git"
git remote set-url origin $remoteUrl

# 推送代码
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "代码已成功推送到 GitHub！" -ForegroundColor Green
    Write-Host "仓库地址: https://github.com/alexshen1979/outfitr" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    # 清除 token（安全考虑）
    git remote set-url origin https://github.com/alexshen1979/outfitr.git
    Write-Host ""
    Write-Host "已从远程 URL 中移除 token（安全考虑）" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "推送失败，请检查：" -ForegroundColor Red
    Write-Host "1. Token 是否正确" -ForegroundColor Red
    Write-Host "2. Token 是否有 'repo' 权限" -ForegroundColor Red
    Write-Host "3. 仓库是否已创建（https://github.com/new）" -ForegroundColor Red
    Write-Host "4. 网络连接是否正常" -ForegroundColor Red
}

