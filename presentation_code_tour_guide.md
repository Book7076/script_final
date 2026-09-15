# คู่มือขั้นตอนการพาไล่โค้ดนำเสนอ (Code Tour & Walkthrough Strategy)
## โครงการ: IMDB at home (Movie Sentiment & Watchlist Manager)
### การนำเสนอ 10 นาที: Sprint 1 Proof of Concept (PoC) Demo
**รายวิชา:** CP352301 Script Programming  
**บทบาท:** Senior Full-Stack Software Architect & Technical Presentation Coach  

---

## 1. Choice of Presentation Methodology (กรอบแนวทางการนำเสนอโค้ดระดับสากล)

### แนวทางที่เลือก: **Architecture-Driven Data Flow Tracing (สถาปัตยกรรม 3 ชั้นผสานการแกะรอยข้อมูล)**

สำหรับโปรเจกต์นี้ วิธีที่ดีที่สุดในการนำเสนอต่อหน้าอาจารย์ผู้สอนคือการผสมผสานระหว่าง **3-Layer Architecture** และ **Data Flow Tracing**:
1. **Layer 1 (Presentation):** React.js + Tailwind CSS (ฝั่ง Client)
2. **Layer 2 (Business Logic & External API):** FastAPI + TMDBClient + SentimentAnalyzer (ฝั่ง Application Engine)
3. **Layer 3 (Data Access & DevOps):** SQLite + WatchlistRepository + File I/O Export + Pytest/CI-CD (ฝั่ง Persistence & QA)

### เหตุผลที่วิธีนี้เหมาะกับการตรวจงานของอาจารย์วิชานี้มากที่สุด:
* **แสดงความเป็นระเบียบ (Separation of Concerns):** อาจารย์จะไม่มองว่าโค้ดเป็น "สคริปต์ก้อนเดียวที่เขียนปนกัน (Spaghetti Code)" แต่จะเห็นว่ามีการแยกหน้าที่ของไฟล์ชัดเจนตามมาตรฐานอุตสาหกรรม
* **เห็นการแปลงรูปของข้อมูล (Data Mutation Boundary):** ชี้ให้เห็นว่าข้อมูลถูกแปลงจาก `JSON (HTTP)` ➡️ `Pydantic Schema (Validation)` ➡️ `NLP Algorithm (Tokenize/Math)` ➡️ `SQLAlchemy ORM (SQLite)` ➡️ `CSV/JSON File Download`
* **ประหยัดเวลาและทรงพลัง (Time-Efficient):** ไม่ต้องอ่านโค้ดทีละบรรทัด (Line-by-line) แต่ชี้เฉพาะ **Key Architectural Anchors** ทำให้คุมเวลา 10 นาทีได้แม่นยำ ไม่หลงประเด็น

---

## 2. 3-Presenter Script & Folder Map Breakdown (การแบ่งหน้าที่ 3 คน)

```
scrpit_final/
├── frontend/src/                  <--- [คนที 1] Presentation Layer & UX
│   ├── App.jsx                    (State Orchestrator & Action Handlers)
│   ├── services/api.js            (API Service Client - Fetch Layer)
│   ├── components/MovieCard.jsx   (Reactive UI & Vibe Badges)
│   └── components/MovieDetailModal.jsx (Detail Modal & Review Journal Form)
├── backend/app/                   <--- [คนที 2] Business Logic & External API
│   ├── routes/movies.py           (Movie Controller & Router)
│   ├── services/tmdb_client.py    (OOP TMDBClient: Live API & Fallback Pattern)
│   └── services/sentiment_analyzer.py (OOP SentimentAnalyzer: Rule-based NLP)
└── backend/app/ + tests/ + .github/ <--- [คนที 3] Data Access, DevOps & QA
    ├── models.py & database.py    (SQLAlchemy Schema & Connection Management)
    ├── services/watchlist_repo.py (OOP WatchlistRepository: CRUD, Stats, CSV/JSON)
    ├── tests/                     (Pytest Suite: 24 Passed Unit & Integration Tests)
    └── .github/workflows/ci.yml   (Automated CI/CD Pipeline)
```

---

