@echo off
echo ========================================
echo BBC Election 2024 - Development Server
echo ========================================
echo.

REM 设置Node.js路径到PATH环境变量
set "PATH=C:\Program Files\nodejs;%PATH%"

REM 切换到脚本所在目录
cd /d "%~dp0"

echo 正在启动开发服务器...
echo 按Ctrl+C停止服务器
echo.

REM 启动Next.js开发服务器
call "C:\Program Files\nodejs\npm.cmd" run dev

REM 如果服务器意外停止，暂停保持窗口打开
pause