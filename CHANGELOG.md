# 📋 Changelog

All notable changes to the **IMDB at home (Movie Sentiment & Watchlist Manager)** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) aligned with course Sprint Milestones (CP352301 Script Programming).

---

## [1.0.0] - Sprint 3: Full-Stack Integration & Edge Case Resilience (2026-10-02)

### 🚀 Added
- **Full-Stack Integration Wiring:**
  - Integrated React.js frontend with FastAPI backend through `frontend/src/services/api.js`.
  - Added interactive UI components:
    - `Navbar.jsx`: Real-time title search bar, TMDB API Key settings modal trigger, navigation tabs.
    - `MovieCard.jsx`: Movie poster display, release year, TMDB rating gauge, dynamic Sentiment Vibe badge.
    - `MovieDetailModal.jsx`: Comprehensive movie profile modal displaying overview, cast, user reviews, and sentiment breakdown.
    - `WatchlistManager.jsx`: Watchlist table supporting inline status updates, 1–10 star ratings, personal notes, and CSV/JSON export buttons.
    - `AnalyticsDashboard.jsx`: Dynamic personal statistics visualizing watch habits, favorite genres, and mood distributions.
    - `SentimentStudio.jsx`: Interactive NLP playground allowing free-form text sentiment evaluation.
    - `ApiKeyModal.jsx`: Modal for dynamic TMDB v3 API Key injection with browser `localStorage` persistence.
- **Resilience & Auto-Recovery Mechanisms:**
  - **Database Auto-Recovery:** Automatic SQLite initialization (`init_db()`) and table generation if `imdb_home.db` is missing or corrupted.
  - **Boundary Validation:** Enforced input validation preventing negative or out-of-range ratings ($0–10$) on both client form and Pydantic schema.
  - **Empty Query Sanitization:** Implemented query whitespace stripping (`.strip()`) to guard against empty API search requests.
  - **Graceful Network Degradation:** Built visual toast notification banners to notify users if the backend server disconnects without causing a blank screen crash.

### 🔄 Changed
- **Sprint 3 Role Rotation:**
  - **กุลศยา จันภูงา:** Planner & Architect (Integration Specification, Live Demo Plan, DoD)
  - **บวรนันต์ ตะบองทอง:** Planner & Full-Stack Architect (UI/UX to API Wiring, Data Consistency)
  - **กิตติธัช ปลั่งกลาง:** Core Full-Stack Developer (React State, CRUD, BLL Calls)
  - **ไชยวัฒน์ แจ่มกลาง:** QA Debugger & Tester (Edge Case Testing, Resilience Verification, PR Review)
- **State Management:**
  - Implemented Optimistic UI updates paired with background database synchronization to guarantee immediate visual feedback and persistent data consistency.
- **Sorting & Filtering:**
  - Connected frontend UI sorting controls directly to backend Vibe Score and TMDB rating sort algorithms.

### 🐛 Fixed
- **Data Desynchronization:** Resolved an issue where rapid consecutive updates to movie status caused frontend React state to diverge from SQLite database records.

### 🧪 Tested
- **8 Sprint 3 Integration Test Scenarios (TC01–TC08):**
  - TC01: Full-Stack Add to Watchlist (`PASSED`)
  - TC02: Data Consistency on Refresh (`PASSED`)
  - TC03: Missing DB Auto-Recovery (`PASSED`)
  - TC04: Invalid Negative Rating Rejection (`PASSED`)
  - TC05: Empty Search Sanitization (`PASSED`)
  - TC06: High-to-Low Vibe Score Sorting (`PASSED`)
  - TC07: Server Disconnect Error Handling (`PASSED`)
  - TC08: Automated Test Suite via `pytest` (`24 passed, 100%`)

---

## [0.2.0] - Sprint 2: Back-End Engine & Business Logic (2026-09-25)

