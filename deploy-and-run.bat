@echo off
setlocal EnableExtensions
title Vedra - Full Auto Deploy

echo ==================================================
echo   Vedra - Full Auto Deploy
echo ==================================================
echo.

REM ============================================
REM 1. رفع التعديلات على GitHub
REM ============================================
echo [1/4] Pushing to GitHub...
cd /d D:\OnlinePlantStore.Frontend
git add .
git commit -m "Auto update: %date% %time%"
git push origin main

REM ============================================
REM 2. تشغيل الـ API
REM ============================================
echo [2/4] Starting API...
start "Vedra API" cmd /k "cd /d D:\OnlinePlantStore.API && dotnet run --urls http://0.0.0.0:5170"

REM ============================================
REM 3. تشغيل Cloudflare Tunnel
REM ============================================
echo [3/4] Starting Tunnel...
timeout /t 5 /nobreak >nul
del %TEMP%\vedra_tunnel.log 2>nul
start "Vedra Tunnel" cmd /k "cloudflared tunnel --url http://localhost:5170 > %TEMP%\vedra_tunnel.log 2>&1"

REM ============================================
REM 4. استخراج الـ URL وتحديث Vercel
REM ============================================
echo [4/4] Updating Vercel env...
timeout /t 15 /nobreak >nul

set "TUNNEL_URL="
for /f "tokens=*" %%a in ('findstr /r "https://.*trycloudflare\.com" "%TEMP%\vedra_tunnel.log"') do set "TUNNEL_URL=%%a"

if "%TUNNEL_URL%"=="" (
    echo ❌ Tunnel URL not found. Opening site anyway...
) else (
    echo Found URL: %TUNNEL_URL%
    
    REM Update Vercel env var
    vercel env rm VITE_API_URL production -y 2>nul
    echo %TUNNEL_URL%/api | vercel env add VITE_API_URL production 2>nul
    vercel --prod --yes
)

start "" "https://vedra-olive.vercel.app"

echo.
echo ==================================================
echo   ✅ Done!
echo ==================================================
pause