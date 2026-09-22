# 📝 Final Term Project Pitch & Sprint 1 Report: IMDB at home

**รหัสวิชา:** CP352301 Script Programming (ภาคการศึกษา 1/2569)  
**วันนำเสนอ Sprint 1:** 15–16 กันยายน 2569 | **วันส่งงาน:** 18 กันยายน 2569  
**ไฟล์สมุดงานประจำ Sprint:** [IMDB_at_home_sprint1.ipynb](./IMDB_at_home_sprint1.ipynb)

---

## 1. Project Title
**IMDB at home** (Movie Sentiment & Watchlist Manager)

## 2. Problem Statement
ผู้ใช้งานทั่วไปมักประสบปัญหาความยุ่งยากในการค้นหาภาพยนตร์ที่ตรงกับอารมณ์ความรู้สึกในขณะนั้น และขาดระบบจัดเก็บรายการภาพยนตร์ส่วนตัวที่บันทึกบทวิเคราะห์หรือความรู้สึกหลังรับชมได้อย่างเป็นระบบ ทำให้การตัดสินใจเลือกชมภาพยนตร์ใช้เวลานานและไม่ตรงกับความต้องการจริง

## 3. Proposed Solution
**IMDB at home** เป็น Full-Stack Web Application ที่ช่วยให้ผู้ใช้ค้นหาข้อมูลภาพยนตร์ ประเมินบรรยากาศของภาพยนตร์ผ่านระบบ Sentiment Analysis จากบทวิเคราะห์/เรื่องย่อ และจัดเก็บคลังภาพยนตร์ส่วนตัว (Watchlist) พร้อมระบบบันทึกรีวิว การให้คะแนน และสรุปสถิติการรับชมส่วนบุคคลแบบไดนามิก รองรับการส่งออกข้อมูลเป็นไฟล์ CSV และ JSON

## 4. Domain
✅ **Data Analysis & Management / Daily Apps**  
*(❌ Not Allowed: Information Systems, Financial Apps, Government Apps, ERP)*