### 🚀 Added
- **FastAPI Core & Routing:**
  - Configured FastAPI application in `backend/app/main.py` with permissive CORS middleware.
  - Created modular routers:
    - `routes/movies.py`: Endpoints for `/api/movies/trending`, `/api/movies/top-rated`, `/api/movies/search`, and `/api/movies/{id}`.
    - `routes/watchlist.py`: Full CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`), summary analytics (`/api/watchlist/stats`), and file export endpoints.
    - `routes/sentiment.py`: Standalone text analysis endpoint (`/api/sentiment/analyze`).
- **TMDB API Client & Fallback Engine:**
  - Created `TMDBClient` class in `backend/app/services/tmdb_client.py` wrapping TMDB v3 API.
  - Implemented embedded Mock Movie Catalog for seamless offline execution and network fallback.
- **NLP Sentiment Engine with Hyperbolic Tangent ($\tanh$):**
  - Created `SentimentAnalyzer` in `backend/app/services/sentiment_analyzer.py`.
  - Tokenization, valence score accumulation, and sliding window negation detection (e.g., *"not good"*, *"never boring"*).
  - Mathematical normalization via Hyperbolic Tangent ($\tanh$) to smoothly bound Vibe Scores within the range $[0\%, 100\%]$.
- **Data Exporting Pipeline:**
  - Added `/api/watchlist/export/csv` streaming CSV formatted movie data.
  - Added `/api/watchlist/export/json` generating structured JSON downloads.

### 🔄 Changed
- **Sprint 2 Role Rotation:**
  - **ไชยวัฒน์ แจ่มกลาง:** Planner & Architect (Backend DoD, API Schema Design, Data Export Pipeline)
  - **กุลศยา จันภูงา:** Planner & Quality Coordinator (Sprint Planning, QA Criteria, Progress Documentation)
  - **บวรนันต์ ตะบองทอง:** Core Back-End Developer (FastAPI Core, TMDB Client, Fallback & Export)
  - **กิตติธัช ปลั่งกลาง:** QA Debugger & Tester (NLP Sentiment $\tanh$ Module, Automated Pytest Suite)

### 🐛 Fixed
- **Valence Score Overflow:** Fixed unbounded score accumulation on lengthy movie overviews by introducing $\tanh$ scaling, guaranteeing bounded scores between 0% and 100%.

### 🧪 Tested
- **8 Sprint 2 Test Cases (TC01–TC08):**
  - TC01: TMDB API Integration (`PASSED`)
  - TC02: Offline Mock Fallback (`PASSED`)
  - TC03: Positive Text Sentiment Evaluation (`PASSED`)
  - TC04: Negation Sliding Window Inversion (`PASSED`)
  - TC05: Tanh Normalization Boundary Verification (`PASSED`)
  - TC06: CSV Watchlist Export (`PASSED`)
  - TC07: JSON Watchlist Export (`PASSED`)
  - TC08: Automated Test Suite with `pytest` (`24 passed, 100%`)

---

## [0.1.0] - Sprint 1: Project Pitch, Architecture & Foundation (2026-09-18)

### 🚀 Added
- **Project Foundation & 3-Layer Architecture:**
  - Selected project domain: **Data Analysis & Management / Daily Apps**.
  - Designed 3-tier architecture:
    1. Data Access Layer (DAL): SQLite (`imdb_home.db`) with SQLAlchemy ORM & File I/O.
    2. Business Logic Layer (BLL): Python FastAPI REST API.
    3. Presentation Layer (PL): React.js + Tailwind CSS.
- **Use Cases Specification:**
  - Defined 12 Use Cases covering 10 MVP Core Features (UC-01 to UC-10) and 2 Stretch Features (UC-11 Smart Mood Recommendation, UC-12 Backup & Restore).
- **Tooling & Infrastructure:**
  - Set up GitHub repository structure and virtual environment setup documentation.
  - Configured CI/CD pipeline via GitHub Actions (`.github/workflows/ci.yml`).
  - Configured PEP 8 linting rules in `backend/.flake8`.

### 👥 Team Allocation (Sprint 1)
- **บวรนันต์ ตะบองทอง:** Chief Systems Architect (3-Layer Architecture, OOP Class Hierarchy, DoD)
- **กิตติธัช ปลั่งกลาง:** Technical Planner & Infrastructure Lead (Repository, venv, GitHub Actions CI/CD)
- **ไชยวัฒน์ แจ่มกลาง:** Core Developer Backend (FastAPI initialization, TMDB API planning, SQLite Schema)
- **กุลศยา จันภูงา:** Core Developer Frontend & QA (React Wireframes, Pytest framework setup)

### 🐛 Fixed
- **Query Sanitization:** Handled leading/trailing whitespace and inconsistent casing in search terms using `.strip().lower()`.

### 🧪 Tested
- **Sprint 1 Quality Assurance Verification:**
  - Keyword search API query parsing (`PASSED`)
  - Whitespace and casing normalization (`PASSED`)
  - Unhandled exception trapping (`PASSED`)
  - SQLite database table initialization (`PASSED`)