### 👤 ผู้นำเสนอคนที่ 1: Presentation Layer & Client Entry Point (เวลา: 0:00 - 3:00 นาที)
* **บทบาท:** Frontend & User Experience Lead
* **โฟลเดอร์ที่ต้องเปิดใน VS Code:** `frontend/src/`
* **ไฟล์ที่ต้องเปิดแสดง:** `App.jsx`, `services/api.js`, `components/MovieCard.jsx`, `components/MovieDetailModal.jsx`
* **จุดสำคัญที่ต้องชี้ (Key Focus Points):**
  1. **Central State Management (`App.jsx`):** ชี้ให้เห็นการจัดการ State รวมศูนย์ เช่น รายการหนัง (`movies`), คลังภาพยนตร์ (`watchlist`), สถิติ (`watchlistStats`), และภาษา (`lang`)
  2. **API Abstraction (`services/api.js`):** ชี้ให้เห็นการแยก Logic การยิง HTTP ออกจาก UI Component อย่างเด็ดขาดผ่าน Object `movieApi`
  3. **Data-Driven UI Rendering (`MovieCard.jsx`):** ชี้การรับ Prop `movie.sentiment` แล้วนำมาคำนวณสีของ Badge อัตโนมัติ (เขียว=บวก, ม่วง=ซับซ้อน, ชมพู=หม่นมืด)
  4. **Lightweight i18n (`utils/translations.js`):** ชี้โครงสร้าง Dictionary 2 ภาษา (TH/EN) ที่ไม่ต้องพึ่งพาไลบรารีภายนอกขนาดใหญ่

---

### 👤 ผู้นำเสนอคนที่ 2: Business Logic, External API & NLP Engine (เวลา: 3:00 - 6:30 นาที)
* **บทบาท:** Backend API & NLP Specialist
* **โฟลเดอร์ที่ต้องเปิดใน VS Code:** `backend/app/routes/` และ `backend/app/services/`
* **ไฟล์ที่ต้องเปิดแสดง:** `routes/movies.py`, `services/tmdb_client.py`, `services/sentiment_analyzer.py`
* **จุดสำคัญที่ต้องชี้ (Key Focus Points):**
  1. **Router Coordination (`routes/movies.py`):** ชี้ฟังก์ชัน `_attach_sentiment_to_movies()` ที่ทำหน้าที่เป็น Pipeline รับข้อมูลจาก TMDB แล้วส่งต่อไปวิเคราะห์ Sentiment ก่อนตอบกลับ
  2. **Resilient OOP Client (`services/tmdb_client.py`):** 
     - ชี้เมธอด `get_trending()` และ `search_movies()` ที่มีการครอบ `try...except requests.RequestException`
     - ชี้จุด **Graceful Degradation / Mock Fallback Pattern** เพื่อการันตีว่าระบบไม่มีทางล่มแม้อินเทอร์เน็ตมีปัญหา
  3. **Pure Script NLP Algorithm (`services/sentiment_analyzer.py`):**
     - ชี้กระบวนการ Tokenization และการตรวจสอบบริบทด้วย **Sliding Window (Negation Detection)** ย้อนหลัง 2 คำ (เช่น `"not good"` จะกลับทิศทางคะแนน)
     - ชี้การใช้สูตรคณิตศาสตร์ **Hyperbolic Tangent (`math.tanh`)** เพื่อบีบคะแนน Polarity ให้อยู่ในช่วง bounded $[-1.0, +1.0]$ และแปลงเป็น Vibe Score $0\% - 100\%$

---

### 👤 ผู้นำเสนอคนที่ 3: Data Access, File I/O, DevOps & Testing (เวลา: 6:30 - 10:00 นาที)
* **บทบาท:** Database Engineer, DevOps & QA Lead
* **โฟลเดอร์ที่ต้องเปิดใน VS Code:** `backend/app/`, `backend/tests/`, `.github/workflows/`
* **ไฟล์ที่ต้องเปิดแสดง:** `models.py`, `services/watchlist_repo.py`, `tests/test_api_routes.py`, `.github/workflows/ci.yml`
* **จุดสำคัญที่ต้องชี้ (Key Focus Points):**
  1. **Database Schema & ORM (`models.py` & `database.py`):** ชี้คลาส `WatchlistItem` และการกำหนด `check_same_thread=False` สำหรับ SQLite มัลติเธรด
  2. **Repository Pattern (`services/watchlist_repo.py`):**
     - ชี้เมธอด CRUD และเมธอด `get_statistics()` ที่รวบรวมข้อมูลคำนวณสถิติ Dynamic Watch Stats
     - ชี้ระบบ **File I/O Engine**: เมธอด `export_to_csv()` ที่เขียนข้อมูลตามมาตรฐาน RFC 4180 ผ่าน `csv.writer` และ `export_to_json()`
  3. **QA & Robust Test Suite (`tests/`):** 
     - ชี้การทำ Unit Test และ Integration Test ที่ผ่านการทดสอบครบทั้ง **24 passed**
     - ชี้เทคนิคการใช้ `StaticPool` ใน `test_api_routes.py` เพื่อทดสอบฐานข้อมูล in-memory แบบแยก Thread
  4. **PEP 8 & CI/CD Pipeline (`.flake8` & `ci.yml`):** ชี้ GitHub Actions Workflow ที่รัน linter `flake8` (0 violations) และ `pytest` อัตโนมัติทุกครั้งที่มีการ Push โค้ด

