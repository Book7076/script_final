# 📋 Sprint 3 Changelog

All notable technical updates and milestones achieved during **Sprint 3: Full-Stack Integration & Edge Case Resilience (2026-10-02)**.

Aligned with course **CP352301 Script Programming** (Semester 1/2569).

---

## [1.0.0] - Sprint 3: Full-Stack Integration & Edge Case Resilience (2026-10-02)

### 🚀 Added
- **Full-Stack Integration Wiring:**
  - Integrated React.js frontend with FastAPI backend through `frontend/src/services/api.js`.
  - Added interactive UI components (Cinematic Dark-Mode Glassmorphism):
    - `Navbar.jsx`: Real-time title search bar, TMDB API Key settings modal trigger, navigation tabs.
    - `MovieCard.jsx`: Movie poster display, release year, TMDB rating gauge, dynamic Sentiment Vibe badge.
    - `MovieDetailModal.jsx`: Comprehensive movie profile modal displaying overview, cast, user reviews, and sentiment breakdown.
    - `WatchlistManager.jsx`: Watchlist table supporting inline status updates, 1–10 star ratings, personal notes, and CSV/JSON export buttons.
    - `AnalyticsDashboard.jsx`: Dynamic personal statistics visualizing watch habits, favorite genres, and mood distributions.
    - `SentimentStudio.jsx`: Interactive NLP playground allowing free-form text sentiment evaluation.
    - `ApiKeyModal.jsx`: Modal for dynamic TMDB v3 API Key injection with browser `localStorage` persistence.
- **Resilience & Auto-Recovery Mechanisms:**
  - **Database Auto-Recovery:** Automatic SQLite initialization (`init_db()`) and table generation if `imdb_home.db` is missing or corrupted.
  - **Boundary Validation:** Enforced input validation preventing negative or out-of-range ratings (0–10) on both client form and Pydantic schema.
  - **Empty Query Sanitization:** Implemented query whitespace stripping (`.strip()`) to guard against empty API search requests.
  - **Graceful Network Degradation:** Built visual toast notification banners to notify users if the backend server disconnects without causing a blank screen crash.

### 👥 Team Allocation (Sprint 3 - Role Rotation)
- **กุลศยา จันภูงา:** Planner & Architect (Integration Specification, Live Demo Plan, DoD)
- **บวรนันต์ ตะบองทอง:** Planner & Full-Stack Architect (UI/UX to API Wiring, Data Consistency)
- **กิตติธัช ปลั่งกลาง:** Core Full-Stack Developer (React State, CRUD, BLL Calls)
- **ไชยวัฒน์ แจ่มกลาง:** QA Debugger & Tester (Edge Case Testing, Resilience Verification, PR Review)

### 🔄 Changed
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

### 📂 Files Delivered in Sprint 3
* `frontend/src/services/api.js` — Axios API service connecting React to FastAPI
* `frontend/src/utils/translations.js` — Translation & mood dictionary helpers
* `frontend/src/App.jsx` — Main Application component & global state management
* `frontend/src/App.css` — Cinematic styling & animations
* `frontend/src/components/Navbar.jsx` — Header navigation & live search
* `frontend/src/components/MovieCard.jsx` — Card with poster & Sentiment Vibe gauge
* `frontend/src/components/MovieDetailModal.jsx` — Modal with movie info & review journal
* `frontend/src/components/WatchlistManager.jsx` — Watchlist management & CSV/JSON export
* `frontend/src/components/AnalyticsDashboard.jsx` — Watchlist stats & charts
* `frontend/src/components/SentimentStudio.jsx` — Interactive NLP playground
* `frontend/src/components/ApiKeyModal.jsx` — TMDB API Key settings modal
* `sprints/sprint-3/README.md` — Sprint 3 Report
* `sprints/sprint-3/IMDB_at_home_sprint3.ipynb` — Sprint 3 Notebook
* `CHANGELOG.md` — Consolidated Master Changelog (Sprint 1–3)
