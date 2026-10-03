@echo off
title StandupFlow Launcher

echo ========================================================
echo Starting StandupFlow System (Backend & Frontend)
echo ========================================================
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

echo [0/2] Synchronizing global configuration from config.ini...
powershell -ExecutionPolicy Bypass -File "%ROOT_DIR%sync-config.ps1"
echo.

:: Determine Maven command (prefer local wrapper, then PATH, then fallback search)
set "MVN_CMD="

if exist "%BACKEND_DIR%\mvnw.cmd" (
    set "MVN_CMD=mvnw.cmd"
) else (
    where mvn >nul 2>nul
    if %ERRORLEVEL% equ 0 (
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

echo [1/2] Starting Spring Boot Backend using %MVN_CMD%...
start "StandupFlow Backend" cmd /k "cd /d "%BACKEND_DIR%" && echo Starting Backend... && %MVN_CMD% spring-boot:run"

echo [2/2] Starting React/Vite Frontend...
start "StandupFlow Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && echo Starting Frontend... && npm run dev"

echo.
echo ========================================================
echo Both Backend and Frontend startup processes initiated!
echo Config initialized from: %ROOT_DIR%config.ini
echo ========================================================
echo.
pause
