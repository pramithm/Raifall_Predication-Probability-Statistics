@echo off
echo ===================================================
echo Starting RainRisk Backend and Frontend Services...
echo ===================================================
echo.

echo Launching FastAPI Backend (Port 8000)...
start "RainRisk Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo Launching Vite React Frontend (Port 5173)...
start "RainRisk Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both services are now running!
echo  - Backend API: http://127.0.0.1:8000
echo  - Frontend Web App: http://localhost:5173
echo.
