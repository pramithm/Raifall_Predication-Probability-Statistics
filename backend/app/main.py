from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router

app = FastAPI(
    title="RainRisk — Rainfall Probability & Flood Risk Analysis API",
    description=(
        "Backend REST service for the RainRisk Capstone Project. "
        "Provides statistical data processing, empirical probability calculation, "
        "Wilson score confidence intervals, and anomaly detection for historical rainfall."
    ),
    version="1.0.0"
)

# Enable CORS for local Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "project": "RainRisk — Rainfall Probability & Flood Risk Analysis",
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
