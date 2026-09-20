@echo off
REM Atalho pra iniciar o site do portfolio (Andril)
REM Duplo-clique aqui e depois abra http://localhost:3000 no navegador.
title STUDIO Portfolio - servidor local
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo.
echo ==============================================
echo   Iniciando o site... aguarde alguns segundos
echo   Depois abra:  http://localhost:3000
echo   Para PARAR: feche esta janela ou tecle Ctrl+C
echo ==============================================
echo.
call npm run dev
pause
