# Project Instructions: Production Topology Engine (systemflow-inspired)

## Project Overview
A self-hosted, local-first web application for documenting, visualizing, and managing multi-domain production environments (**Audio, Video, DMX Lights, and IT Infrastructure**). Inspired by lightweight diagram-as-code tools like `systemflow`. 'systemflow' can be found at [https://github.com/agamecat/systemflow]

---

## Technology Stack
- **Backend:** Python 3.11+ with FastAPI, Pydantic v2, and SQLAlchemy.
- **Database:** SQLite (`production_flow.db`) with zero-config relational integrity.
- **Frontend:** React (Vite), Tailwind CSS, and **React Flow** for the interactive canvas.
- **State & Data:** JSON/YAML export-export support alongside persistent SQLite storage.

---

## Domain Color Coding & Styling
All UI components and canvas nodes must adhere to domain-specific styling:
- **Audio:** Electric Blue (`#3b82f6`)
- **Video:** Emerald Green (`#10b981`)
- **DMX Lights:** Amber / Orange (`#f59e0b`)
- **IT Infrastructure:** Purple / Slate (`#8b5cf6`)

---

## Coding Rules for Copilot
1. **Modular Code:** Keep FastAPI routers in `/backend/routers/` and database models in `/backend/models.py`. Keep React Flow custom nodes isolated in `/frontend/src/components/`.
2. **Type Safety:** Use strict Python type hints and Pydantic schemas for all API payloads.
3. **Clean Architecture:** Avoid massive monolithic files. Keep backend services decoupled and frontend canvas interactions reactive.