---

## 3. Step-by-Step Screen Navigation & Code Highlights (ลำดับการกดคลิกหน้าจอจริง)

### 🎬 ช่วงที่ 1: คนที่ 1 (Frontend & Presentation Layer)
* **Step 1:** ใน VS Code Explorer คลิกเปิด `frontend/src/App.jsx`
  * **Highlight:** เลื่อนไปที่บรรทัดบนสุด ชี้ State หลัก `const [movies, setMovies]`, `const [watchlist, setWatchlist]`, `const [lang, setLang]`
  * **พูด:** *"หน้าบ้านของเราใช้ React บริหาร State แบบ Single Source of Truth รวมศูนย์อยู่ที่ App.jsx ครับ"*
* **Step 2:** คลิกเปิด `frontend/src/services/api.js`
  * **Highlight:** ชี้ที่ Object `export const movieApi = { ... }`
  * **พูด:** *"เราแยก Network Layer ออกจาก UI ชัดเจน Component จะไม่เขียน fetch เอง แต่เรียกผ่าน movieApi ทำให้บำรุงรักษาง่าย"*
* **Step 3:** คลิกเปิด `frontend/src/components/MovieCard.jsx`
  * **Highlight:** ชี้ที่บล็อกคำนวณ `vibeBadgeBg` และป้าย `<Sparkles /> {translatedPrimaryMood}`
  * **พูด:** *"ข้อมูล Sentiment ที่ Backend ส่งมา จะถูกนำมาคำนวณโทนสีของ Badge ทันทีในระดับ Component"*
* **Transition ส่งไม้ให้คนที่ 2:** 
  * *"เมื่อหน้าบ้านส่งคำขอค้นหาหนัง ข้อมูลจะเดินทางข้าม Network ไปยัง Backend API ต่อไปขอเชิญคนที่ 2 พาดูฝั่ง Business Logic ครับ"*

---

### 🎬 ช่วงที่ 2: คนที่ 2 (Business Logic & NLP Engine)
* **Step 4:** คลิกเปิด `backend/app/routes/movies.py`
  * **Highlight:** ชี้บรรทัดที่ 11-12 (`tmdb_client`, `sentiment_analyzer`) และฟังก์ชัน `_attach_sentiment_to_movies()` (บรรทัด 25-35)
  * **พูด:** *"ไฟล์ movies.py ทำหน้าที่เป็น Controller ตรงกลาง จะเห็นการทำงานแบบ Pipeline คือดึงหนังมา แล้วร้อยเข้าฟังก์ชัน _attach_sentiment_to_movies เพื่อวิเคราะห์อารมณ์ทันที"*
* **Step 5:** ชี้ฟังก์ชัน `search_movies()` และ `get_movie_profile()` ใน `movies.py`
  * **พูด:** *"สังเกตว่าเราใช้ Pydantic Response Model กำกับ เพื่อการันตี Type Safety ของข้อมูล JSON"*
* **Step 6:** คลิกเปิด `backend/app/services/tmdb_client.py`
  * **Highlight:** เลื่อนไปที่เมธอด `get_trending()` หรือ `search_movies()` (ประมาณบรรทัด 260) ชี้บล็อก `try...except requests.RequestException`
  * **พูด:** *"ในคลาส TMDBClient เราใช้ OOP ครอบ Requests ไว้ และมี Graceful Degradation สลับใช้ Mock Catalog อัตโนมัติหาก API ปลายทางมีปัญหา ทำให้ระบบไม่มีวันล่ม"*
