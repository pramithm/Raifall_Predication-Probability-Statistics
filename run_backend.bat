@echo off
echo Starting RainRisk FastAPI Backend...
cd /d "%~dp0backend"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
