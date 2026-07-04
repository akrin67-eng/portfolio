@echo off
chcp 65001 >nul
title UpdateGallery
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0UpdateGallery.ps1"
echo.
pause
