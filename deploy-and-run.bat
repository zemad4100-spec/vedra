
@echo off
setlocal EnableExtensions EnableDelayedExpansion
title VEDRA - FULL AUTO DEPLOY

REM ==================================================
REM VEDRA - FULL AUTO DEPLOY
REM Frontend + API + Cloudflare + Vercel
REM ==================================================

set "FRONTEND=D:\OnlinePlantStore.Frontend"
set "BACKEND=D:\OnlinePlantStore.API"
set "API_PORT=5170"
set "API_LOCAL=http://127.0.0.1:%API_PORT%"
set "SITE=https://vedra-olive.vercel.app"
set "LOG_OUT=%TEMP%\vedra_tunnel_out.log"
set "LOG_ERR=%TEMP%\vedra_tunnel_err.log"

cls
echo.
echo ==================================================
echo          VEDRA - FULL AUTO DEPLOY
echo ==================================================
echo.

REM --------------------------------------------------
REM 1. CHECK REQUIRED TOOLS
REM --------------------------------------------------

echo [1/9] Checking required tools...

where git >nul 2>&1 || goto ERROR_GIT
where dotnet >nul 2>&1 || goto ERROR_DOTNET
where cloudflared >nul 2>&1 || goto ERROR_CLOUDFLARED
where vercel >nul 2>&1 || goto ERROR_VERCEL

if not exist "%FRONTEND%\.git" goto ERROR_FRONTEND
if not exist "%BACKEND%" goto ERROR_BACKEND

echo All tools found.
echo.

REM --------------------------------------------------
REM 2. UPDATE FRONTEND / GITHUB
REM --------------------------------------------------

echo [2/9] Updating GitHub...

cd /d "%FRONTEND%"

git add .
if errorlevel 1 goto ERROR_GIT_PUSH

git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Vedra Auto Deploy"
    if errorlevel 1 goto ERROR_GIT_PUSH
) else (
    echo No new changes to commit.
)

git push origin main
if errorlevel 1 goto ERROR_GIT_PUSH

echo GitHub updated.
echo.

REM --------------------------------------------------
REM 3. CHECK / START API
REM --------------------------------------------------

echo [3/9] Starting API Server...

powershell -NoProfile -Command "if (Test-NetConnection 127.0.0.1 -Port %API_PORT% -InformationLevel Quiet) { exit 0 } else { exit 1 }" >nul 2>&1

if errorlevel 1 (
    start "Vedra API" cmd /k "cd /d %BACKEND% && dotnet run --no-launch-profile --urls http://0.0.0.0:%API_PORT%"
) else (
    echo API port already active. Reusing existing server.
)

REM Wait for API to listen
set /a TRY=0

:API_WAIT
powershell -NoProfile -Command "if (Test-NetConnection 127.0.0.1 -Port %API_PORT% -InformationLevel Quiet) { exit 0 } else { exit 1 }" >nul 2>&1

if not errorlevel 1 goto API_READY

set /a TRY+=1
if !TRY! GEQ 30 goto ERROR_API

timeout /t 2 /nobreak >nul
goto API_WAIT

:API_READY
echo API is listening on port %API_PORT%.
echo.

REM --------------------------------------------------
REM 4. PREPARE CLOUDFLARE TUNNEL
REM --------------------------------------------------

echo [4/9] Starting Cloudflare Tunnel...

del "%LOG_OUT%" 2>nul
del "%LOG_ERR%" 2>nul

powershell -NoProfile -Command "$exe=(Get-Command cloudflared).Source; Start-Process -FilePath $exe -ArgumentList 'tunnel','--url','http://127.0.0.1:%API_PORT%','--no-autoupdate' -RedirectStandardOutput '%LOG_OUT%' -RedirectStandardError '%LOG_ERR%' -PassThru | Out-Null"

if errorlevel 1 goto ERROR_TUNNEL

REM --------------------------------------------------
REM 5. EXTRACT PUBLIC URL
REM --------------------------------------------------

echo [5/9] Waiting for public Tunnel URL...

set "TUNNEL_URL="
set /a TRY=0

:TUNNEL_WAIT

