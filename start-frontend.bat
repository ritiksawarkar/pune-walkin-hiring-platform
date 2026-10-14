@echo off
echo ========================================================
echo Starting Pune Walk-In Platform Frontend...
echo ========================================================

cd /d "%~dp0frontend"
call npm.cmd run dev
