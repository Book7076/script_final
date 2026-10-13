# 📋 Architecture Plan, Module & API Specifications, and User Guide
## โครงการ: IMDB at home (Movie Sentiment & Watchlist Manager)
### รหัสวิชา: CP352301 Script Programming | ภาคการศึกษา 1/2569

---

## สารบัญ (Table of Contents)
1. [ภาพรวมสถาปัตยกรรมสุดท้าย (Final Architecture & System Design)](#1-ภาพรวมสถาปัตยกรรมสุดท้าย-final-architecture--system-design)
2. [สเปกต์คลาสและโมดูลเชิงวัตถุ (Core OOP Modules Specification)](#2-สเปกต์คลาสและโมดูลเชิงวัตถุ-core-oop-modules-specification)
3. [สเปกต์ฐานข้อมูล (Database Schema & Persistence Plan)](#3-สเปกต์ฐานข้อมูล-database-schema--persistence-plan)
4. [สเปกต์ข้อกำหนดระบบ API (Comprehensive API Specifications)](#4-สเปกต์ข้อกำหนดระบบ-api-comprehensive-api-specifications)
5. [การแมป Use Cases (12 Use Cases Realization Matrix)](#5-การแมป-use-cases-12-use-cases-realization-matrix)
6. [คู่มือการใช้งานระบบสำหรับผู้ใช้ (End-User Manual & Operation Guide)](#6-คู่มือการใช้งานระบบสำหรับผู้ใช้-end-user-manual--operation-guide)
7. [การทดสอบและการควบคุมคุณภาพ (Testing & Quality Assurance)](#7-การทดสอบและการควบคุมคุณภาพ-testing--quality-assurance)

---

## 1. ภาพรวมสถาปัตยกรรมสุดท้าย (Final Architecture & System Design)

ระบบ **IMDB at home** ได้รับการพัฒนาภายใต้สถาปัตยกรรม **3-Tier Full-Stack Architecture** ตามหลักการ **Separation of Concerns (SoC)** และ **Object-Oriented Programming (OOP)** โดยแบ่งแยกหน้าที่ออกเป็น 3 เลเยอร์อย่างเด็ดขาด:

```
+───────────────────────────────────────────────────────────────────────────────+
|                  1. PRESENTATION LAYER (PL) - Front-End                       |
|   Technology: React 19 + Vite + Tailwind CSS (Cinematic Dark-Mode Glassmorphism)   |
|                                                                               |
|  [Navbar / Search]       [Discover / Trending / Top Rated]   [MovieDetailModal]  |
|  [Watchlist Manager]     [Dynamic Analytics Dashboard]       [SentimentStudio]   |
+──────────────────────────────────────┬────────────────────────────────────────+
                                       │ HTTP REST (JSON / Octet-Stream)
                                       ▼
+───────────────────────────────────────────────────────────────────────────────+
|                 2. BUSINESS LOGIC LAYER (BLL) - Back-End Engine               |
|   Technology: Python 3.10+ with FastAPI Framework, Pydantic v2                |
|                                                                               |
|  • API Routers:                                                               |
|    - routes/movies.py    : Proxy & Aggregation สำหรับ TMDB & Sentiment        |
|    - routes/watchlist.py : CRUD, Dynamic Stats Aggregation, CSV/JSON Exporter |
|    - routes/sentiment.py : Ad-hoc Natural Language Sentiment Analysis Engine  |
|                                                                               |
|  • Core OOP Services:                                                         |
|    - TMDBClient          : Resilience API Client พร้อม Fallback Catalog       |
|    - SentimentAnalyzer   : Lexicon NLP + Sliding Negation + tanh Scaling      |
|    - WatchlistRepository : Database Abstraction & File Export Engine          |
+──────────────────────────────────────┬────────────────────────────────────────+
                                       │ SQLAlchemy ORM Engine
                                       ▼
+───────────────────────────────────────────────────────────────────────────────+
|                   3. DATA ACCESS LAYER (DAL) - Persistence                    |
|   Technology: SQLite Database (`imdb_home.db`) & File I/O Exporter            |
|                                                                               |
|  • Tables: `watchlist_items` (จัดเก็บข้อมูลหนัง, รีวิว, คะแนน, สถานะ, Mood)  |
|  • File Exporter: สตรีมไฟล์ CSV (UTF-8 with BOM) และ Pretty JSON ไดนามิก     |
+───────────────────────────────────────────────────────────────────────────────+
```

### แผนภาพการไหลของข้อมูล (Data Flow Diagram)

```
[User Browser]
      │
      │ 1. ค้นหา / เรียกดูหนัง / ส่งบทวิจารณ์
      ▼
[FastAPI Router]
      │
      ├───────────────────────┬─────────────────────────┐
      │ (ดึงข้อมูลภาพยนตร์)    │ (วิเคราะห์ข้อความ)       │ (จัดการคลังหนัง)
      ▼                       ▼                         ▼
[TMDBClient]           [SentimentAnalyzer]       [WatchlistRepository]
   │       ▲                  │                         │
   │ API   │ Mock             │ NLP Rule & tanh         │ SQLAlchemy ORM
   ▼       │ Fallback         ▼                         ▼
[TMDB API v3]           [Vibe & Mood Tags]       [SQLite: imdb_home.db]
                                                        │
                                                        ▼ (Export)
                                                 [CSV / JSON Downloads]
```

### การออกแบบระบบความทนทาน (Resilience & Fault Tolerance)
1. **Network Fault Isolation:** หากเครือข่ายอินเทอร์เน็ตล่ม หรือ TMDB API Key ไม่ถูกต้อง/หมดอายุ `TMDBClient` จะตัดเข้าสู่ **Embedded Mock Catalog** โดยอัตโนมัติ ทำให้ผู้ใช้ยังสามารถค้นหา ดูรายชื่อหนังยอดนิยม และทดสอบระบบได้ 100% โดยไม่เกิด Unhandled Exception หรือ Server Crash
2. **Database Auto-Recovery:** หากไฟล์ `imdb_home.db` สูญหายหรือถูกลบ เซิร์ฟเวอร์จะทำการตรวจจับและสั่งรัน `Base.metadata.create_all()` เพื่อสร้าง Schema ใหม่อัตโนมัติทันที
3. **Boundary Value Protection:** มีการตรวจสอบค่าคะแนน (0.0 – 10.0) และตัดแต่งข้อความ (Sanitization) ทั้งบน React UI และ Pydantic v2 Validators บน Backend

---

## 2. สเปกต์คลาสและโมดูลเชิงวัตถุ (Core OOP Modules Specification)

ระบบฝั่ง Business Logic ขับเคลื่อนด้วย OOP Classes หลัก 3 คลาส:

### 2.1 `TMDBClient` (`backend/app/services/tmdb_client.py`)
ทำหน้าที่เป็น Gateway สำหรับเชื่อมต่อไปยังภายนอก (The Movie Database API v3) และจัดการ Fallback Catalog ภายใน

* **Attributes:**
  * `api_key: Optional[str]` - TMDB API Key (ดึงมาจาก `.env` หรืออัปเดตแบบ runtime)
  * `base_url: str` - Base URL ของ TMDB API (`https://api.themoviedb.org/3`)
  * `image_base_url: str` - URL เริ่มต้นสำหรับรูปภาพโปสเตอร์ (`https://image.tmdb.org/t/p/w500`)
  * `timeout: int` - ขีดจำกัดเวลา Timeout (5 วินาที)
  * `sentiment_analyzer: SentimentAnalyzer` - อินสแตนซ์ของระบบวิเคราะห์ความรู้สึกสำหรับประเมินเรื่องย่อ
* **Key Methods:**
  * `set_api_key(new_key: str) -> None`: ปรับปรุง API Key แบบไดนามิกขณะเซิร์ฟเวอร์กำลังทำงาน
  * `get_trending_movies(page: int = 1) -> Dict[str, Any]`: ดึงภาพยนตร์ยอดนิยมประจำสัปดาห์
  * `get_top_rated(page: int = 1) -> Dict[str, Any]`: ดึงภาพยนตร์คะแนนสูงสุดตลอดกาล
  * `search_movies(query: str, page: int = 1) -> Dict[str, Any]`: ค้นหาภาพยนตร์ด้วยชื่อเรื่อง
  * `get_movie_details(movie_id: int) -> Dict[str, Any]`: ดึงข้อมูลเชิงลึก รายชื่อนักแสดง และบทวิจารณ์
  * `_fetch_with_fallback(endpoint: str, params: dict, fallback_func: Callable) -> Dict[str, Any]`: Wrapper ควบคุมการเรียกใช้งาน API พร้อมกลไกสลับใช้ Mock Data ทันทีเมื่อเกิด `requests.RequestException`

---

### 2.2 `SentimentAnalyzer` (`backend/app/services/sentiment_analyzer.py`)
ทำหน้าที่ประเมินอารมณ์และบรรยากาศของภาพยนตร์จากเรื่องย่อ (Overview) และบทวิจารณ์ (Reviews) โดยใช้กฎเกณฑ์ทางภาษาศาสตร์ (Lexicon Rule-based NLP Engine)

* **Attributes:**
  * `POSITIVE_WORDS: Dict[str, float]` - คลังคำศัพท์เชิงบวกพร้อมค่าน้ำหนักความเข้มข้น (Intensities)
  * `NEGATIVE_WORDS: Dict[str, float]` - คลังคำศัพท์เชิงลบพร้อมค่าน้ำหนักความเข้มข้น
  * `NEGATION_WORDS: Set[str]` - คำปฏิเสธ (เช่น `not`, `never`, `barely`, `hardly`, `no`)
  * `MOOD_KEYWORDS: Dict[str, List[str]]` - คลังคำศัพท์จัดกลุ่มตาม Mood Tag
* **Key Methods:**
  * `analyze(text: str, movie_title: Optional[str] = None) -> Dict[str, Any]`: วิเคราะห์ข้อความและคืนค่าผลลัพธ์เป็นโครงสร้าง `SentimentResult`
  * `_detect_mood_tags(tokens: List[str]) -> List[str]`: ระบุ Mood Tags เช่น *Inspiring & Uplifting*, *Dark & Gritty*, *Mind-Bending & Complex*
  * `_calculate_vibe_score(valence: float) -> float`: แปลงผลรวม Valence ให้อยู่ในช่วง Vibe Score $0\% - 100\%$ โดยใช้สูตร Hyperbolic Tangent ($\tanh$):
    $$\text{Vibe Score} = 50.0 + \left( \tanh\left(\frac{\text{valence}}{3.0}\right) \times 50.0 \right)$$
    ซึ่งช่วยป้องกันปัญหาคะแนนล้นสเกลเมื่อข้อความมีความยาวมาก

---

### 2.3 `WatchlistRepository` (`backend/app/services/watchlist_repo.py`)
ทำหน้าที่จัดการข้อมูลในตาราง `watchlist_items` บนฐานข้อมูล SQLite ผ่าน SQLAlchemy ORM รวมทั้งการสรุปสถิติและการ Export ไฟล์

* **Attributes:**
  * `db: Session` - SQLAlchemy Database Session
* **Key Methods:**
  * `get_all(status: Optional[str] = None, mood: Optional[str] = None, search: Optional[str] = None) -> List[WatchlistItem]`: ดึงรายการหนังพร้อมรองรับการกรองตามสถานะ, อารมณ์ และค้นหาชื่อ
  * `get_by_id(item_id: int) -> Optional[WatchlistItem]`: ดึงข้อมูลรายการหนังด้วย Primary Key
  * `get_by_movie_id(movie_id: int) -> Optional[WatchlistItem]`: ดึงข้อมูลรายการหนังด้วย TMDB Movie ID
  * `create(data: WatchlistCreate) -> WatchlistItem`: เพิ่มหนังใหม่เข้าคลังส่วนตัว
  * `update(item_id: int, data: WatchlistUpdate) -> Optional[WatchlistItem]`: แก้ไขสถานะการรับชม, คะแนนรีวิว หรือความคิดเห็น
  * `delete(item_id: int) -> bool`: ลบภาพยนตร์ออกจากคลัง
  * `get_statistics() -> Dict[str, Any]`: คำนวณสถิติภาพรวม เช่น คะแนนเฉลี่ย, สัดส่วนสถานะ, การแจกแจงประเภทหนัง (Genres) และ Moods
  * `export_to_csv() -> str`: สร้างข้อความ CSV ตามมาตรฐาน RFC 4180 พร้อม UTF-8 BOM สำหรับเปิดใน Microsoft Excel ได้อย่างถูกต้อง
  * `export_to_json() -> str`: สร้างข้อความ JSON ที่จัดฟอร์แมตสวยงาม (Pretty-printed)

---

## 3. สเปกต์ฐานข้อมูล (Database Schema & Persistence Plan)

ระบบใช้ **SQLite Database** ผ่านไฟล์ `imdb_home.db` สำหรับเก็บข้อมูลคลังภาพยนตร์ส่วนตัว:

### ตาราง: `watchlist_items`

| ชื่อฟิลด์ | ชนิดข้อมูล | คุณสมบัติ | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | PRIMARY KEY, AUTOINCREMENT, INDEX | รหัสลำดับรายการในฐานข้อมูล |
| `movie_id` | `INTEGER` | UNIQUE, INDEX, NOT NULL | รหัสอ้างอิงภาพยนตร์จาก TMDB API |
| `title` | `VARCHAR(255)` | NOT NULL | ชื่อภาพยนตร์ |
| `poster_path` | `VARCHAR(255)` | NULLABLE | เส้นทางไฟล์รูปภาพโปสเตอร์ |
| `backdrop_path` | `VARCHAR(255)` | NULLABLE | เส้นทางไฟล์รูปภาพพื้นหลัง |
| `release_date` | `VARCHAR(50)` | NULLABLE | วันที่ภาพยนตร์เข้าฉาย (YYYY-MM-DD) |
| `genres` | `VARCHAR(255)` | DEFAULT: `""` | หมวดหมู่ภาพยนตร์ (คั่นด้วยเครื่องหมายจุลภาค `,`) |
| `tmdb_rating` | `FLOAT` | DEFAULT: `0.0` | คะแนนเฉลี่ยจาก TMDB (0.0 - 10.0) |
| `overview` | `TEXT` | DEFAULT: `""` | เรื่องย่อภาพยนตร์ |
| `user_rating` | `FLOAT` | DEFAULT: `0.0` | คะแนนที่ผู้ใช้ให้เป็นการส่วนตัว (0.0 - 10.0) |
| `user_review` | `TEXT` | DEFAULT: `""` | บันทึกรีวิวและความรู้สึกส่วนบุคคล |
| `watch_status` | `VARCHAR(50)` | DEFAULT: `"plan_to_watch"` | สถานะ: `plan_to_watch`, `watching`, `completed`, `dropped` |
| `sentiment_label` | `VARCHAR(50)` | DEFAULT: `"Neutral"` | หมวดหมู่ความรู้สึก: `Positive`, `Neutral`, `Negative` |
| `sentiment_score` | `FLOAT` | DEFAULT: `0.5` | คะแนน Vibe Score จากการวิเคราะห์ (0.0 - 1.0) |
| `mood_tags` | `VARCHAR(255)` | DEFAULT: `""` | แท็กบรรยากาศของหนัง (คั่นด้วยจุลภาค `,`) |
| `added_at` | `DATETIME` | DEFAULT: `CURRENT_TIMESTAMP` | วันเวลาที่เพิ่มภาพยนตร์เข้าคลัง |
| `updated_at` | `DATETIME` | DEFAULT: `CURRENT_TIMESTAMP` | วันเวลาที่มีการแก้ไขข้อมูลล่าสุด |

---

## 4. สเปกต์ข้อกำหนดระบบ API (Comprehensive API Specifications)

### Base URL: `http://localhost:8000/api`

---

### 4.1 กลุ่มภาพยนตร์ (Movies API)

#### `GET /api/movies/trending`
* **คำอธิบาย:** ดึงรายการภาพยนตร์ยอดนิยมประจำสัปดาห์ พร้อมผลวิเคราะห์ Sentiment ของเรื่องย่อ
* **Query Parameters:** `page` (integer, optional, default: `1`)
* **Response `200 OK`:**
```json
{
  "page": 1,
  "total_results": 20,
  "total_pages": 1,
  "results": [
    {
      "id": 157336,
      "title": "Interstellar",
      "poster_path": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      "release_date": "2014-11-05",
      "genres": ["Adventure", "Drama", "Science Fiction"],
      "tmdb_rating": 8.4,
      "vote_count": 34500,
      "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole...",
      "sentiment": {
        "polarity": 0.42,
        "vibe_score": 78.5,
        "sentiment_label": "Positive",
        "subjectivity": 0.55,
        "mood_tags": ["Mind-Bending & Complex", "Inspiring & Uplifting"],
        "keywords": ["explorers", "wormhole", "adventures"],
        "summary": "Predominantly positive atmosphere with an adventurous and curious tone.",
        "breakdown": { "positive": 0.65, "neutral": 0.25, "negative": 0.10 }
      }
    }
  ]
}
```

#### `GET /api/movies/top-rated`
* **คำอธิบาย:** ดึงรายการภาพยนตร์ที่มีคะแนนรีวิวสูงสุดตลอดกาล
* **Query Parameters:** `page` (integer, optional, default: `1`)
* **Response `200 OK`:** โครงสร้างเดียวกันกับ `MovieListResponse`

#### `GET /api/movies/search`
* **คำอธิบาย:** ค้นหาภาพยนตร์ด้วยคำสำคัญ (Title Search)
* **Query Parameters:** `query` (string, required), `page` (integer, optional, default: `1`)
* **Edge Case Handling:** หาก query เป็นค่าว่าง ระบบจะส่งกลับรายการว่างหรือข้อมูลเริ่มต้นโดยไม่เรียก API ภายนอก

#### `GET /api/movies/{movie_id}`
* **คำอธิบาย:** ดึงข้อมูลเชิงลึกของภาพยนตร์ รายชื่อนักแสดงนำ และบทวิจารณ์จริง
* **Path Parameters:** `movie_id` (integer, required)
* **Response `200 OK`:** `MovieDetailResponse` (ประกอบด้วย `runtime`, `tagline`, `cast`, `reviews` พร้อมการวิเคราะห์ Sentiment แต่ละบทวิจารณ์)

---

### 4.2 กลุ่มจัดการคลังภาพยนตร์ (Watchlist API)

#### `GET /api/watchlist`
* **คำอธิบาย:** เรียกดูรายการภาพยนตร์ในคลังส่วนตัวของผู้ใช้
* **Query Parameters:**
  * `status` (string, optional: `plan_to_watch`, `watching`, `completed`, `dropped`)
  * `mood` (string, optional: กรองตาม Mood Tag เช่น `Inspiring`)
  * `search` (string, optional: ค้นหาจากชื่อเรื่อง)
* **Response `200 OK`:** รายการ `List[WatchlistResponse]`

#### `POST /api/watchlist`
* **คำอธิบาย:** บันทึกภาพยนตร์เข้าคลังส่วนตัว พร้อมคะแนนรีวิวส่วนตัว
* **Request Body (`WatchlistCreate`):**
```json
{
  "movie_id": 157336,
  "title": "Interstellar",
  "poster_path": "https://image.tmdb.org/t/p/w500/...",
  "release_date": "2014-11-05",
  "genres": ["Adventure", "Drama", "Sci-Fi"],
  "tmdb_rating": 8.4,
  "overview": "The adventures of a group of explorers...",
  "user_rating": 9.5,
  "user_review": "หนึ่งในภาพยนตร์ไซไฟที่ยอดเยี่ยมที่สุด เพลงประกอบทรงพลังมาก",
  "watch_status": "completed",
  "sentiment_label": "Positive",
  "sentiment_score": 0.88,
  "mood_tags": ["Mind-Bending & Complex"]
}
```
* **Response `201 Created`:** คืนค่า `WatchlistResponse` ของรายการที่ถูกสร้าง
* **Error Response `400 Bad Request`:** เมื่อ `movie_id` นี้มีอยู่ในคลังแล้ว

#### `PUT /api/watchlist/{id}`
* **คำอธิบาย:** แก้ไขคะแนนรีวิว, ข้อความวิจารณ์ หรือสถานะการรับชม
* **Path Parameters:** `id` (integer, required - Primary Key ในฐานข้อมูล)
* **Request Body (`WatchlistUpdate`):**
```json
{
  "user_rating": 10.0,
  "user_review": "ดูรอบที่สองแล้วยังคงประทับใจมาก",
  "watch_status": "completed"
}
```
* **Response `200 OK`:** คืนค่า `WatchlistResponse` ที่อัปเดตแล้ว

#### `DELETE /api/watchlist/{id}`
* **คำอธิบาย:** ลบภาพยนตร์ออกจากคลังส่วนตัว
* **Path Parameters:** `id` (integer, required)
* **Response `200 OK`:** `{"status": "success", "message": "Item deleted successfully"}`

#### `GET /api/watchlist/stats`
* **คำอธิบาย:** สรุปสถิติการรับชมแบบไดนามิก (Dynamic Personal Analytics)
* **Response `200 OK`:**
```json
{
  "total_movies": 12,
  "completed_count": 8,
  "watching_count": 2,
  "plan_to_watch_count": 2,
  "dropped_count": 0,
  "avg_user_rating": 8.6,
  "avg_tmdb_rating": 8.1,
  "genre_distribution": { "Drama": 7, "Sci-Fi": 5, "Action": 4 },
  "sentiment_distribution": { "Positive": 8, "Neutral": 3, "Negative": 1 },
  "mood_distribution": { "Mind-Bending & Complex": 4, "Inspiring & Uplifting": 5 }
}
```

#### `GET /api/watchlist/export/csv`
* **คำอธิบาย:** ดาวน์โหลดไฟล์สรุปคลังภาพยนตร์ในรูปแบบ CSV
* **Response `200 OK`:** สตรีมไฟล์แนบ MIME Type `text/csv; charset=utf-8` พร้อม Header `Content-Disposition: attachment; filename=watchlist_export_YYYYMMDD_HHMMSS.csv`

#### `GET /api/watchlist/export/json`
* **คำอธิบาย:** ดาวน์โหลดไฟล์คลังภาพยนตร์ในรูปแบบ JSON
* **Response `200 OK`:** สตรีมไฟล์แนบ MIME Type `application/json` พร้อม Header `Content-Disposition: attachment; filename=watchlist_export_YYYYMMDD_HHMMSS.json`

---

### 4.3 กลุ่มการวิเคราะห์และตั้งค่าระบบ (Sentiment & Config API)

#### `POST /api/sentiment/analyze`
* **คำอธิบาย:** ทดสอบวิเคราะห์คะแนนความรู้สึกและ Mood Tags ของข้อความอิสระ (Ad-hoc Sentiment Analysis)
* **Request Body (`SentimentAnalyzeRequest`):**
```json
{
  "text": "The movie has extraordinary visuals but the pacing is somewhat slow and dry.",
  "movie_title": "Optional Title"
}
```
* **Response `200 OK`:** รายงานการวิเคราะห์ `SentimentResult`

#### `GET /api/config/status`
* **คำอธิบาย:** ตรวจสอบสถานะการเชื่อมต่อ TMDB API และจำนวนรายการในระบบ
* **Response `200 OK`:**
```json
{
  "has_tmdb_key": true,
  "using_mock_fallback": false,
  "version": "1.0.0",
  "total_watchlist_items": 12
}
```

#### `POST /api/config/tmdb-key`
* **คำอธิบาย:** อัปเดต TMDB API Key แบบไดนามิกผ่านหน้าเว็บโดยไม่ต้องรีสตาร์ตเซิร์ฟเวอร์
* **Request Body (`ApiKeyRequest`):** `{"api_key": "YOUR_TMDB_API_KEY"}`
* **Response `200 OK`:** แจ้งสถานะการอัปเดตสำเร็จพร้อมสถานะการเชื่อมต่อใหม่

---

## 5. การแมป Use Cases (12 Use Cases Realization Matrix)

| Use Case ID | ชื่อฟีเจอร์ | โมดูล Back-End | โมดูล Front-End | สถานะการทดสอบ |
| :---: | :--- | :--- | :--- | :---: |
| **UC-01** | **Search Movies by Title** | `routes/movies.py`, `TMDBClient.search_movies` | `Navbar.jsx`, `App.jsx` | ✅ PASSED (Test & UI) |
| **UC-02** | **Trending & Top-Rated Movies** | `routes/movies.py`, `TMDBClient.get_trending_movies` | `MovieCard.jsx`, `App.jsx` | ✅ PASSED (Test & UI) |
| **UC-03** | **View Detailed Movie Profiles** | `routes/movies.py`, `TMDBClient.get_movie_details` | `MovieDetailModal.jsx` | ✅ PASSED (Test & UI) |
| **UC-04** | **Analyze Overview Sentiment** | `services/sentiment_analyzer.py` | `MovieCard.jsx`, `MovieDetailModal.jsx` | ✅ PASSED (Test & UI) |
| **UC-05** | **Add Movie to Watchlist** | `routes/watchlist.py`, `WatchlistRepository.create` | `MovieDetailModal.jsx`, `WatchlistManager.jsx`| ✅ PASSED (Test & UI) |
| **UC-06** | **View, Filter & Sort Watchlist**| `routes/watchlist.py`, `WatchlistRepository.get_all`| `WatchlistManager.jsx` | ✅ PASSED (Test & UI) |
| **UC-07** | **Update Status & Rating** | `routes/watchlist.py`, `WatchlistRepository.update`| `WatchlistManager.jsx` | ✅ PASSED (Test & UI) |
| **UC-08** | **Remove Movie from Watchlist** | `routes/watchlist.py`, `WatchlistRepository.delete`| `WatchlistManager.jsx` | ✅ PASSED (Test & UI) |
| **UC-09** | **Export Watchlist to CSV/JSON**| `routes/watchlist.py`, `export_to_csv/json` | `WatchlistManager.jsx` | ✅ PASSED (Test & UI) |
| **UC-10** | **Dynamic Personal Statistics** | `routes/watchlist.py`, `get_statistics` | `AnalyticsDashboard.jsx` | ✅ PASSED (Test & UI) |
| **UC-11** | **Smart Mood Recommendation** | `services/sentiment_analyzer.py`, `MOOD_KEYWORDS` | `Navbar.jsx`, `SentimentStudio.jsx` | ✅ PASSED (Stretch Goal) |
| **UC-12** | **Resilience Auto-Recovery** | `database.py`, `TMDBClient.fallback` | `ApiKeyModal.jsx`, Error Banners | ✅ PASSED (Stretch Goal) |

---

## 6. คู่มือการใช้งานระบบสำหรับผู้ใช้ (End-User Manual & Operation Guide)

ยินดีต้อนรับสู่คู่มือการใช้งาน **IMDB at home** เว็บแอปพลิเคชันค้นหาภาพยนตร์ ประเมินบรรยากาศด้วย AI Sentiment และบันทึกคลังภาพยนตร์ส่วนตัว

### 6.1 การเข้าใช้งานหน้าหลัก (Discover / Home Screen)
1. เปิดเว็บบราวเซอร์แล้วเข้าไปที่ `http://localhost:5173`
2. ระบบจะแสดงแท็บหลัก 4 แท็บ ได้แก่:
   * **Discover:** หน้าสำรวจภาพยนตร์ยอดนิยม ภาพยนตร์คะแนนสูงสุด และผลการค้นหา
   * **My Watchlist:** หน้าจัดการคลังภาพยนตร์ส่วนตัว
   * **Analytics:** หน้าสรุปสถิติเชิงลึกและพฤติกรรมการรับชมของคุณ
   * **Sentiment Studio:** หน้าทดลองประเมินข้อความวิจารณ์หนังด้วยตนเอง

---

### 6.2 การค้นหาและการเรียกดูภาพยนตร์ (Search & Discover)
1. **การค้นหาภาพยนตร์:**
   * พิมพ์ชื่อภาพยนตร์ที่ต้องการค้นหาลงในช่องค้นหาบน **Navbar** (มุมบนขวา) เช่น *"Inception"* หรือ *"Interstellar"*
   * กดปุ่ม Enter หรือคลิกไอคอนแว่นขยาย ระบบจะค้นหาภาพยนตร์ทันที
2. **การสลับแท็บหนังมาแรงและหนังคะแนนสูงสุด:**
   * คลิกปุ่ม **🔥 Trending This Week** เพื่อดูหนังที่กำลังเป็นกระแส
   * คลิกปุ่ม **⭐ Top Rated Classics** เพื่อดูหนังที่ได้รับคะแนนรีวิวระดับตำนาน
3. **การอ่านป้ายสัญลักษณ์บนการ์ดภาพยนตร์ (Movie Card):**
   * **TMDB Rating:** ตัวเลขคะแนนสีเหลืองทอง (เช่น `8.4 / 10`)
   * **Vibe Score Badge:** แถบเปอร์เซ็นต์สะท้อนความรู้สึกจากเนื้อเรื่องย่อ เช่น `88% Positive` (สีเขียวมรกต), `50% Neutral` (สีเหลืองอำพัน), หรือ `32% Dark/Negative` (สีแดงกุหลาบ)

---

### 6.3 การดูข้อมูลเชิงลึกและการวิเคราะห์ Sentiment (Movie Details Modal)
1. คลิกที่การ์ดภาพยนตร์ใดๆ เพื่อเปิดหน้าต่างป๊อปอัป **Movie Profile**
2. ภายในหน้าต่างจะประกอบด้วย:
   * ข้อมูลทั่วไป: ระยะเวลาฉาย (Runtime), วันที่เข้าฉาย, รายชื่อหมวดหมู่ (Genres), คำโปรย (Tagline)
   * **Vibe Analysis Panel:** กราฟแจกแจงสัดส่วนความรู้สึก (Positive, Neutral, Negative) และแท็กบรรยากาศ (Mood Tags)
   * **Cast List:** รูปและรายชื่อนักแสดงนำ
   * **TMDB Audience Reviews:** บทวิจารณ์จริงจากผู้ชม พร้อมผลวิเคราะห์ Sentiment ของแต่ละรีวิว

---

### 6.4 การเพิ่มภาพยนตร์ลง Watchlist และการเขียนรีวิว (Personal Journal)
1. ในหน้าต่าง Movie Profile คลิกปุ่ม **"+ Add to Watchlist"**
2. เลือกสถานะการรับชมของคุณ:
   * 🕒 **Plan to Watch** (วางแผนจะดู)
   * 🎬 **Watching** (กำลังรับชม)
   * ✅ **Completed** (รับชมจบแล้ว)
   * ⏹️ **Dropped** (หยุดดูกลางคัน)
3. ให้คะแนนความชอบส่วนตัว (คะแนน 1 – 10 ดาว)
4. พิมพ์ความคิดเห็นหรือรีวิวส่วนตัวของคุณในช่อง **Personal Review / Notes**
5. คลิกปุ่ม **"Save to Watchlist"** ระบบจะบันทึกข้อมูลลงฐานข้อมูล SQLite ทันที

---

### 6.5 การจัดการคลังหนังส่วนตัว (Watchlist Management)
1. คลิกที่แท็บ **"My Watchlist"** บนแถบเมนูด้านบน
2. **การกรองและการค้นหา:**
   * กรองตามสถานะการดูโดยคลิกปุ่มสถานะ: All, Plan to Watch, Watching, Completed
   * กรองตาม Mood Tag โดยเลือกจาก Dropdown เมนู
   * ค้นหาชื่อหนังเฉพาะในคลังของตนเอง
3. **การแก้ไขและการลบรายการ:**
   * คลิกปุ่ม **Edit** เพื่อเปลี่ยนสถานะการดู หรือแก้ไขคะแนนและรีวิว
   * คลิกปุ่ม **Delete** เพื่อลบหนังออกจากคลัง (ระบบจะมีข้อความยืนยันเพื่อป้องกันการลบโดยไม่ตั้งใจ)

---

### 6.6 การส่งออกข้อมูลเป็นไฟล์ CSV และ JSON (Export Feature)
1. ในหน้า **My Watchlist** ให้มองหาปุ่มดาวน์โหลดที่มุมขวาบนของตาราง
2. **การ Export เป็นไฟล์ CSV:**
   * คลิกปุ่ม **"Export CSV"**
   * บราวเซอร์จะดาวน์โหลดไฟล์ `watchlist_export_YYYYMMDD_HHMMSS.csv` ทันที สามารถนำไปเปิดใช้งานใน **Microsoft Excel**, **Google Sheets**, หรือ **Numbers** ได้ทันทีโดยภาษาไทยไม่เพี้ยน (มี UTF-8 BOM)
3. **การ Export เป็นไฟล์ JSON:**
   * คลิกปุ่ม **"Export JSON"**
   * บราวเซอร์จะดาวน์โหลดไฟล์ `watchlist_export_YYYYMMDD_HHMMSS.json` สำหรับนำไปใช้ประมวลผลต่อในโปรแกรมอื่น

---

### 6.7 การดูแดชบอร์ดสถิติส่วนบุคคล (Personal Analytics Dashboard)
1. คลิกที่แท็บ **"Analytics"** บนแถบเมนูด้านบน
2. ระบบจะคำนวณและแสดงผลสถิติแบบเรียลไทม์:
   * **Key Metrics:** จำนวนภาพยนตร์ทั้งหมด, จำนวนที่ดูจบแล้ว, คะแนนเฉลี่ยที่คุณให้ เทียบกับคะแนนเฉลี่ย TMDB
   * **Genre Breakdown:** แผนภูมิแท่งแสดงแนวภาพยนตร์ที่คุณโปรดปรานมากที่สุด
   * **Sentiment & Mood Distribution:** สัดส่วนโทนหนังที่คุณสะสม (เช่น ชอบดูหนังโทนอบอุ่นสร้างแรงบันดาลใจ หรือหนังโทนลึกลับซับซ้อน)

---

### 6.8 การใช้งานห้องทดลองความรู้สึก (Sentiment Studio Playground)
1. คลิกที่แท็บ **"Sentiment Studio"**
2. พิมพ์หรือคัดลอกบทความรีวิว/เรื่องย่อภาพยนตร์ที่ต้องการลงในกล่องข้อความ
3. คลิกปุ่ม **"Analyze Atmosphere"**
4. ระบบจะคำนวณและแสดงผล:
   * Polarity Score (-1.0 ถึง +1.0)
   * Vibe Score (0% ถึง 100%)
   * Mood Tags ที่สกัดได้
   * สัดส่วน Positive / Neutral / Negative พร้อมสรุปความหมาย

---

### 6.9 การตั้งค่า TMDB API Key และการใช้งานแบบ Offline (API Configuration)
1. คลิกที่ไอคอนเฟือง ⚙️ หรือปุ่ม **"TMDB Key"** บน Navbar
2. ระบบจะแสดงสถานะปัจจุบัน:
   * `Connected to TMDB API`: เชื่อมต่ออินเทอร์เน็ตและใช้ Key จริง
   * `Using Offline / Mock Catalog`: อยู่ในโหมดออฟไลน์หรือใช้ข้อมูลจำลอง
3. หากต้องการใช้ข้อมูลจริงจาก TMDB: ให้วาง TMDB API Key ของคุณในช่องแล้วกด **"Save Key"** ระบบจะสลับไปดึงข้อมูลจริงทันทีโดยไม่ต้องรีสตาร์ตเซิร์ฟเวอร์

---

## 7. การทดสอบและการควบคุมคุณภาพ (Testing & Quality Assurance)

โครงการนี้ผ่านเกณฑ์การควบคุมคุณภาพตามมาตรฐานวิชาชีพทุกประการ:

### 7.1 การตรวจสอบมาตรฐานโค้ด (PEP 8 Compliance)
* ดำเนินการตรวจสอบด้วย `flake8` ภายใต้การตั้งค่า `backend/.flake8`:
  ```bash
  flake8 backend/app backend/tests --config=backend/.flake8
  ```
* **ผลลัพธ์:** **0 violations (ผ่านเกณฑ์ 100%)**

### 7.2 ชุดการทดสอบอัตโนมัติ (Automated Unit & Integration Tests)
* ดำเนินการทดสอบด้วย `pytest`:
  ```bash
  pytest backend/tests -v
  ```
* **ผลลัพธ์:** **24 passed (100% Passed)**
  * `test_api_routes.py`: 8 การทดสอบครอบคลุม Endpoints ทั้งหมด
  * `test_sentiment_analyzer.py`: 5 การทดสอบครอบคลุม Negation, Mood Tags, $\tanh$ Scale
  * `test_tmdb_client.py`: 7 การทดสอบครอบคลุม Fallback Resilience, Network Failure, Data Formatting
  * `test_watchlist_repo.py`: 4 การทดสอบครอบคลุม CRUD, Filter, Dynamic Stats, CSV/JSON Export

### 7.3 การทดสอบอัตโนมัติผ่าน CI/CD Pipeline (GitHub Actions)
* กำหนดค่าไว้ใน `.github/workflows/ci.yml` รันอัตโนมัติทุกครั้งเมื่อมีการ `git push` หรือสร้าง `pull_request` ไปยัง Branch `main`
* ประกอบด้วย Job ตรวจสอบ Flake8, รัน Pytest 24 ชุด และทดสอบ Build Production Assets ของ React Frontend