for /f "usebackq delims=" %%U in (`powershell -NoProfile -Command "$files=@('%LOG_OUT%','%LOG_ERR%'); $m=[regex]::Match((Get-Content $files -Raw -ErrorAction SilentlyContinue) -join ' ','https://[a-zA-Z0-9-]+\.trycloudflare\.com'); if($m.Success){$m.Value}"`) do set "TUNNEL_URL=%%U"

if defined TUNNEL_URL goto TUNNEL_READY

set /a TRY+=1
if !TRY! GEQ 30 goto ERROR_TUNNEL

timeout /t 2 /nobreak >nul
goto TUNNEL_WAIT

:TUNNEL_READY

echo.
echo Tunnel URL:
echo !TUNNEL_URL!
echo.

set "API_URL=!TUNNEL_URL!/api"

REM --------------------------------------------------
REM 6. TEST PUBLIC CONNECTION
REM --------------------------------------------------

echo [6/9] Testing public API connection...

set /a TRY=0

:PUBLIC_TEST

powershell -NoProfile -Command "try { $r=Invoke-WebRequest -Uri '%API_URL%' -UseBasicParsing -TimeoutSec 8; if([int]$r.StatusCode -lt 500){exit 0}else{exit 1} } catch { if($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -lt 500){exit 0}; exit 1 }" >nul 2>&1

if not errorlevel 1 goto PUBLIC_READY

set /a TRY+=1
if !TRY! GEQ 10 goto ERROR_PUBLIC

timeout /t 3 /nobreak >nul
goto PUBLIC_TEST

:PUBLIC_READY
echo Public API connection successful.
echo.

REM --------------------------------------------------
REM 7. UPDATE VERCEL ENVIRONMENT VARIABLE
REM --------------------------------------------------

echo [7/9] Updating Vercel Environment...

cd /d "%FRONTEND%"

echo Updating VITE_API_URL...

echo(!API_URL!| vercel env update VITE_API_URL production --type config --yes

if errorlevel 1 (
    echo Update failed. Trying to add the variable...
    echo(!API_URL!| vercel env add VITE_API_URL production --type config --yes
    if errorlevel 1 goto ERROR_VERCEL_ENV
)

echo Vercel environment updated.
echo.

REM --------------------------------------------------
REM 8. PRODUCTION DEPLOYMENT
REM --------------------------------------------------

echo [8/9] Deploying Vedra to Vercel...

vercel --prod --yes

if errorlevel 1 goto ERROR_DEPLOY

echo.
echo Production deployment successful.
echo.

REM --------------------------------------------------
REM 9. OPEN WEBSITE
REM --------------------------------------------------

echo [9/9] Opening Vedra...

start "" "%SITE%"

echo.
echo ==================================================
echo             DEPLOYMENT SUCCESS
echo ==================================================
echo.
echo Frontend : %SITE%
echo Backend  : !API_URL!
echo Port     : %API_PORT%
echo.
echo API and Tunnel are still running.
echo Do not close their processes.
echo.
pause
exit /b 0

REM ==================================================
REM ERROR HANDLERS
REM ==================================================

:ERROR_GIT
echo ERROR: Git is not installed or not in PATH.
goto FAILED

:ERROR_DOTNET
echo ERROR: .NET SDK is not installed.
goto FAILED

:ERROR_CLOUDFLARED
echo ERROR: Cloudflared is not installed.
goto FAILED

:ERROR_VERCEL
echo ERROR: Vercel CLI is not installed.
goto FAILED

:ERROR_FRONTEND
echo ERROR: Frontend project folder not found.
goto FAILED

:ERROR_BACKEND
echo ERROR: Backend project folder not found.
goto FAILED

:ERROR_GIT_PUSH
echo ERROR: Git commit or push failed.
goto FAILED

:ERROR_API
echo ERROR: API did not start on port %API_PORT%.
goto FAILED

:ERROR_TUNNEL
echo ERROR: Cloudflare Tunnel URL not found.
echo Check these logs:
echo %LOG_OUT%
echo %LOG_ERR%
goto FAILED

:ERROR_PUBLIC
echo ERROR: Public API connection failed.
goto FAILED

:ERROR_VERCEL_ENV
echo ERROR: Cannot update Vercel environment variable.
goto FAILED

:ERROR_DEPLOY
echo ERROR: Vercel deployment failed.
goto FAILED

:FAILED
echo.
echo ==================================================
echo               DEPLOYMENT FAILED
echo ==================================================
echo.
pause
exit /b 1
