@echo off
REM Gera a versao final do site (pasta dist) pra subir no Netlify.
REM Duplo-clique aqui. Quando terminar, arraste a pasta "dist" no Netlify (Deploys > drag & drop).
title Gerar build - Andril Portfolio
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo.
echo ============================================
echo   Gerando o site final (pasta dist)...
echo ============================================
echo.
call npm run build
echo.
echo ============================================
echo   PRONTO! Agora arraste a pasta "dist"
echo   no Netlify para publicar.
echo ============================================
echo.
pause
