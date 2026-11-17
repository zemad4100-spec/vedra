@echo off
setlocal EnableExtensions EnableDelayedExpansion
title VEDRA - FULL AUTO DEPLOY

set "FRONTEND=D:\OnlinePlantStore.Frontend"
set "BACKEND=D:\OnlinePlantStore.API"
set "API_PORT=5170"
set "SITE=https://vedra-olive.vercel.app"
set "LOG_OUT=%TEMP%\vedra_tunnel_out.log"

cls
echo ==================================================
echo          VEDRA - FULL AUTO DEPLOY
echo ==================================================
echo.

REM 1. PUSH TO GITHUB
echo [1/7] Pushing to GitHub...
cd /d "%FRONTEND%"
git add .
git commit -m "Auto Deploy: %date% %time%"
git push origin main
if errorlevel 1 (echo Failed to push to GitHub & pause & exit /b 1)

REM 2. START API
echo [2/7] Starting API...
taskkill /F /IM "OnlinePlantStore.API.exe" >nul 2>&1
start "Vedra API" cmd /k "cd /d %BACKEND% && dotnet run --urls http://0.0.0.0:%API_PORT%"
timeout /t 5 /nobreak >nul

REM 3. START TUNNEL
echo [3/7] Starting Cloudflare Tunnel...
taskkill /F /IM "cloudflared.exe" >nul 2>&1
del "%LOG_OUT%" 2>nul
start "Vedra Tunnel" cmd /c "cloudflared tunnel --url http://localhost:%API_PORT% > "%LOG_OUT%" 2>&1"

echo [4/7] Waiting for Tunnel URL...
set "TUNNEL_URL="
for /L %%i in (1,1,30) do (
    if not defined TUNNEL_URL (
        for /f "usebackq delims=" %%U in (`powershell -NoProfile -Command "$m=[regex]::Match((Get-Content '%LOG_OUT%' -Raw -ErrorAction SilentlyContinue),'https://[a-zA-Z0-9-]+\.trycloudflare\.com'); if($m.Success){$m.Value}"`) do set "TUNNEL_URL=%%U"
        if not defined TUNNEL_URL timeout /t 2 /nobreak >nul
    )
)

if not defined TUNNEL_URL (echo Failed to get Tunnel URL & pause & exit /b 1)
set "API_URL=!TUNNEL_URL!/api"
echo Tunnel URL: !API_URL!

REM 5. UPDATE VERCEL ENV
echo [5/7] Updating Vercel Environment...
cd /d "%FRONTEND%"
vercel env rm VITE_API_URL production -y >nul 2>&1
echo !API_URL! | vercel env add VITE_API_URL production --type config
if errorlevel 1 (echo Failed to add Vercel env & pause & exit /b 1)

REM 6. DEPLOY TO VERCEL
echo [6/7] Deploying to Vercel...
vercel --prod --yes
if errorlevel 1 (echo Vercel deployment failed & pause & exit /b 1)

REM 7. OPEN SITE
echo [7/7] Opening Site...
start "" "%SITE%"

echo.
echo ==================================================
echo             DEPLOYMENT SUCCESS
echo ==================================================
echo.
echo Frontend : %SITE%
echo Backend  : !API_URL!
echo.
echo Keep the API and Tunnel windows open!
echo.
pause