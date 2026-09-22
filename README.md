# IMDB at home (Movie Sentiment & Watchlist Manager)

[![CI/CD Pipeline](https://github.com/your-username/imdb-at-home/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/imdb-at-home/actions/workflows/ci.yml)
[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![PEP 8](https://img.shields.io/badge/code%20style-PEP%208%20(flake8)-green.svg)](https://flake8.pycqa.org/)
[![Tests](https://img.shields.io/badge/tests-pytest%20(24%20passed)-brightgreen.svg)](https://docs.pytest.org/)

---

## 1. Project Title
**IMDB at home (Movie Sentiment & Watchlist Manager)**

## 2. Problem Statement
ผู้ใช้งานทั่วไปมักประสบปัญหาความยุ่งยากในการค้นหาภาพยนตร์ที่ตรงกับอารมณ์ความรู้สึกในขณะนั้น และขาดระบบจัดเก็บรายการภาพยนตร์ส่วนตัวที่บันทึกบทวิเคราะห์หรือความรู้สึกหลังรับชมได้อย่างเป็นระบบ ทำให้การตัดสินใจเลือกชมภาพยนตร์ใช้เวลานานและไม่ตรงกับความต้องการจริง

## 3. Proposed Solution
**IMDB at home** เป็น Full-Stack Web Application ที่ช่วยให้ผู้ใช้ค้นหาข้อมูลภาพยนตร์ ประเมินบรรยากาศของภาพยนตร์ผ่านระบบ Sentiment Analysis จากบทวิเคราะห์/เรื่องย่อ และจัดเก็บคลังภาพยนตร์ส่วนตัว (Watchlist) พร้อมระบบบันทึกรีวิว การให้คะแนน และสรุปสถิติการรับชมส่วนบุคคลแบบไดนามิก รองรับการส่งออกข้อมูลเป็นไฟล์ CSV และ JSON

## 4. Domain
✅ **Data Analysis & Management / Daily Apps**  
*(❌ Not Allowed: Information Systems, Financial Apps, Government Apps, ERP)*

## 5. API(s) to Use
- **API Name**: TMDB (The Movie Database) API (v3)
- **Documentation Link**: [https://developer.themoviedb.org/docs/getting-started](https://developer.themoviedb.org/docs/getting-started)
- **Type of Data**: Movie Metadata (`Title`, `Overview`, `Genres`, `Rating`, `Release Date`, `Poster Path`, `Cast`, `Reviews`) ในรูปแบบ JSON
- **Resilience / Fallback Support**: มีระบบ Embedded Mock Catalog ในกรณีไม่มี API Key หรืออยู่ในโหมด Offline ทำให้ระบบสามารถทำงานได้ทันที 100%

## 6. Data Persistence Plan
- **Primary Persistence**: Mini database (SQLite: `imdb_home.db`) สำหรับเก็บตาราง `watchlist_items` และประวัติรีวิว/คะแนนของผู้ใช้
- **Export Support**: รองรับการส่งออกข้อมูลคลังภาพยนตร์เป็นไฟล์ **CSV** และ **JSON** ผ่าน Endpoint และปุ่มดาวน์โหลดในหน้าเว็บ

---

## 7. Architecture & Object-Oriented Design (OOP)

สถาปัตยกรรมระบบได้รับการออกแบบตามหลักการ **Full-Stack Architecture** และ **Object-Oriented Programming (OOP)** แยกความรับผิดชอบอย่างชัดเจน (Separation of Concerns):

```
scrpit_final/
├── .github/
│   └── workflows/
│       └── ci.yml             # CI/CD Pipeline (Flake8, Pytest, Frontend Build)
├── backend/
│   ├── app/
│   │   ├── config.py          # Application configuration & environment variables
│   │   ├── database.py        # SQLAlchemy database connection & session generator
│   │   ├── models.py          # SQLAlchemy ORM Model (WatchlistItem)
│   │   ├── schemas.py         # Pydantic v2 schemas for request validation & responses
│   │   ├── services/
│   │   │   ├── tmdb_client.py        # [OOP Class] TMDBClient (API requests & fallback)
│   │   │   ├── sentiment_analyzer.py # [OOP Class] SentimentAnalyzer (NLP rule engine)
│   │   │   └── watchlist_repo.py     # [OOP Class] WatchlistRepository (CRUD, stats, export)
│   │   ├── routes/
│   │   │   ├── movies.py      # /api/movies (trending, top-rated, search, details)
│   │   │   ├── watchlist.py   # /api/watchlist (CRUD, stats, CSV/JSON export)
│   │   │   └── sentiment.py   # /api/sentiment (ad-hoc text analysis)
│   │   └── main.py            # FastAPI Application entry point & CORS
│   ├── tests/
│   │   ├── test_tmdb_client.py        # Unit tests for TMDBClient
│   │   ├── test_sentiment_analyzer.py # Unit tests for SentimentAnalyzer
│   │   ├── test_watchlist_repo.py     # Unit tests for SQLite persistence & export
│   │   └── test_api_routes.py         # Integration tests for FastAPI endpoints
│   ├── requirements.txt       # Python dependencies
│   ├── .flake8                # PEP 8 linter configuration
│   └── .env.example           # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Navigation bar, search, TMDB key trigger
│   │   │   ├── MovieCard.jsx          # Movie poster, TMDB rating, sentiment badge
│   │   │   ├── MovieDetailModal.jsx   # UC-03: Detailed profile & review journal
│   │   │   ├── WatchlistManager.jsx   # Watchlist filters, inline edit, CSV/JSON export
│   │   │   ├── AnalyticsDashboard.jsx # Dynamic personal watch charts & vibe profiles
│   │   │   ├── SentimentStudio.jsx    # Interactive sentiment playground
│   │   │   └── ApiKeyModal.jsx        # Dynamic TMDB key configuration modal
│   │   ├── services/
│   │   │   └── api.js                 # API client wrapper
│   │   ├── App.jsx                    # Root application component
│   │   ├── index.css                  # Tailwind styles, glassmorphism & glows
│   │   └── main.jsx                   # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── sprints/
│   ├── sprint-1/              # Sprint 1 Documentation & Notebook (Pitch, Architecture, 12 Use Cases)
│   ├── sprint-2/              # Sprint 2 Documentation & Notebook (FastAPI Core, TMDB, NLP tanh, Export)
│   └── sprint-3/              # Sprint 3 Documentation & Notebook (Full-Stack Wiring, Edge Cases)
├── CHANGELOG.md               # Keep a Changelog (Sprint 1-3 History & Role Rotations)
└── README.md
```

### รายละเอียดคลาสหลัก (Core OOP Classes)

1. **`TMDBClient`** (`backend/app/services/tmdb_client.py`):
   - ทำหน้าที่เชื่อมต่อกับ TMDB API v3 (`trending`, `top_rated`, `search`, `movie_details`)
   - มีระบบดักจับ Error (`requests.RequestException`, Timeout, Missing Key) พร้อมโหมด Fallback Catalog อัตโนมัติ

2. **`SentimentAnalyzer`** (`backend/app/services/sentiment_analyzer.py`):
   - ระบบประเมินอารมณ์และบรรยากาศภาพยนตร์ (Rule & Lexicon NLP Engine)
   - คำนวณค่า Polarity (-1.0 ถึง +1.0), Vibe Score (0% ถึง 100%), Mood Tags (เช่น *Inspiring & Uplifting*, *Dark & Gritty*, *Mind-Bending & Complex*), และแจกแจงสัดส่วนความรู้สึก (Positive, Neutral, Negative)

3. **`WatchlistRepository`** (`backend/app/services/watchlist_repo.py`):
   - จัดการฐานข้อมูล SQLite ผ่าน SQLAlchemy
   - รองรับ CRUD operations, การกรองตามสถานะและ Mood, การคำนวณสถิติแบบไดนามิก (Dynamic Watch Stats) และการส่งออกข้อมูลเป็น CSV และ JSON

---

## 8. Feature Matrix (MVP)

| Feature ID | Description | Implementation Details |
| :--- | :--- | :--- |
| **UC-01** | **Search Movies by Title** | ค้นหาภาพยนตร์ด้วยชื่อแบบเรียลไทม์ พร้อมแสดงผลการวิเคราะห์ Sentiment เบื้องต้น |
| **UC-02** | **Trending & Top-Rated Movies** | ดึงข้อมูลภาพยนตร์ยอดนิยมประจำสัปดาห์ และภาพยนตร์คะแนนสูงสุดจาก TMDB |
| **UC-03** | **View Detailed Movie Profiles** | แสดงข้อมูลเชิงลึก, เรื่องย่อ, รายชื่อนักแสดง, บทวิจารณ์, และเกจวัดคะแนน Sentiment |
| **Sentiment Vibe** | **Movie Atmosphere Evaluation** | จำแนกอารมณ์หนังด้วย NLP Lexicon พร้อม Mood Tag Badge และตัวกรองอารมณ์ |
| **Watchlist** | **Personal Watchlist & Review Journal** | บันทึกสถานะ (Plan to Watch, Watching, Completed), ให้คะแนน 1-10 ดาว และเขียนบันทึก |
| **Analytics** | **Dynamic Personal Watch Statistics** | คำนวณคะแนนเฉลี่ย, สัดส่วนประเภทภาพยนตร์ (Genres) และสัดส่วน Mood ของตนเอง |
| **Data Export** | **CSV & JSON Export Support** | ส่งออกข้อมูลคลังภาพยนตร์เป็นไฟล์ CSV และ JSON ได้ในคลิกเดียว |

---

## 9. Evaluation Checklist Verification

- [x] **API works**: ทดสอบ GET requests ครบถ้วน พร้อมระบบ Error Handling ด้วย `requests`
- [x] **Data persisted in SQLite and exportable to CSV/JSON**: จัดเก็บใน SQLite พร้อม Endpoint ดาวน์โหลดไฟล์ CSV และ JSON
- [x] **Code follows PEP 8**: ผ่านการตรวจสอบด้วย `flake8` ได้คะแนน 0 violations (100% compliant)
- [x] **Tests pass**: ผ่านการทดสอบ Unit Test และ Route Test ทั้งหมด 24 การทดสอบด้วย `pytest`
- [x] **CI/CD pipeline set up via GitHub Actions**: ไฟล์เวิร์กโฟลว์ `.github/workflows/ci.yml`
- [x] **README includes setup, architecture, and execution guide**: คู่มือติดตั้งและใช้งานฉบับสมบูรณ์
- [x] **Team roles clearly assigned and documented**: ระบุบทบาทหน้าที่ของสมาชิกทีมชัดเจน

---

## 10. Team Roles & Responsibilities

| สมาชิกทีม | หน้าที่หลักตามสถาปัตยกรรม | ความรับผิดชอบหลักในโครงการ |
| :--- | :--- | :--- |
| **บวรนันต์ ตะบองทอง** | **Chief Systems Architect / Full-Stack** | ออกแบบสถาปัตยกรรมระบบโดยรวม (Full-Stack), วางโครงสร้าง OOP Classes (`TMDBClient`, `WatchlistRepository`, `SentimentAnalyzer`), และควบคุม Definition of Done (DoD) |
| **กิตติธัช ปลั่งกลาง** | **Infrastructure Lead / Full-Stack Coder** | บริหารจัดการ GitHub Repository, ตั้งค่า CI/CD Pipeline ผ่าน GitHub Actions, ร่วมพัฒนา React Frontend และระบบ Sentiment $\tanh$ |
| **ไชยวัฒน์ แจ่มกลาง** | **Backend Engine & QA Debugger** | พัฒนา RESTful API ด้วย FastAPI, เชื่อมต่อ TMDB API v3, วางฐานข้อมูล SQLite ด้วย SQLAlchemy, จัดการ Data Persistence และชุดทดสอบ Edge Cases |
| **กุลศยา จันภูงา** | **Frontend UI/UX & Quality Coordinator** | ออกแบบและพัฒนาส่วนติดต่อผู้ใช้ด้วย React + Tailwind CSS สไตล์ Cinematic Dark-Mode, ออกแบบคอมโพเนนต์ Discover, Modal, Watchlist และควบคุมคุณภาพการส่งมอบ |

---

## 11. Sprint Documentation & Changelog

โครงการนี้ได้รับการพัฒนาตามกระบวนการ Agile/Scrum ทั้งหมด 3 Sprints โดยมีการจัดระเบียบเอกสารและสมุดงานอย่างชัดเจนในโฟลเดอร์ `sprints/`:

| Sprint | ช่วงเวลา / วันส่งงาน | หัวข้อและเป้าหมายหลัก | เอกสารรายงานฉบับสมบูรณ์ | ไฟล์สมุดงาน (.ipynb) |
| :---: | :---: | :--- | :---: | :---: |
| **Sprint 1** | 18 กันยายน 2569 | **Pitch, Architecture & Foundation**<br>• นิยาม 12 Use Cases (10 MVP + 2 Stretch)<br>• สถาปัตยกรรม 3 เลเยอร์ & CI/CD Pipeline | [📄 อ่านรายงาน Sprint 1](file:///c:/Users/TCcomputer/Desktop/scrpit_final/sprints/sprint-1/README.md) | [IMDB_at_home_sprint1.ipynb](file:///c:/Users/TCcomputer/Desktop/scrpit_final/sprints/sprint-1/IMDB_at_home_sprint1.ipynb) |
| **Sprint 2** | 25 กันยายน 2569 | **Back-End Engine & Business Logic**<br>• FastAPI Core, TMDB Client & Resilience Fallback<br>• NLP Sentiment Engine ($\tanh$ 0–100%) & Export | [📄 อ่านรายงาน Sprint 2](file:///c:/Users/TCcomputer/Desktop/scrpit_final/sprints/sprint-2/README.md) | [IMDB_at_home_sprint2.ipynb](file:///c:/Users/TCcomputer/Desktop/scrpit_final/sprints/sprint-2/IMDB_at_home_sprint2.ipynb) |
| **Sprint 3** | 2 ตุลาคม 2569 | **Full-Stack Integration & Edge Case Resilience**<br>• Full-Stack Wiring (React UI + FastAPI)<br>• Auto-Recovery DB, Boundary Protection, Pytest 100% | [📄 อ่านรายงาน Sprint 3](file:///c:/Users/TCcomputer/Desktop/scrpit_final/sprints/sprint-3/README.md) | [IMDB_at_home_sprint3.ipynb](file:///c:/Users/TCcomputer/Desktop/scrpit_final/sprints/sprint-3/IMDB_at_home_sprint3.ipynb) |

> 📜 **บันทึกประวัติการพัฒนาโดยละเอียด (Changelog):**  
> ติดตามรายการสิ่งที่เพิ่มเข้ามา (Added), การแก้ไข (Fixed), และการหมุนเวียนบทบาท (Role Rotation) ได้ที่ [CHANGELOG.md](file:///c:/Users/TCcomputer/Desktop/scrpit_final/CHANGELOG.md)

---

## 12. Setup & Execution Guide

### ความต้องการของระบบ (Prerequisites)
- **Python**: 3.10 หรือใหม่กว่า
- **Node.js**: v18 หรือใหม่กว่า (แนะนำ v20+) และ npm

---

### ขั้นตอนที่ 1: ติดตั้งและรัน Backend (FastAPI)

1. เปิด Terminal หรือ PowerShell ในโฟลเดอร์โครงการ:
   ```powershell
   cd c:\Users\TCcomputer\Desktop\scrpit_final
   ```

2. สร้างและเปิดใช้งาน Python Virtual Environment:
   ```powershell
   python -m venv backend/venv
   backend\venv\Scripts\Activate.ps1
   ```

3. ติดตั้ง Dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```

4. *(ทางเลือก)* ตั้งค่า TMDB API Key:
   - สามารถคัดลอกไฟล์ `backend/.env.example` เป็น `backend/.env` แล้วใส่ `TMDB_API_KEY=your_key`
   - **หมายเหตุ**: หากยังไม่มี Key ระบบจะทำงานในโหมด **Offline / Mock Demo Catalog** อัตโนมัติโดยไม่เกิดข้อผิดพลาดใดๆ

5. เริ่มต้นเซิร์ฟเวอร์ Backend:
   ```powershell
   uvicorn app.main:app --app-dir backend --reload --port 8000
   ```
   - API จะพร้อมใช้งานที่: [http://localhost:8000](http://localhost:8000)
   - Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### ขั้นตอนที่ 2: ติดตั้งและรัน Frontend (React + Tailwind CSS)

1. เปิด Terminal ใหม่แล้วเข้าไปที่โฟลเดอร์ `frontend`:
   ```powershell
   cd c:\Users\TCcomputer\Desktop\scrpit_final\frontend
   ```

2. ติดตั้ง Dependencies (หากยังไม่ได้ติดตั้ง):
   ```powershell
   npm install
   ```

3. เริ่มต้นเซิร์ฟเวอร์ Development:
   ```powershell
   npm run dev
   ```
   - เข้าใช้งานเว็บแอปพลิเคชันได้ที่: [http://localhost:5173](http://localhost:5173)

---

### ขั้นตอนที่ 3: การรันชุดการทดสอบและการตรวจสอบโค้ด (Testing & QA)

1. **ตรวจสอบความถูกต้องตามมาตรฐาน PEP 8 (flake8)**:
   ```powershell
   backend\venv\Scripts\flake8 backend/app backend/tests --config=backend/.flake8
   ```
   *(ผลลัพธ์: 0 violations, ผ่านมาตรฐาน PEP 8 ทั้งหมด)*

2. **รันการทดสอบ Unit & Integration Test (pytest)**:
   ```powershell
   powershell -Command "$env:PYTHONPATH='backend'; backend\venv\Scripts\pytest backend/tests -v"
   ```
   *(ผลลัพธ์: 24 passed)*

3. **ทดสอบการสร้าง Production Build ของ Frontend**:
   ```powershell
   cd frontend
   npm run build
   ```

---

## 13. API Reference Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/movies/trending` | ดึงรายการภาพยนตร์ยอดนิยมประจำสัปดาห์ (UC-02) |
| `GET` | `/api/movies/top-rated` | ดึงรายการภาพยนตร์คะแนนสูงสุด (UC-02) |
| `GET` | `/api/movies/search?query=...` | ค้นหาภาพยนตร์ด้วยชื่อ (UC-01) |
| `GET` | `/api/movies/{movie_id}` | ดูรายละเอียดเชิงลึก, นักแสดง, บทวิจารณ์ และผล Sentiment (UC-03) |
| `POST` | `/api/sentiment/analyze` | วิเคราะห์คะแนนความรู้สึกและ Mood Tags ของข้อความรีวิว |
| `GET` | `/api/watchlist` | ดึงรายการภาพยนตร์ใน Watchlist (กรองตามสถานะ, Mood หรือค้นหา) |
| `POST` | `/api/watchlist` | เพิ่มภาพยนตร์ลง Watchlist หรือบันทึกรีวิว/คะแนนส่วนตัว |
| `PUT` | `/api/watchlist/{id}` | แก้ไขสถานะ, รีวิว หรือคะแนนของภาพยนตร์ในคลัง |
| `DELETE` | `/api/watchlist/{id}` | ลบภาพยนตร์ออกจาก Watchlist |
| `GET` | `/api/watchlist/stats` | สรุปสถิติการรับชมแบบไดนามิก (จำนวน, คะแนนเฉลี่ย, สัดส่วน Genre & Mood) |
| `GET` | `/api/watchlist/export/csv` | ดาวน์โหลดไฟล์ข้อมูลคลังภาพยนตร์ในรูปแบบ **CSV** |
| `GET` | `/api/watchlist/export/json` | ดาวน์โหลดไฟล์ข้อมูลคลังภาพยนตร์ในรูปแบบ **JSON** |
| `GET` | `/api/config/status` | ตรวจสอบสถานะการเชื่อมต่อ TMDB API และจำนวนข้อมูลในระบบ |
| `POST` | `/api/config/tmdb-key` | ตั้งค่าหรืออัปเดต TMDB API Key แบบไดนามิกผ่านหน้าบ้าน |

+-----------------------------------------------------------------------------------+
|                            FRONTEND (React + Tailwind)                            |
|  - Discover Page (ค้นหา/ดูภาพยนตร์)           - MovieDetailModal (ดูรายละเอียด/รีวิว)|
|  - My Watchlist (จัดการคลัง/Export)           - Analytics & Sentiment Studio       |
+-----------------------------------------------------------------------------------+
                                         │  ▲
              (1) ส่ง HTTP Request (JSON)│  │ (6) ได้รับ Response (JSON / File)
                                         ▼  │
+-----------------------------------------------------------------------------------+
|                        FASTAPI CONTROLLERS / ROUTERS                              |
|   [routes/movies.py]         [routes/watchlist.py]       [routes/sentiment.py]    |
|   - รับคำขอค้นหา/มาแรง       - รับคำขอบันทึก/แก้ไข/ลบ    - รับข้อความวิเคราะห์สด  |
|   - ส่งต่อให้ Services       - จัดการ Session ฐานข้อมูล   - ส่งต่อให้ NLP          |
+-----------------------------------------------------------------------------------+
          │                   ▲             │                 ▲
      (2) │               (5) │         (2) │             (5) │
          ▼                   │             ▼                 │
+──────────────────────────────────+   +────────────────────────────────────────────+
|       SERVICES (OOP Classes)     |   |              DATA PERSISTENCE              |
|                                  |   |                                            |
| 1. TMDBClient                    |   | 3. WatchlistRepository                     |
|    - ส่ง HTTP GET ไป TMDB API    |   |    - ทำคำสั่ง CRUD ผ่าน SQLAlchemy         |
|    - แปลง JSON ดิบเข้า Schema    |   |    - คำนวณค่าสถิติ Dynamic Watch Stats     |
|    - สลับใช้ Mock หากไม่มี Key   |   |    - แปลงข้อมูลเป็น CSV / JSON             |
|               │                  |   |                      │                     |
|           (3) │ ส่ง overview/    |   |                  (3) │ อ่าน/เขียนตาราง     |
|               ▼   reviews        |   |                      ▼ watchlist_items     |
| 2. SentimentAnalyzer             |   | +────────────────────────────────────────+ |
|    - Tokenize คำ & ตัด Negation  |   | |        SQLite Database (imdb_home.db)  | |
|    - คำนวณ Polarity & Vibe Score |   | +────────────────────────────────────────+ |
|    - สกัด Mood Tags & Breakdown  |   +────────────────────────────────────────────+
+──────────────────────────────────+
