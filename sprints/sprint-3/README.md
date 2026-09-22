# 📝 Final Term Project Report: Sprint 3 - Full-Stack Integration & Edge Case Resilience

**ชื่อโปรเจกต์:** IMDB at home (Movie Sentiment & Watchlist Manager)  
**รหัสวิชา:** CP352301 Script Programming (ภาคการศึกษา 1/2569)  
**กำหนดส่งงาน Sprint 3:** 2 ตุลาคม 2569  
**ไฟล์สมุดงานประจำ Sprint:** [IMDB_at_home_sprint3.ipynb](./IMDB_at_home_sprint3.ipynb)

---

## 1. การหมุนเวียนบทบาทหน้าที่ในทีม (Sprint 3 Role Rotation)

ตามกำหนดการหมุนเวียนบทบาท (Role-Based Allocations) ในคู่มือปฏิบัติงาน Sprint 3 สมาชิกทีมได้ปรับเปลี่ยนบทบาทเพื่อให้เรียนรู้ครบทุกมิติ ดังนี้:

| สมาชิกทีม | บทบาทหน้าที่ใน Sprint 3 | ความรับผิดชอบหลัก |
| :--- | :--- | :--- |
| **กุลศยา จันภูงา** | **Planner & Architect** | ออกแบบข้อกำหนดการเชื่อมต่อระบบ (Integration Specification) ใน `PLAN.md`, นิยาม End-to-End Definition of Done (DoD) และวางแผนเตรียมการสาธิตระบบสด (Live Demo) |
| **บวรนันต์ ตะบองทอง** | **Planner & Full-Stack Architect** | ออกแบบการเชื่อมต่อ UI/UX เข้ากับ API Endpoints, วางโครงสร้าง Data Consistency และออกแบบการจัดการ App State |
| **กิตติธัช ปลั่งกลาง** | **Core Full-Stack Developer (Coder)** | เขียนโค้ดเชื่อมต่อ Front-End (React) เข้ากับ Back-End (FastAPI) ฝั่ง State Management, CRUD Operations และเรียกร้องบริการ Business Logic ทั้งหมด |
| **ไชยวัฒน์ แจ่มกลาง** | **QA Debugger & Tester** | ออกแบบการทดสอบสภาวะขอบเขต (Edge Cases Testing), ตรวจสอบ Exception Resilience ทั้งระบบ (จำลองไฟล์หาย, API Down, Invalid State) และควบคุมคุณภาพ Pull Requests (PR) |

---

## 2. โจทย์ เป้าหมาย และเงื่อนไขความเสร็จสมบูรณ์ (Objectives & Definition of Done)

* **โจทย์ & เป้าหมายประจำ Sprint 3:**
  เชื่อมต่อระบบ Front-End และ Back-End เข้าด้วยกันอย่างสมบูรณ์แบบ (Full-Stack Integration), จัดการสถานะแอปพลิเคชัน (State Management) และความสอดคล้องของข้อมูล (Data Consistency), พร้อมเสริมความทนทานต่อกรณีขอบเขต (Edge Cases Resilience)
* **Definition of Done (DoD):**
  1. **Full-Stack Wiring:** UI สามารถเรียกใช้งานฟังก์ชัน CRUD, Search, Filter, Sort และ Export ของ Back-End ได้อย่างไร้รอยต่อ
  2. **Data Consistency & State:** ข้อมูลในหน่วยความจำ (React State) และไฟล์ฐานข้อมูล (SQLite: `imdb_home.db`) ต้องสอดคล้องกันตลอดเวลาเมื่อมีการอัปเดตสถานะ
  3. **Edge Case Resilience:** ระบบต้องมี `try-except` ครอบคลุมทุกชั้น สามารถจัดการ Error (เช่น ไฟล์ DB เสียหาย, ค่าอินพุตผิดช่วง, ค้นหาค่าว่าง) โดยแสดงแจ้งเตือนอย่างเหมาะสมและโปรแกรมไม่ Crash 100%

