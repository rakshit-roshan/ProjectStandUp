@echo off
title StandupFlow Launcher
setlocal EnableDelayedExpansion

echo ========================================================
echo Starting StandupFlow System (Build and Run)
echo ========================================================
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

echo [1/4] Synchronizing global configuration from config.ini...
powershell -ExecutionPolicy Bypass -File "%ROOT_DIR%sync-config.ps1"
echo.

:: Determine Maven command (prefer local wrapper, then PATH, then fallback search)
set "MVN_CMD="

if exist "%BACKEND_DIR%\mvnw.cmd" (
    set "MVN_CMD=%BACKEND_DIR%\mvnw.cmd"
) else (
    where mvn >nul 2>nul
    if !ERRORLEVEL! equ 0 (
        set "MVN_CMD=mvn"
    ) else (
        for /f "delims=" %%I in ('dir /b /s "%USERPROFILE%\.m2\wrapper\dists\mvn.cmd" 2^>nul') do (
            set "MVN_CMD="%%I""
        )
    )
)

if "%MVN_CMD%"=="" (
    echo [ERROR] Maven not found! Please install Maven or add it to PATH.
    pause
    exit /b 1
)

echo [2/4] Building Spring Boot Backend (compiling fresh changes)...
cd /d "%BACKEND_DIR%"
call "%MVN_CMD%" clean compile
if !ERRORLEVEL! neq 0 (
    echo.
    echo [ERROR] Backend build failed! Please check Java errors above.
    pause
    exit /b 1
)
echo [Backend Build OK]
echo.

echo [3/4] Building React/Vite Frontend (bundling fresh changes)...
cd /d "%FRONTEND_DIR%"
call npm run build
if !ERRORLEVEL! neq 0 (
    echo.
    echo [ERROR] Frontend build failed! Please check Vite/JS errors above.
    pause
    exit /b 1
)
echo [Frontend Build OK]
echo.

echo [4/4] Launching StandupFlow Backend and Frontend Services...
start "StandupFlow Backend" cmd /k "cd /d "%BACKEND_DIR%" && echo Starting Backend... && "%MVN_CMD%" spring-boot:run"
start "StandupFlow Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && echo Starting Frontend... && npm run dev"

echo.
echo ========================================================
echo Both Backend and Frontend built and started successfully!
echo Config initialized from: %ROOT_DIR%config.ini
echo ========================================================
echo.
pause
