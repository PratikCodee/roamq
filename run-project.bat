@echo off
cd /d "%~dp0"

if not exist "%~dp0node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Dependency install failed.
        pause
        exit /b 1
    )
)

if not exist "%~dp0.env" (
    echo WARNING: .env not found. If Supabase is required, create a .env file in the project folder.
    echo Example:
    echo   VITE_SUPABASE_URL=your_url
    echo   VITE_SUPABASE_ANON_KEY=your_key
)

echo Starting project server...
start "RoamIQ Vite Server" /D "%~dp0" cmd /k "npm run dev -- --host 0.0.0.0"

echo Waiting for Vite to become ready...
for /l %%i in (1,1,30) do (
    curl.exe --silent --show-error --fail http://localhost:5173/ >nul 2>&1
    if not errorlevel 1 goto server_ready
    ping 127.0.0.1 -n 2 >nul
)

echo Could not connect to Vite at http://localhost:5173/
echo Check the RoamIQ Vite Server window for errors.
pause
exit /b 1

:server_ready
echo Opening project in your browser...
start "" http://localhost:5173/
