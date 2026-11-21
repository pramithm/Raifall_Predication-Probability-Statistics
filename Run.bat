@echo off
echo Starting RainRisk Application...

start "RainRisk Backend" /D "%~dp0backend" cmd /k "python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
start "RainRisk Frontend" /D "%~dp0frontend" cmd /k "npm run dev"
