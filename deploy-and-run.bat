@echo off
setlocal EnableExtensions
title VEDRA - Auto Deploy

REM ============================================================
REM  Wrapper: Opens new CMD window with /k to keep it open
REM ============================================================
if /i "%~1"=="--inner" goto :inner

start "VEDRA Deploy" cmd /k ""%~f0" --inner"
exit /b

:inner
set "SELF=%~f0"
set "EXITCODE=0"

echo.
echo ===== Starting PowerShell deploy =====
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$f=$env:SELF;" ^
  "$a=Get-Content -LiteralPath $f;" ^
  "$i=[array]::IndexOf($a,'#<POWERSHELL>');" ^
  "if($i -lt 0){Write-Host 'PowerShell section missing' -ForegroundColor Red; exit 2};" ^
  "$tmp=Join-Path $env:TEMP ('VedraAutoDeploy-' + [guid]::NewGuid().ToString('N') + '.ps1');" ^
  "$scriptExit=0;" ^
  "try {" ^
  "  $a[($i+1)..($a.Length-1)] | Set-Content -LiteralPath $tmp -Encoding UTF8;" ^
  "  & $tmp;" ^
  "  if($null -ne $LASTEXITCODE){$scriptExit=$LASTEXITCODE}" ^
  "} catch {" ^
  "  Write-Host '';" ^
  "  Write-Host '===== ERROR =====' -ForegroundColor Red;" ^
  "  Write-Host $_ -ForegroundColor Red;" ^
  "  Write-Host '=================' -ForegroundColor Red;" ^
  "  $scriptExit=1" ^
  "} finally {" ^
  "  Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue" ^
  "};" ^
  "exit $scriptExit"

set "EXITCODE=%ERRORLEVEL%"

echo.
echo ===== Exit code: %EXITCODE% =====
echo.
echo Press any key to close this window...
pause >nul
exit /b %EXITCODE%


#<POWERSHELL>
$ErrorActionPreference = 'Stop'

$env:VERCEL_DISABLE_UPDATE_CHECK = '1'
$env:CI = '1'

# ============================================================
#  إعدادات المشروع (Vedra)
# ============================================================
$projectName  = 'vedra'
$apiDir       = 'D:\OnlinePlantStore.API'
$frontendDir  = 'D:\OnlinePlantStore.Frontend'
$port         = 5170
$stateFile    = Join-Path $env:TEMP 'VedraDeploy.state.json'

Write-Host '===== VEDRA AUTO DEPLOY =====' -ForegroundColor Cyan
Write-Host "API Dir      : $apiDir"
Write-Host "Frontend Dir : $frontendDir"
Write-Host "Port         : $port"

# ============================================================
#  التحقق من الأدوات
# ============================================================
$vercelCommand     = Get-Command vercel      -ErrorAction SilentlyContinue
$cloudflareCommand = Get-Command cloudflared -ErrorAction SilentlyContinue

if (!$vercelCommand)     { throw 'Vercel CLI not found.' }
if (!$cloudflareCommand) { throw 'cloudflared not found.' }

# ============================================================
#  1. رفع التعديلات على GitHub
# ============================================================
Write-Host ''
Write-Host '[1/6] Pushing to GitHub...' -ForegroundColor Yellow

Push-Location $frontendDir
try {
    git add .
    if ($LASTEXITCODE -ne 0) { throw 'git add failed.' }
    
    git commit -m "Auto Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    if ($LASTEXITCODE -ne 0) { Write-Host 'No changes to commit or commit failed.' -ForegroundColor Yellow }
    
    git push origin main
    if ($LASTEXITCODE -ne 0) { Write-Host 'Warning: git push failed or nothing to push.' -ForegroundColor Yellow }
}
finally { Pop-Location }

# ============================================================
#  2. بناء الـ API
# ============================================================
Write-Host ''
Write-Host '[2/6] Building API...' -ForegroundColor Yellow

Push-Location $apiDir
try {
    dotnet build -c Release
    if ($LASTEXITCODE -ne 0) { throw 'dotnet build failed.' }
}
finally { Pop-Location }

# ============================================================
#  3. تشغيل الـ API
# ============================================================
Write-Host ''
Write-Host '[3/6] Starting API...' -ForegroundColor Yellow