---

## 3. สรุปความก้าวหน้าและการพัฒนาจริง (Execution & Code Details)

* [x] **Full-Stack Wiring (`frontend/src/services/api.js`, `App.jsx`):**
  * พัฒนา API Service Client เชื่อมต่อไปยัง FastAPI Endpoints (`/api/movies`, `/api/watchlist`, `/api/sentiment`)
  * สร้างหน้าตาเว็บสไตล์ **Cinematic Dark-Mode Glassmorphism** ผ่านคอมโพเนนต์:
    * `Navbar.jsx`: เมนูนำทาง ค้นหา และปุ่มตั้งค่า TMDB Key
    * `MovieCard.jsx`: การ์ดภาพยนตร์ แสดงโปสเตอร์ คะแนน และ Sentiment Vibe Badge
    * `MovieDetailModal.jsx`: ป๊อปอัปดูรายละเอียดเชิงลึก วิเคราะห์ Sentiment เรื่องย่อ และ Journal รีวิว
    * `WatchlistManager.jsx`: ตารางคลังหนังส่วนตัว รองรับการกรองตาม Status/Mood, แก้ไขคะแนน และ Export CSV/JSON
    * `AnalyticsDashboard.jsx`: กราฟและสถิติการรับชมส่วนบุคคลแบบไดนามิก
    * `SentimentStudio.jsx`: สนามทดลองพิมพ์ข้อความเพื่อวิเคราะห์ค่า Polarity และ Vibe แบบสด
* [x] **State Management & Persistence:**
  * ปรับใช้ **Optimistic UI Updates** ควบคู่ไปกับการซิงค์ข้อมูลลง SQLite ทันที ทำให้ UI ตอบสนองรวดเร็วและข้อมูลไม่คลาดเคลื่อน
* [x] **Search, Filter & Sort Integration:**
  * รองรับการจัดเรียงคลังหนังตามคะแนน Vibe Score, TMDB Rating, ชื่อเรื่อง และวันที่บันทึก
* [x] **Edge Case & Exception Resilience Engine:**
  * **Auto-Recovery:** หากไม่พบไฟล์ `imdb_home.db` ระบบจะทำการรัน `init_db()` สร้าง Schema และตารางเริ่มต้นให้ใหม่อัตโนมัติโดยไม่พัง
  * **Boundary Value Protection:** ดักจับการกรอกคะแนนรีวิวที่ติดลบหรือเกิน 10 โดยมีฟังก์ชันตรวจสอบทั้งฝั่ง Frontend และ Backend Pydantic Validator
  * **Empty Search Sanitization:** ตัดช่องว่างด้วย `.strip()` หากเป็นค่าว่างระบบจะไม่ส่ง Request และแจ้งเตือนผู้ใช้อย่างสุภาพ
  * **Graceful Degradation / Server Disconnect:** หากเซิร์ฟเวอร์ Backend ปิดตัวลงหรือเครือข่ายหลุด หน้าเว็บจะแสดง Notification Banner แจ้งเตือนอย่างนุ่มนวล ไม่เกิดหน้าจอขาว (White Screen of Death)

---

## 🧪 4. ผลการทดสอบระบบ (Quality Assurance & Debugging Report - Sprint 3)

