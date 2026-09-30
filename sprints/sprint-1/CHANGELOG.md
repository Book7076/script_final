# 📋 Sprint 1 Changelog

All notable technical updates and milestones achieved during **Sprint 1: Project Pitch, Architecture & Foundation (2026-09-18)**.

Aligned with course **CP352301 Script Programming** (Semester 1/2569).

---

## [0.1.0] - Sprint 1: Project Pitch, Architecture & Foundation (2026-09-18)

### 🚀 Added
- **Project Foundation & 3-Layer Architecture:**
  - Selected project domain: **Data Analysis & Management / Daily Apps** (Movie Sentiment & Watchlist Manager).
  - Designed 3-tier architecture:
    1. **Data Access Layer (DAL):** SQLite (`imdb_home.db`) with SQLAlchemy ORM (`WatchlistItem` schema) and File I/O planning.
    2. **Business Logic Layer (BLL):** Python FastAPI initialization, CORS middleware, and application settings.
    3. **Presentation Layer (PL):** React.js + Vite + Tailwind CSS initial foundation and layout structure.
- **Use Cases Specification:**
  - Defined 12 Use Cases covering 10 MVP Core Features (UC-01 to UC-10) and 2 Stretch Features (UC-11 Smart Mood Recommendation, UC-12 Backup & Restore).
- **Tooling & Infrastructure Setup:**
  - Established Git repository structure and virtual environment setup instructions.
  - Configured automated CI/CD pipeline via GitHub Actions (`.github/workflows/ci.yml`).
  - Configured PEP 8 linting rules in `backend/.flake8` (0 syntax/format errors).
  - Created dependency management files (`backend/requirements.txt`, `frontend/package.json`).

### 👥 Team Allocation (Sprint 1)
- **บวรนันต์ ตะบองทอง:** Chief Systems Architect (3-Layer Architecture, OOP Class Hierarchy, DoD, `PLAN.md`)
- **กิตติธัช ปลั่งกลาง:** Technical Planner & Infrastructure Lead (Repository structure, venv, GitHub Actions CI/CD)
- **ไชยวัฒน์ แจ่มกลาง:** Core Developer Backend (FastAPI initialization, TMDB API planning, SQLite Schema design)
- **กุลศยา จันภูงา:** Core Developer Frontend & QA (React wireframe setup, Pytest framework setup, basic Exception handling)

### 🐛 Fixed
- **Query Sanitization:** Handled leading/trailing whitespace and inconsistent casing in search terms using `.strip().lower()`.

### 🧪 Tested
- **Sprint 1 Quality Assurance Verification:**
  - Keyword search API query parsing (`PASSED`)
  - Whitespace and casing normalization (`PASSED`)
  - Unhandled exception trapping with `try-except` (`PASSED`)
  - SQLite database table initialization via `init_db()` (`PASSED`)

---

### 📂 Files Delivered in Sprint 1
* `.github/workflows/ci.yml` — Automated CI workflow
* `backend/.flake8` — PEP 8 style guide configuration
* `backend/.env.example` — Environment variables template
* `backend/requirements.txt` — Python dependencies
* `backend/app/__init__.py` — Application package initializer
* `backend/app/config.py` — Application configuration & environment settings
* `backend/app/database.py` — SQLAlchemy DB engine, Base, and `init_db()`
* `backend/app/models.py` — `WatchlistItem` ORM model
* `backend/app/main.py` — FastAPI application entry point & CORS configuration
* `backend/tests/__init__.py` — Test package initializer
* `frontend/package.json` — Frontend dependencies
* `frontend/vite.config.js` — Vite build tool configuration
* `frontend/tailwind.config.js` — Tailwind CSS configuration
* `frontend/postcss.config.js` — PostCSS configuration
* `frontend/index.html` — HTML root template
* `frontend/src/main.jsx` — React root mount point
* `frontend/src/index.css` — Global styles
* `sprints/sprint-1/README.md` — Sprint 1 Report & Pitch
* `sprints/sprint-1/IMDB_at_home_sprint1.ipynb` — Sprint 1 Notebook