Get-Process -Name "OnlinePlantStore.API" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Start-Process -FilePath 'cmd.exe' -ArgumentList @(
    '/k',
    "cd /d `"$apiDir`" && dotnet run --no-build --urls http://0.0.0.0:$port"
)

$apiReady = $false
for ($n = 0; $n -lt 30; $n++) {
    Start-Sleep -Seconds 2
    try {
        $null = Invoke-RestMethod "http://localhost:$port/api/products" -TimeoutSec 3
        $apiReady = $true
        break
    } catch {}
}
if (!$apiReady) { throw 'API did not respond.' }
Write-Host 'API is ready.' -ForegroundColor Green

# ============================================================
#  4. تشغيل Cloudflare Tunnel والحصول على الرابط
# ============================================================
Write-Host ''
Write-Host '[4/6] Starting Cloudflare Tunnel...' -ForegroundColor Yellow

Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$logPath = Join-Path $env:TEMP ('VedraCloudflare-' + [guid]::NewGuid().ToString('N') + '.log')

$tunnelProc = Start-Process `
    -FilePath $cloudflareCommand.Source `
    -ArgumentList @(
        'tunnel',
        '--url', "http://localhost:$port",
        '--logfile', "`"$logPath`"",
        '--loglevel', 'info'
    ) `
    -PassThru -WindowStyle Hidden

$apiUrl = $null
for ($n = 0; $n -lt 60; $n++) {
    Start-Sleep -Seconds 2
    if ($tunnelProc.HasExited) {
        throw "Cloudflare exited. Check log: $logPath"
    }
    if (Test-Path $logPath) {
        $log = Get-Content -LiteralPath $logPath -Raw -ErrorAction SilentlyContinue
        if ($log -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
            $apiUrl = $Matches[0]
            break
        }
    }
}
if (!$apiUrl) { throw "Could not get Cloudflare URL. Check log: $logPath" }
Write-Host "Cloudflare URL: $apiUrl" -ForegroundColor Green

# ============================================================
#  5. تحديث Vercel Environment (باستخدام ملف .env.production)
# ============================================================
Write-Host ''
Write-Host '[5/6] Updating Vercel environment...' -ForegroundColor Yellow

$apiBaseUrl = "$apiUrl/api"

# اكتب ملف .env.production في مشروع الفرونت
$envFile = Join-Path $frontendDir '.env.production'
"VITE_API_URL=$apiBaseUrl" | Set-Content -LiteralPath $envFile -Encoding UTF8
Write-Host "Created .env.production with VITE_API_URL = $apiBaseUrl" -ForegroundColor Green

# حاول تحديث Vercel CLI (بس من غير ما نوقف السكريبت لو فشل)
Push-Location $frontendDir
try {
    Write-Host 'Removing old Vercel env variable...' -ForegroundColor Yellow
    vercel env rm VITE_API_URL production -y 2>&1 | Out-Null
    
    Write-Host 'Adding new Vercel env variable...' -ForegroundColor Yellow
    $apiBaseUrl | vercel env add VITE_API_URL production --type config 2>&1 | ForEach-Object { Write-Host "  $_" }
    
    Write-Host 'Environment updated (or already handled by .env.production)' -ForegroundColor Green
}
catch {
    Write-Host "Warning: Vercel CLI failed. Using .env.production fallback." -ForegroundColor Yellow
}
finally { Pop-Location }

# ============================================================
#  6. النشر على Vercel
# ============================================================
Write-Host ''
Write-Host '[6/6] Deploying to Vercel...' -ForegroundColor Yellow

Push-Location $frontendDir
try {
    vercel --prod --yes
    if ($LASTEXITCODE -ne 0) { throw 'Vercel deployment failed.' }
}
finally { Pop-Location }

# ============================================================
#  حفظ الحالة وفتح الموقع
# ============================================================
$newState = [pscustomobject]@{
    ProjectName = $projectName
    ApiUrl      = $apiBaseUrl
    Port        = $port
    UpdatedAt   = (Get-Date).ToString('o')
}
$newState | ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding UTF8

$siteUrl = "https://vedra-olive.vercel.app"
Start-Process $siteUrl

Write-Host ''
Write-Host '===== DEPLOYMENT FINISHED =====' -ForegroundColor Green
Write-Host "Frontend   : $siteUrl"
Write-Host "Backend    : $apiBaseUrl"
Write-Host "Vercel Proj: $projectName"
Write-Host ''
Write-Host 'Keep API and Tunnel running.'
exit 0