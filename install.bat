@echo off
set "PATH=D:\nodejs;%PATH%"
cd /d "D:\CM-Studio-"
echo [1/3] Node version:
"D:\nodejs\node.exe" -v
echo [2/3] NPM version:
call "D:\nodejs\npm.cmd" -v
echo [3/3] Installing dependencies...
call "D:\nodejs\npm.cmd" install --legacy-peer-deps
echo Done.
