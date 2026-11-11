# Implementation Plan: Phase 1 - Core Topology & Routing Engine

## Goal
Build and run a local-first web application where users can define equipment across Audio, Video, DMX, and IT domains, create ports, connect them, and visualize them on an interactive React Flow canvas.

---

## Phase 1 Breakdown

### 1. Backend Foundation (FastAPI & SQLAlchemy)
- [x] Initialize FastAPI app with CORS middleware and SQLite database session management.
- [x] Create SQLAlchemy models for `Equipment` (with CategoryEnum: Audio, Video, DMX, IT) and `Ports`.
- [x] Create SQLAlchemy model for `Connections` (linking source ports to destination ports with cable/signal labels).
- [x] Implement CRUD API endpoints for equipment inventory, port management, and connection links.

### 2. Frontend Infrastructure (Vite, React, Tailwind, React Flow)
- [x] Set up Vite React project with Tailwind CSS and `@xyflow/react`.
- [x] Build API service layer (`axios` or `fetch`) to communicate with FastAPI backend.
- [ ] Build sidebar component to add/edit equipment and filter by production domain.

### 3. Interactive Canvas & Routing Visualization
- [x] Implement React Flow canvas rendering equipment nodes color-coded by domain category.
- [x] Render connecting edges with signal labels (e.g., Dante, SDI, ArtNet, Ethernet).
- [x] Add state synchronization so adding equipment or links updates the canvas in real time.