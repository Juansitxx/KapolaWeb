@echo off
echo Iniciando Galletas App - Desarrollo
echo ==================================

echo.
echo Iniciando Backend (Puerto 4000)...
start "Backend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Esperando 3 segundos para que el backend se inicie...
timeout /t 3 /nobreak > nul

echo.
echo Iniciando Frontend (Puerto 3000)...
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm start"

echo.
echo ==================================
echo Aplicacion iniciada!
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000
echo ==================================
pause

