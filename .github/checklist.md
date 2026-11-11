# Development Checklist: Phase 1 Setup

## Environment & Scaffolding
- [x] Create repository folder structure (`backend/` and `frontend/`).
- [x] Create Python virtual environment and install `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`.
- [x] Initialize Vite React app in `frontend/` and install `@xyflow/react` and `tailwindcss`.

## Backend Implementation
- [x] Write `backend/database.py` (SQLite connection setup).
- [x] Write `backend/models.py` (`Equipment`, `Port`, `Connection` tables).
- [x] Write `backend/main.py` (FastAPI app, startup hooks, and routers).
- [x] Test FastAPI swagger docs at `http://localhost:8000/docs`.

## Frontend Implementation
- [x] Configure Tailwind CSS in Vite React app.
- [x] Create `frontend/src/App.jsx` with base React Flow layout.
- [x] Integrate backend API calls to fetch nodes and edges dynamically onto the canvas.

## Verification & Testing
- [x] Start FastAPI backend server (`uvicorn backend.main:app --reload`).
- [x] Start React frontend dev server (`npm run dev`).
- [ ] Create a sample Audio console, Video switcher, and IT switch, link them, and verify they render correctly on the canvas.