| รหัส | หมวดหมู่ | รายการทดสอบ / สถานการณ์ | อินพุต / Action | ผลลัพธ์ที่คาดหวัง | ผลการทดสอบจริง | สถานะ |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC01** | Full-Stack Integration | เพิ่มหนังลง Watchlist ผ่าน UI | กดปุ่ม "Add to Watchlist" บน UI | ข้อมูลถูกบันทึกลง SQLite และ UI อัปเดตทันที | UI แสดงสถานะใหม่ และ DB บันทึกสำเร็จ | **PASSED** |
| **TC02** | Data Consistency | แก้ไขคะแนนรีวิวและเรียกดูกลับ | อัปเดตคะแนนเป็น 9/10 แล้วรีเฟรชหน้าเว็บ | ข้อมูลใน DB สอดคล้องกับ UI ที่แสดงผล | คะแนนอัปเดตตรงกันทั้ง State และ Database | **PASSED** |
| **TC03** | Edge Case (Missing File) | เปิดระบบเมื่อไม่มีไฟล์ `imdb_home.db` | ลบไฟล์ DB แล้วรันระบบ | สร้างไฟล์และตารางให้อัตโนมัติ โดยระบบไม่พัง | ระบบสร้างไฟล์ DB ใหม่และทำงานได้ปกติ | **PASSED** |
| **TC04** | Edge Case (Invalid Input) | ป้อนคะแนนรีวิวติดลบ (`-5`) | กรอกคะแนน -5 ในฟอร์มรีวิว | ปฏิเสธค่า และแสดงข้อความแจ้งเตือนผู้ใช้ | ระบบแสดงเตือน "กรุณากรอกคะแนน 0–10" | **PASSED** |
| **TC05** | Edge Case (Empty Search) | กดค้นหาโดยไม่พิมพ์ข้อความ | ใส่ช่องว่าง `"   "` ในช่องค้นหา | ระบบไม่ยิง API และแจ้งเตือนให้กรอกคำค้น | ระบบตัดช่องว่าง และแจ้งเตือนถูกต้อง | **PASSED** |
| **TC06** | Algorithm Execution | เรียงลำดับคลังหนังตามคะแนน Vibe Score | กด Sort by "Vibe Score (High-Low)" | แสดงรายการหนังเรียงจาก Vibe Score มากไปน้อย | ระบบจัดเรียงข้อมูลถูกต้อง (< 20ms) | **PASSED** |
| **TC07** | Exception Resilience | จำลอง Server Disconnect ขณะกด Export | ปิด Backend Server แล้วกด Export CSV | UI ไม่ค้าง แสดงข้อความ "Unable to Connect" | แสดง Error Banner บน UI นิ่มนวล ไม่ Crash | **PASSED** |
| **TC08** | Automated Integration | รัน Integration Tests ทั้งระบบ | รันสคริปต์ `pytest backend/tests` | ผ่าน Test Cases ของ Full-Stack ทั้งหมด | ผ่านการทดสอบ 24/24 (100% Passed) | **PASSED** |

---

## 🔄 5. สรุปบทเรียนประจำสัปดาห์ (Retrospective: Wow! & Whoops!)

* **Wow! (ส่วนที่ทำได้ดี):**
  * การเชื่อมต่อ Front-End กับ Back-End เป็นไปอย่างรวดเร็วและไร้รอยต่อ เนื่องจากวางสถาปัตยกรรมแบบ 3-Layer และมี API Contract ชัดเจนตั้งแต่ Sprint 1–2
  * ระบบมีความทนทานสูงต่อกรณีขอบเขต (Edge Case Resilience) สามารถกู้คืนตัวเองได้ (Auto-Recovery) หากไฟล์ DB หาย และมี Error Banner ที่เป็นมิตรกับผู้ใช้
* **Whoops! (ปัญหาที่พบและการแก้ไข):**
  * **ปัญหา:** เกิดปัญหา Data Desynchronization เมื่อผู้ใช้อัปเดตสถานะหนังรวดเร็วหลายครั้ง ทำให้ข้อมูลบน UI ไม่ตรงกับไฟล์บันทึกใน SQLite
  * **การแก้ไข:** ได้ Refactor โค้ดส่วน State Management ให้ทำ Optimistic UI Updates ควบคู่ไปกับการบังคับ Re-fetch/Sync ข้อมูลล่าสุดจาก Database ทันทีหลังจากเขียนข้อมูลสำเร็จ