## 5. API(s) to Use
* **API Name:** TMDB (The Movie Database) API (v3)
* **Documentation Link:** [https://developer.themoviedb.org/docs/getting-started](https://developer.themoviedb.org/docs/getting-started)
* **Type of Data:** Movie Metadata (`Title`, `Overview`, `Genres`, `Rating`, `Release Date`, `Poster Path`, `Cast`, `Reviews`) ในรูปแบบ JSON
* **Fallback Strategy:** วางแผนระบบ Embedded Mock Catalog สำหรับรองรับกรณีเครือข่ายขัดข้อง หรือไม่มี TMDB API Key ให้โปรแกรมยังคงทำงานต่อไปได้ 100%

## 6. Data Persistence Plan & Layer Separation
สถาปัตยกรรมแบ่งออกเป็น 3 เลเยอร์หลักตามหลักการ Separation of Concerns:
* **Data Access Layer (DAL):** Mini database (SQLite: `imdb_home.db`) สำหรับจัดการตาราง `watchlist_items` พร้อมระบบ File I/O สำหรับ Export ข้อมูลเป็น CSV และ JSON
* **Business Logic Layer (BLL):** พัฒนาด้วย Python FastAPI สำหรับประมวลผล Sentiment Analysis, อัลกอริทึมการค้นหา (Searching), กรองข้อมูล (Filtering) และเรียงลำดับ (Sorting)
* **Presentation Layer (PL):** React.js + Tailwind CSS สไตล์ Cinematic Dark Mode พร้อมระบบ Client-side Input Validation

---

## 7. Roles & Responsibilities (Sprint 1 Allocation)

| สมาชิกทีม | บทบาทหน้าที่ | ความรับผิดชอบหลัก |
| :--- | :--- | :--- |
| **บวรนันต์ ตะบองทอง** | **Chief Systems Architect** | ออกแบบสถาปัตยกรรมระบบ 3 เลเยอร์, วางโครงสร้าง OOP Classes, ควบคุมเกณฑ์ Definition of Done (DoD) และวางแผนเอกสาร `PLAN.md` |
| **กิตติธัช ปลั่งกลาง** | **Technical Planner & Infrastructure Lead** | วางแผนเอกสาร `PLAN.md`, บริหารจัดการ GitHub Repository, โครงสร้างโฟลเดอร์, ตั้งค่า Virtual Environment และจัดทำ CI/CD Pipeline บน GitHub Actions |
| **ไชยวัฒน์ แจ่มกลาง** | **Core Developer (Backend & API Engine)** | เริ่มต้นโครงสร้าง Python FastAPI, วางแผนเชื่อมต่อ TMDB API, วางแผนโมดูล Sentiment Analysis และออกแบบ SQL Schema สำหรับ CRUD |
| **กุลศยา จันภูงา** | **Core Developer (Frontend) & QA Debugger** | ออกแบบโครงสร้างหน้าตาเว็บไซต์ด้วย React.js, กำหนดเกณฑ์ Unit Test บน `pytest` และตรวจสอบการจัดการ Exception Handling และ Edge Cases เบื้องต้น |

---

## 8. Features & Use Cases Breakdown (12 Use Cases)

ระบบแบ่งออกเป็น **MVP (10 Core Functions)** และ **Stretch Features (2 Optional Functions)**:

### 🎯 ส่วน MVP (10 Core Functions)
1. **UC-01: Search Movies by Title** — ค้นหาข้อมูลภาพยนตร์แบบ Real-time ผ่าน TMDB API พร้อมแสดงผลเบื้องต้น
2. **UC-02: Fetch Trending & Top-Rated Movies** — ดึงรายการภาพยนตร์ยอดนิยมประจำสัปดาห์และภาพยนตร์คะแนนสูงสุด
3. **UC-03: View Detailed Movie Profiles** — แสดงข้อมูลเชิงลึกของภาพยนตร์ เรื่องย่อ นักแสดง และบทวิจารณ์
4. **UC-04: Analyze Overview Sentiment** — วิเคราะห์อารมณ์และบรรยากาศของภาพยนตร์จากเรื่องย่อด้วย NLP Rule Engine
5. **UC-05: Add Movie to Watchlist** — บันทึกรายการภาพยนตร์ลงคลังส่วนตัวใน SQLite
6. **UC-06: View, Filter & Sort Watchlist** — เรียกดู กรองตามสถานะการรับชม (Plan to Watch / Watching / Completed) และเรียงลำดับ
7. **UC-07: Update Watchlist Status & Rating** — ปรับปรุงสถานะ บันทึกคะแนนส่วนตัว (1–10 ดาว) และเขียนรีวิว
8. **UC-08: Remove Movie from Watchlist** — ลบรายการภาพยนตร์ออกจากคลังส่วนตัว
9. **UC-09: Export Watchlist to CSV/JSON** — ส่งออกข้อมูลคลังภาพยนตร์เป็นไฟล์ CSV และ JSON ผ่าน Endpoint
10. **UC-10: Generate Personal Statistics** — ประมวลผลและสรุปสถิติการดูหนัง คะแนนเฉลี่ย และแนวหนังที่ชื่นชอบ

### 🚀 ส่วน Stretch Features (2 Optional Functions)
11. **UC-11: Smart Mood Recommendation** — ระบบแนะนำภาพยนตร์ตามโทนอารมณ์และบรรยากาศที่ผู้ใช้เลือก
12. **UC-12: Backup & Restore System** — ระบบสำรองและฟื้นฟูข้อมูลฐานข้อมูล SQLite

---

## 🧪 9. ผลการทดสอบระบบ (Quality Assurance Report - Sprint 1)

| รายการทดสอบ | อินพุตที่ใช้ | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง | สถานะ |
| :--- | :--- | :--- | :--- | :---: |
| **1. ค้นหาหนังด้วย Keyword** | `Inception` | คืนค่า JSON รายชื่อหนังจาก TMDB API | ดึงข้อมูล JSON ได้ถูกต้องพร้อม HTTP 200 | **PASSED** |
| **2. การลบช่องว่าง/ตัวพิมพ์** | `  batman  ` | ตัดช่องว่างด้วย `.strip().lower()` ก่อนส่งยิง API | ระบบประมวลผลคำว่า `batman` ได้ถูกต้อง | **PASSED** |
| **3. ดักจับข้อผิดพลาด (Exception)** | กรอกข้อมูลผิดประเภท | ดักจับด้วย `try-except` ไม่ให้โปรแกรมพัง | คืนค่า Error Response แจ้งเตือนผู้ใช้ | **PASSED** |
| **4. เชื่อมต่อฐานข้อมูล** | `init_db()` | สร้างไฟล์ `imdb_home.db` และตารางสำเร็จ | ไฟล์ DB ถูกสร้างพร้อม Schema ที่กำหนด | **PASSED** |

---

## 🔄 10. สรุปบทเรียนประจำสัปดาห์ (Retrospective: Wow! & Whoops!)

* **Wow! (ส่วนที่ทำได้ดี):**
  * สามารถออกแบบสถาปัตยกรรมแบบแยกส่วน (Modular 3-Layer Separation) ระหว่าง Presentation, Business Logic และ Data Access ได้อย่างชัดเจน
  * วางระบบ CI/CD Pipeline ผ่าน GitHub Actions ตั้งแต่วันแรก รันผ่านทันที และตั้งค่า `.flake8` เพื่อควบคุมมาตรฐาน PEP 8
* **Whoops! (ปัญหาที่พบและการแก้ไข):**
  * **ปัญหา:** ในช่วงแรกการรับส่งค่าคำค้นหาภาพยนตร์เกิดข้อผิดพลาดจากตัวพิมพ์ใหญ่และช่องว่างส่วนเกิน
  * **การแก้ไข:** ได้เพิ่ม Data Sanitization โดยใช้ `.strip().lower()` ก่อนส่งข้อมูลเข้าสู่ API Layer
