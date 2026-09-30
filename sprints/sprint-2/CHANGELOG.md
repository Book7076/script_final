# 📋 Sprint 2 Changelog

All notable technical updates and milestones achieved during **Sprint 2: Back-End Engine & Business Logic (2026-09-25)**.

Aligned with course **CP352301 Script Programming** (Semester 1/2569).

---

## [0.2.0] - Sprint 2: Back-End Engine & Business Logic (2026-09-25)

### 🚀 Added
- **FastAPI Core & Modular Routing:**
  - Expanded `backend/app/main.py` with routers:
    - `backend/app/routes/movies.py`: Endpoints for trending movies, top-rated movies, search by title, and movie details.
    - `backend/app/routes/watchlist.py`: Full CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`), watchlist statistics (`/api/watchlist/stats`), and file export endpoints.
    - `backend/app/routes/sentiment.py`: Standalone sentiment evaluation endpoint (`/api/sentiment/analyze`).
- **TMDB API Client & Fallback Engine:**
  - Implemented OOP `TMDBClient` in `backend/app/services/tmdb_client.py` wrapping TMDB v3 API.
  - Implemented embedded Mock Movie Catalog for seamless offline execution and network fallback.
- **NLP Sentiment Engine with Hyperbolic Tangent ($\tanh$):**
  - Implemented `SentimentAnalyzer` in `backend/app/services/sentiment_analyzer.py`.
  - Tokenization, valence score accumulation, and sliding window negation detection (e.g., *"not good"*, *"never boring"*).
  - Mathematical normalization via Hyperbolic Tangent ($\tanh$) to smoothly bound Vibe Scores within the range $[0\%, 100\%]$.
- **Watchlist Repository & Data Exporting Pipeline:**
  - Implemented `backend/app/services/watchlist_repo.py` handling DB queries with SQLAlchemy ORM.
  - Added CSV Export endpoint (`/api/watchlist/export/csv`) streaming formatted movie records.
  - Added JSON Export endpoint (`/api/watchlist/export/json`) generating structured JSON file downloads.
- **Automated Unit & Integration Test Suite:**
  - Built comprehensive `pytest` test suite in `backend/tests/` covering API routes, sentiment analyzer, TMDB client, and repository.

### 👥 Team Allocation (Sprint 2 - Role Rotation)
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

### 📂 Files Delivered in Sprint 2
* `backend/app/schemas.py` — Pydantic request & response schemas
* `backend/app/services/__init__.py` — Services package initializer
* `backend/app/services/tmdb_client.py` — TMDB Client & Mock Catalog Fallback
* `backend/app/services/sentiment_analyzer.py` — NLP Sentiment Analyzer with tanh
* `backend/app/services/watchlist_repo.py` — Watchlist database repository
* `backend/app/routes/__init__.py` — Routes package initializer
* `backend/app/routes/movies.py` — Movie catalog & search API endpoints
* `backend/app/routes/watchlist.py` — Watchlist CRUD & export API endpoints
* `backend/app/routes/sentiment.py` — Text sentiment analysis API endpoint
* `backend/tests/test_api_routes.py` — API routes test cases
* `backend/tests/test_tmdb_client.py` — TMDB client test cases
* `backend/tests/test_sentiment_analyzer.py` — NLP sentiment analyzer test cases
* `backend/tests/test_watchlist_repo.py` — Database repository test cases
* `sprints/sprint-2/README.md` — Sprint 2 Report
* `sprints/sprint-2/IMDB_at_home_sprint2.ipynb` — Sprint 2 Notebook
