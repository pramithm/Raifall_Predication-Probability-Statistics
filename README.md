# RAINRISK — Rainfall Probability & Flood Risk Analysis

A web-based capstone project developed as part of the **Probability & Statistics** course. RAINRISK brings rainfall analysis and flood-risk assessment together in an interactive dashboard, with a separate API backend and web frontend.

> **Project repository:** https://github.com/pramithm/Raifall_Predication-Probability-Statistics

## Overview

Rainfall patterns are important inputs when assessing the possibility of flooding. This project provides a software platform for exploring rainfall-related information and presenting probability and flood-risk analysis in an accessible dashboard.

The application is organised into two main services:

- **Backend:** a Python API built with FastAPI.
- **Frontend:** a React application served during development with Vite.

The repository also contains data, scripts, supporting project information, a capstone report, and a presentation.

## Project objectives

- Apply concepts from probability and statistics to rainfall and flood-risk analysis.
- Organise rainfall-related data for analysis and presentation.
- Provide a web dashboard for interacting with the project.
- Expose backend functionality through an API.
- Make the application straightforward to run locally for demonstration and evaluation.

## Technology stack

| Component | Technology |
|---|---|
| Backend API | Python, FastAPI, Uvicorn |
| Frontend | React, Vite, JavaScript ecosystem |
| API documentation | FastAPI Swagger UI |
| Backend testing | Pytest |
| Version control | Git and GitHub |

## Repository structure

```text
Raifall_Predication-Probability-Statistics/
│
├── backend/                         # FastAPI backend application
├── data/                            # Project datasets and data resources
├── frontend/                        # React + Vite frontend application
├── scratch/                         # Working files and experiments
├── scripts/                         # Supporting scripts
├── Information/                     # Supporting project information
├── HOW_TO_RUN.txt                   # Quick-start instructions
├── Rainfall_Flood_Risk_Redesigned.pptx
│                                    # Project presentation
├── Rainfall_Probability_Flood_Risk_Capstone_Report.docx
│                                    # Project report
├── Run                               # Project run helper
├── Run.bat                           # Windows run helper
├── run_all.bat                       # Starts the project services
├── run_backend.bat                   # Starts the backend
└── run_frontend.bat                  # Starts the frontend
```

*Folder contents may evolve as the project is updated. Refer to the repository for the latest files.*

## Prerequisites

Install the following before running the project:

- Python 3.10 or a compatible version supported by the backend dependencies.
- Node.js and npm.
- Git (optional, for cloning the repository).

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/pramithm/Raifall_Predication-Probability-Statistics.git
cd Raifall_Predication-Probability-Statistics
```

### 2. Start the backend

Open a terminal in the project root and run:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Alternatively, from the project root on Windows, run:

```bat
run_backend.bat
```

Backend address: <http://127.0.0.1:8000>

Interactive API documentation: <http://127.0.0.1:8000/docs>

### 3. Start the frontend

Open a **second terminal** in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Alternatively, from the project root on Windows, run:

```bat
run_frontend.bat
```

Frontend development address: <http://localhost:5173>

### 4. Run backend tests (optional)

From the project root:

```bash
cd backend
python -m pytest
```

### 5. Windows quick start

The repository includes Windows batch helpers. Check `HOW_TO_RUN.txt` for the maintained quick-start instructions. The documented workflow starts the backend and frontend in **two separate terminals**; the root-level `run_all.bat` helper is also included in the repository.

## Application workflow

At a high level, the application is organised as follows:

1. Start the FastAPI backend.
2. Start the React/Vite frontend.
3. Open the dashboard in a browser.
4. Use the available project interface to explore rainfall and flood-risk information.
5. The frontend communicates with the backend API for supported application operations.

The exact analyses, input fields, charts, and outputs are defined by the current implementation in the `backend/` and `frontend/` directories.

## Project resources

- **Capstone report:** `Rainfall_Probability_Flood_Risk_Capstone_Report.docx`
- **Presentation:** `Rainfall_Flood_Risk_Redesigned.pptx`
- **Run instructions:** `HOW_TO_RUN.txt`

## Academic context

**Course:** Probability & Statistics  
**Project:** Rainfall Probability & Flood Risk Analysis  
**Author:** Pramith Maredukonda

## Future enhancements

Potential areas for further development include:

- Integrating regularly updated rainfall datasets.
- Adding location-wise rainfall comparisons and historical trend visualisations.
- Extending statistical analysis with additional probability distributions and confidence measures.
- Improving flood-risk summaries with clearly documented thresholds and assumptions.
- Adding automated data validation and broader backend test coverage.
- Deploying the application so it can be accessed outside the local development environment.

## Disclaimer

This project is intended for academic and educational demonstration. Its outputs should not be treated as official weather forecasts, emergency alerts, or a substitute for information from authorised meteorological and disaster-management agencies.

## Author

**Pramith Maredukonda**  
GitHub: [@pramithm](https://github.com/pramithm)
