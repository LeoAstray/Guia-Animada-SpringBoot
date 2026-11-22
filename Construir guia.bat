@echo off
chcp 65001 >nul
cd /d "%~dp0"
python construir.py
if errorlevel 1 (
  echo.
  echo Algo ha fallado. Comprueba que Python esta instalado: python --version
)
echo.
pause
