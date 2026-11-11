# Production Topology Engine

A local-first web app for cataloging production equipment and mapping signal paths
across Audio, Video, DMX Lights, and IT Infrastructure.

## Current status

The Phase 1 foundation is implemented:

- FastAPI API with SQLite persistence and SQLAlchemy models for equipment, ports,
  and connections.
- Equipment, port, and connection API endpoints, including validation and
  cascading deletion.
- React/Vite frontend with a domain-filterable equipment inventory and
  React Flow canvas.
- Inventory category buttons can be combined; equipment in any selected category
  appears in both the inventory and canvas. Use **All**, or clear the last
  category, to show every device. On the canvas, unselected category sections
  and their signal paths are hidden. Uncategorized ports appear in All view.
- Add equipment from the sidebar; ports are automatically generated based on 
  input/output counts. Separate INPUT/OUTPUT ports for audio/video/DMX equipment;
  BIDIRECTIONAL ports for IT equipment (network switches, etc.).
- Connect compatible ports by dragging between them on the canvas.
- Signal paths require matching port categories and either output-to-input or
  bidirectional-to-bidirectional ports. To remove a signal, select its line on
  the canvas or choose it in the toolbar, then click **Delete selected signal**.
- Signal lines use their category color. Their labels show the destination/input
  and source/output as `device:port / device:port`: multi-word device names use
  initials and single-word names use their first four characters. Numbered ports
  show their trailing number; otherwise the port name is shown. Bidirectional
  connections use the stored destination and source order. Legacy connections
  with an ambiguous or mismatched category use a neutral gray line.
- Selected signal paths glow in their category color.
- Device positions and port information are saved to the API.
- Domain colors: Audio `#3b82f6`, Video `#10b981`, DMX `#f59e0b`, and IT `#8b5cf6`.
- Edit equipment properties and manage ports through the Equipment Editor modal.
- **NEW**: Automatic port generation! When you set input/output counts, ports 
  are created with the appropriate direction (input/output/bidirectional based on category).

Editing and deleting equipment or ports are available through the Equipment Editor modal or the API. 
Full visual verification and documentation now complete.

## Requirements

- Python 3.11 or newer
- Node.js 20.19+ or 22.12+
- npm

## Setup and run on Windows

Open two PowerShell terminals in the project root.

### 1. Set up and start the backend

Create a virtual environment and install the pinned Python dependencies:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Start the API from the project root:

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
```

The first startup creates the SQLite tables. By default, the database is
`production_flow.db` in the project root.

### 2. Set up and start the frontend

In the second terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Keep both development servers running while using
the app.

## API and configuration

- App: <http://localhost:5173>
- API health: <http://localhost:8000/api/health>
- Interactive API documentation: <http://localhost:8000/docs>

The frontend calls `http://localhost:8000` by default. Set `VITE_API_URL` before
starting Vite to use a different API origin. The backend reads `DATABASE_URL`;
if unset, it uses the project-root SQLite database described above.

Available API resources:

| Resource | Endpoints |
| --- | --- |
| Equipment | `GET/POST /api/equipment`, `GET/PUT/DELETE /api/equipment/{id}` |
| Ports | `GET/POST /api/ports`, `GET/PATCH/DELETE /api/ports/{id}` |
| Connections | `GET/POST /api/connections`, `GET/PATCH/DELETE /api/connections/{id}` |

## Checks

Run the backend tests from the project root:

```powershell
.\.venv\Scripts\python.exe -m pytest
```

Run frontend lint and production build from `frontend/`:

```powershell
npm run lint
npm run build
```

## Project layout

```text
backend/
  main.py                 FastAPI app and startup
  database.py             SQLAlchemy engine and SQLite setup
  models.py               Equipment, port, and connection models
  schemas.py              API request and response schemas
  routers/                Resource endpoints
  tests/                  API tests
frontend/
  src/App.jsx             Inventory and topology workspace
  src/components/         React Flow equipment nodes
  src/services/api.js     Backend API client
  src/domain.js           Domain labels and colors
```

See [`.github/plan.md`](.github/plan.md) and
[`.github/checklist.md`](.github/checklist.md) for Phase 1 progress.
