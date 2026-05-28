@echo off
title 英国大选2015 - 启动器
echo ========================================
echo   英国大选 2015 可视化
echo ========================================
echo.

REM 设置Node.js路径到PATH环境变量
set "PATH=C:\Program Files\nodejs;%PATH%"

REM 切换到脚本所在目录
cd /d "%~dp0"

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 正在安装依赖，请稍候...
    call npm install
    echo.
)

echo 正在启动开发服务器...
echo 浏览器将自动打开 http://localhost:3000/election-map-2015
echo 按 Ctrl+C 可停止服务器
echo.

REM 自动打开浏览器（延迟2秒等服务器启动）
start "" http://localhost:3000/uk-election-2015

REM 启动Next.js开发服务器
call "C:\Program Files\nodejs\npm.cmd" run dev

REM 如果服务器意外停止，暂停保持窗口打开
echo.
echo 服务器已停止。
pause