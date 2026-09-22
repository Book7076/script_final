# 📝 Final Term Project Report: Sprint 2 - Back-End Engine & Business Logic

**ชื่อโปรเจกต์:** IMDB at home (Movie Sentiment & Watchlist Manager)  
**รหัสวิชา:** CP352301 Script Programming (ภาคการศึกษา 1/2569)  
**กำหนดส่งงาน Sprint 2:** 25 กันยายน 2569  
**ไฟล์สมุดงานประจำ Sprint:** [IMDB_at_home_sprint2.ipynb](./IMDB_at_home_sprint2.ipynb)

---

## 1. การหมุนเวียนบทบาทหน้าที่ในทีม (Sprint 2 Role Rotation)

ตามเกณฑ์การประเมินการหมุนเวียนบทบาท (Role-Based Allocation) สมาชิกทีมได้สลับบทบาทหน้าที่จาก Sprint 1 เพื่อพัฒนา Back-End Application และ Business Logic Engine ดังนี้:

| สมาชิกทีม | บทบาทหน้าที่ใน Sprint 2 | ความรับผิดชอบหลัก |
| :--- | :--- | :--- |
| **ไชยวัฒน์ แจ่มกลาง** | **Planner & Architect** | วิเคราะห์ความต้องการของระบบ จัดทำแผนงาน, ออกแบบ API Endpoints Schema, กำหนด Definition of Done (DoD) ของระบบ Back-End และวางโครงสร้าง Data Export Pipeline |
| **กุลศยา จันภูงา** | **Planner & Quality Coordinator** | วางแผนงานและกำหนดเป้าหมายของ Sprint 2, แบ่งงานให้สมาชิกในทีม, กำหนดเกณฑ์การทดสอบ และจัดทำเอกสารรายงานความก้าวหน้า |
| **บวรนันต์ ตะบองทอง** | **Core Back-End Developer (Coder)** | พัฒนาและปรับปรุงโค้ดระบบ Backend (FastAPI Core & Routes), เชื่อมต่อ TMDB API v3 พร้อมระบบ Fallback และพัฒนาระบบ Data Export (CSV/JSON) |
| **กิตติธัช ปลั่งกลาง** | **QA Debugger & Tester** | ตรวจสอบการทำงานของระบบ, ร่วมพัฒนาโมดูล NLP Sentiment Analyzer ($\tanh$), ออกแบบและรันชุดทดสอบอัตโนมัติด้วย `pytest` ครอบคลุม Edge Cases และ Exception Handling Resilience |

---

## 2. โจทย์ เป้าหมาย และเงื่อนไขความเสร็จสมบูรณ์ (Objectives & Definition of Done)

* **โจทย์ & เป้าหมายประจำ Sprint 2:**
  พัฒนาระบบฝั่ง Back-End Engine ด้วย FastAPI, เชื่อมต่อ TMDB API v3 สำหรับดึงข้อมูลภาพยนตร์, พัฒนา AI/NLP Sentiment Analysis จากเรื่องย่อ และสร้างระบบส่งออกข้อมูล (Data Exporting)
* **Definition of Done (DoD):**
  1. **API Fallback:** ต้องมีระบบ Mock Fallback กรณี TMDB API ขัดข้อง หรือไม่มีอินเทอร์เน็ต โปรแกรมต้องไม่ Crash
  2. **NLP Sentiment Engine:** โมดูล Sentiment Analyzer ต้องแปลงเรื่องย่อเป็น Vibe Score ($0–100\%$) ได้แม่นยำ และผ่าน Unit Test บน `pytest` 100%
  3. **Data Persistence & Export:** สามารถจัดเก็บข้อมูล Watchlist ลง SQLite และส่งออกข้อมูลเป็นไฟล์ CSV และ JSON ได้อย่างถูกต้องตามข้อกำหนด

---

## 3. สรุปความก้าวหน้าและการพัฒนาจริง (Execution & Code Details)

* [x] **FastAPI Core & Routes (`backend/app/main.py`, `routes/`):**
  * สร้าง FastAPI Application พร้อมกำหนด CORS Middleware ให้รองรับการเชื่อมต่อกับ Frontend
  * แยก Router เป็นสัดส่วน: `movies.py` (ดึงข้อมูล/ค้นหาหนัง), `watchlist.py` (จัดการคลังหนังและ Export), และ `sentiment.py` (ทดสอบ Sentiment ข้อความอิสระ)
* [x] **TMDB Client & Resilient Fallback (`backend/app/services/tmdb_client.py`):**
  * พัฒนาคลาส OOP `TMDBClient` รองรับ Method: `get_trending_movies()`, `get_top_rated()`, `search_movies()`, และ `get_movie_details()`
  * สร้างระบบ Resilience Fallback: เมื่อเกิด `requests.RequestException`, Timeout หรือ Missing API Key ระบบจะสลับไปดึงข้อมูลจาก Mock Catalog สำรองทันทีโดยอัตโนมัติ