* **Step 7:** คลิกเปิด `backend/app/services/sentiment_analyzer.py`
  * **Highlight:** ชี้เมธอด `analyze()` และเลื่อนลงมาที่ `_compute_scores()` ชี้ลูปตรวจสอบคำปฏิเสธ `NEGATIONS`
  * **Highlight:** ชี้สูตรคณิตศาสตร์ `math.tanh(valence / alpha)` ใน `_normalize_polarity()`
  * **พูด:** *"ใน SentimentAnalyzer เราเขียน Rule-based NLP เอง ตรวจสอบบริบทคำปฏิเสธย้อนหลัง และใช้ฟังก์ชันคณิตศาสตร์ Hyperbolic Tangent บีบค่าอารมณ์ให้อยู่ในสเกลมาตรฐาน"*
* **Transition ส่งไม้ให้คนที่ 3:** 
  * *"เมื่อวิเคราะห์อารมณ์เสร็จแล้ว ข้อมูลจะถูกส่งต่อไปจัดเก็บและประมวลผลสถิติ ต่อไปขอเชิญคนที่ 3 พาดูส่วน Data Persistence และ DevOps ครับ"*

---

### 🎬 ช่วงที่ 3: คนที่ 3 (Data Persistence, File I/O, Testing & CI/CD)
* **Step 8:** คลิกเปิด `backend/app/models.py`
  * **Highlight:** ชี้คลาส `class WatchlistItem(Base):` แสดงคอลัมน์ `movie_id`, `watch_status`, `sentiment_score`
  * **พูด:** *"ในส่วน Data Layer เราใช้ SQLAlchemy ORM สร้างตาราง watchlist_items ใน SQLite เพื่อเก็บข้อมูลการรับชมอย่างถาวร"*
* **Step 9:** คลิกเปิด `backend/app/services/watchlist_repo.py`
  * **Highlight:** เลื่อนไปที่เมธอด `get_statistics()` และเมธอด `export_to_csv()` / `export_to_json()`
  * **พูด:** *"เราใช้ Repository Pattern ในการแยกคำสั่งฐานข้อมูล โดยมีเมธอดคำนวณสถิติ และ File I/O Engine ที่สร้างไฟล์ CSV ตามมาตรฐาน RFC 4180 และ JSON สำหรับดาวน์โหลด"*
* **Step 10:** คลิกเปิด `backend/tests/test_api_routes.py`
  * **Highlight:** ชี้ที่ `poolclass=StaticPool` ในการเซ็ตอัป Test Engine (บรรทัด 12-18)
  * **พูด:** *"ในการทำ Automated Testing เราใช้ Isolated In-Memory SQLite ร่วมกับ StaticPool เพื่อให้ทดสอบ Endpoint ได้สมบูรณ์โดยไม่กระทบฐานข้อมูลจริง"*
* **Step 11:** คลิกเปิด `.github/workflows/ci.yml`
  * **Highlight:** ชี้ที่ Job `backend-qa` (รัน flake8 และ pytest) และ `frontend-build`
  * **พูด:** *"สุดท้ายคือระบบ CI/CD บน GitHub Actions โค้ดของเราผ่านการ Lint ด้วย Flake8 ได้ 0 ข้อผิดพลาด และผ่าน Pytest ครบทั้ง 24 การทดสอบแบบ 100% ครับ"*

---

## 4. Defensive Code QA & Anticipated Teacher Questions (ดักทางคำถามอาจารย์เชิงลึก)

นี่คือ 5 คำถามเชิงเทคนิคระดับสูงที่อาจารย์มักจะถามเจาะลึก พร้อมแนวทางการตอบที่เฉียบคมและดูเป็นมืออาชีพ:

### ❓ คำถามที่ 1: "ทำไมถึงต้องเขียน Mock Catalog ไว้ใน TMDBClient ทั้งๆ ที่ต่อ API จริงได้อยู่แล้ว?"
* **แนวทางการตอบ:**
  > *"เป็นเทคนิคทาง Software Architecture ที่เรียกว่า **Graceful Degradation และ High Availability (HA) Pattern** ครับ ในการทำงานจริง Third-party API อาจเกิด Network Timeout, ลิมิตโควต้าเต็ม (Rate Limit) หรือคีย์หมดอายุ การมี Fallback Catalog ที่เป็น Schema เดียวกัน ช่วยการันตีว่า User Interface จะไม่พัง (Zero-Crash) และช่วยให้ระบบสามารถรัน Automated Test ในสภาพแวดล้อม CI/CD ที่ไม่มีอินเทอร์เน็ตได้อย่างสมบูรณ์ 100% ครับ"*

