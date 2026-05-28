# BBC Election 2024 - Development Server (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BBC Election 2024 - Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 临时设置执行策略
$originalPolicy = Get-ExecutionPolicy -Scope CurrentUser
try {
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned -Force
} catch {
    Write-Host "注意：无法更改执行策略，尝试继续..." -ForegroundColor Yellow
}

# 设置Node.js路径
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# 切换到脚本所在目录
Set-Location -Path $PSScriptRoot

Write-Host "正在启动开发服务器..." -ForegroundColor Green
Write-Host "按Ctrl+C停止服务器" -ForegroundColor Yellow
Write-Host ""

# 启动Next.js开发服务器
try {
    & "C:\Program Files\nodejs\npm.cmd" run dev
} catch {
    Write-Host "启动服务器时出错: $_" -ForegroundColor Red
    Write-Host "请确保Node.js已正确安装" -ForegroundColor Yellow
}

# 恢复原始执行策略
try {
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy $originalPolicy -Force
} catch {
    # 忽略恢复错误
}

Read-Host "按Enter键退出"