* [x] **NLP Sentiment Engine (`backend/app/services/sentiment_analyzer.py`):**
  * พัฒนาคลาส `SentimentAnalyzer` อาศัยหลักการ Lexicon Rule-based ร่วมกับ Tokenization
  * ออกแบบ **Sliding Window Negation Detection** ตรวจจับคำปฏิเสธ (เช่น *"not impressive"*, *"never boring"*) เพื่อกลับค่า Polarity อย่างแม่นยำ
  * ประยุกต์ใช้ฟังก์ชันคณิตศาสตร์ **Hyperbolic Tangent ($\tanh$)** ในการ Normalize ค่า Valence Score ให้อยู่ในสเกล Vibe Score $0–100\%$
* [x] **Data Persistence & Exporting (`backend/app/services/watchlist_repo.py`, `routes/watchlist.py`):**
  * จัดการฐานข้อมูล SQLite ผ่าน SQLAlchemy ORM (`WatchlistItem` model)
  * พัฒนา Endpoint `/api/watchlist/export/csv` และ `/api/watchlist/export/json` จัดการ File I/O พร้อมกำหนด HTTP Response Headers สำหรับดาวน์โหลดไฟล์ทันที

---

## 🧪 4. ผลการทดสอบระบบ (Quality Assurance & Debugging Report - Sprint 2)

| รหัส | หมวดหมู่ | รายการทดสอบ | อินพุต / Action | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง | สถานะ |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC01** | API Integration | ค้นหาข้อมูลภาพยนตร์ผ่าน TMDB | ค้นหาภาพยนตร์ผ่านระบบ (`q=Inception`) | ได้ข้อมูลภาพยนตร์จริงจาก TMDB API v3 | ระบบแสดงข้อมูลภาพยนตร์จริงครบถ้วน | **PASSED** |
| **TC02** | API Fallback | การทำงานเมื่อ TMDB API ใช้งานไม่ได้ | ปิด Internet หรือใช้ API Key ผิด | ระบบเปลี่ยนไปใช้ Mock Data โดยไม่ Crash | ระบบเปลี่ยนเป็น Mock Data ได้ทันที | **PASSED** |
| **TC03** | NLP Sentiment | วิเคราะห์ข้อความเชิงบวก | ป้อนข้อความ เช่น *"great brilliant"* | Vibe Score มากกว่า 70% | ระบบคำนวณ Vibe Score ได้มากกว่า 70% | **PASSED** |
| **TC04** | NLP Negation | ตรวจจับคำปฏิเสธ | ป้อนข้อความ *"not impressive"* | Sliding Window ตรวจจับและกลับค่า Polarity | ระบบตรวจจับคำปฏิเสธและปรับ Polarity ได้ | **PASSED** |
| **TC05** | NLP Normalization | ปรับค่า Sentiment ให้อยู่ในช่วงที่กำหนด | วิเคราะห์เรื่องย่อภาพยนตร์ที่มีความยาวมาก | Vibe Score ต้องอยู่ระหว่าง 0–100% | ระบบใช้ $\tanh$ ควบคุมค่าให้อยู่ในช่วง 0–100% | **PASSED** |
| **TC06** | Data Export | ส่งออกข้อมูล Watchlist เป็น CSV | ยิงคำขอ `/api/watchlist/export/csv` | สร้างไฟล์ CSV พร้อม Header และข้อมูลครบถ้วน | ระบบสร้างไฟล์ CSV ได้ถูกต้องและข้อมูลครบ | **PASSED** |
| **TC07** | Data Export | ส่งออกข้อมูล Watchlist เป็น JSON | ยิงคำขอ `/api/watchlist/export/json` | สร้างไฟล์ JSON ตาม Schema และมีข้อมูลครบถ้วน | ระบบสร้างไฟล์ JSON ได้ถูกต้องตาม Schema | **PASSED** |
| **TC08** | Automated Testing | ทดสอบระบบด้วย pytest | รันชุดทดสอบ `pytest backend/tests` | Test Cases ต้องผ่านครบ 100% | `pytest` ผ่านการทดสอบครบ 24 ชุด (100%) | **PASSED** |

---

## 🔄 5. สรุปบทเรียนประจำสัปดาห์ (Retrospective: Wow! & Whoops!)

* **Wow! (ส่วนที่ทำได้ดี):**
  * โมดูล NLP คำนวณ Sentiment จากเรื่องย่อหนังได้อย่างแม่นยำ ด้วยการนำฟังก์ชันทางคณิตศาสตร์ Hyperbolic Tangent ($\tanh$) มาใช้ Normalize ข้อมูล ป้องกันคะแนนล้นสเกล
  * มีการเขียน Unit Test ควบคู่กับการพัฒนาผ่าน `pytest` (24 Passed) ช่วยดักจับ Edge Cases และรับประกันว่าโค้ดทั้งหมดผ่านเกณฑ์ PEP 8 (0 flake8 violations)
* **Whoops! (ปัญหาที่พบและการแก้ไข):**
  * **ปัญหา:** ช่วงแรกเมื่อป้อนเรื่องย่อที่มีความยาวมาก ทำให้ Valence Score สะสมจนคำนวณออกมาโตเกิน 100%
  * **การแก้ไข:** ได้ทำการ Refactor โค้ดในโมดูล `sentiment_analyzer.py` โดยประยุกต์ใช้สูตร Hyperbolic Tangent ($\tanh$) ช่วยในการ Normalization เพื่อบีบสเกลให้อยู่ในช่วง $[0, 100\%]$ ได้อย่างสมดุล