---

### ❓ คำถามที่ 2: "ในระบบ Watchlist ทำไมต้องแยก WatchlistRepository ออกมา ทำไมไม่ query ใน route ตรงๆ?"
* **แนวทางการตอบ:**
  > *"เราใช้ **Repository Pattern** ตามหลัก **Separation of Concerns (SoC)** ครับ หน้าที่ของ Route คือการรับส่ง HTTP Request (Web Controller) ไม่ควรผูกติดกับโครงสร้างคำสั่ง SQL หรือ SQLAlchemy Session โดยตรง การแยก Repository ช่วยให้:
  > 1. เราสามารถเขียน Unit Test ทดสอบ Logic การบันทึกและคำนวณสถิติได้โดยไม่ต้องเปิด Web Server
  > 2. ในอนาคตถ้าต้องการเปลี่ยนฐานข้อมูลจาก SQLite ไปเป็น PostgreSQL เราจะแก้ไขแค่ไฟล์ Repository ไฟล์เดียว โดยไม่ต้องแตะต้อง Route เลยครับ"*

---

### ❓ คำถามที่ 3: "ระบบ Sentiment Analysis ตรวจจับประโยคปฏิเสธ เช่น 'The movie is not good' อย่างไร ไม่ให้ได้คะแนนเป็นบวกจากคำว่า good?"
* **แนวทางการตอบ:**
  > *"ในฟังก์ชัน `_compute_scores` เราออกแบบระบบ **Sliding Window** ครับ โดยในขณะที่วนลูปตรวจคำศัพท์ ระบบจะมองย้อนกลับไป 2 ตำแหน่ง (`tokens[i-2:i]`) เพื่อค้นหาชุดคำใน `NEGATIONS` (เช่น not, never, barely) หากตรวจพบคำปฏิเสธ น้ำหนักคะแนนบวกของคำว่า 'good' จะถูกสลับขั้ว (Invert) ไปบวกเข้ากับฝั่งคะแนนลบแทน ทำให้ประโยค 'not good' ถูกประเมินเป็นลบได้อย่างแม่นยำครับ"*

---

### ❓ คำถามที่ 4: "ระบบนี้ป้องกันปัญหา SQL Injection อย่างไร?"
* **แนวทางการตอบ:**
  > *"ระบบปลอดภัยจาก SQL Injection 100% ครับ เนื่องจากเราใช้ **SQLAlchemy ORM** ในการ Query ทั้งหมด ซึ่งใช้กลไก **Parameterized Queries (Prepared Statements)** ข้อมูลจากผู้ใช้ (เช่น ชื่อหนังที่พิมพ์ค้นหา) จะถูกส่งผ่านพารามิเตอร์ที่เป็น Placeholder (`?`) ไม่มีการนำ String มาต่อกันตรงๆ (No String Concatenation) ฐานข้อมูลจึงมองข้อมูลผู้ใช้เป็น Data Literal เสมอ ไม่สามารถถูก Execute เป็นคำสั่ง SQL ได้ครับ"*

---

### ❓ คำถามที่ 5: "ทำไมในการทดสอบด้วย Pytest ในไฟล์ test_api_routes.py ถึงต้องใช้ StaticPool ใน create_engine?"
* **แนวทางการตอบ:**
  > *"เนื่องจากเราทดสอบบนฐานข้อมูล **SQLite In-Memory (`sqlite:///:memory:`)** ซึ่งธรรมชาติของ SQLite คือแต่ละ Connection จะสร้างฐานข้อมูลในแรมแยกก้อนกัน เมื่อ FastAPI ทำงานแบบ Multi-threaded Session หนึ่งอาจมองไม่เห็นตารางที่อีก Session สร้างไว้ การใส่ `poolclass=StaticPool` จะเป็นการบังคับให้ SQLAlchemy ใช้ Connection เดิมซ้ำตลอดกระบวนการทดสอบ ทำให้ทุกเธรดแชร์ตารางร่วมกันได้โดยไม่เกิดข้อผิดพลาด `no such table` ครับ"*
