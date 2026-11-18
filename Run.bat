@echo off
echo Starting RainRisk Application...

start "RainRisk Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
start "RainRisk Frontend" cmd /k "cd frontend && npm run dev"
