"""Watchlist endpoints for CRUD operations, analytics, and CSV/JSON exports.

โมดูล API จัดการคลังภาพยนตร์ส่วนตัว (Watchlist Router)
ทำหน้าที่เป็นตัวกลาง (Controller) รับข้อมูลจาก Frontend เพื่อจัดการข้อมูลในฐานข้อมูล SQLite:
1. Frontend (React) -> ส่งคำขอบันทึก, แก้ไข, ลบ, ดูสถิติ, หรือดาวน์โหลดไฟล์
2. WatchlistRepository (Service/Repo) -> ดำเนินการ CRUD และประมวลผลทางธุรกิจกับฐานข้อมูล
3. SQLite Database (imdb_home.db) -> บันทึกข้อมูลคงอยู่ถาวร (Data Persistence)
4. Export Engine -> แปลงข้อมูลเป็นไฟล์ CSV หรือ JSON ส่งกลับไปให้ผู้ใช้ดาวน์โหลด
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    WatchlistCreate,
    WatchlistResponse,
    WatchlistStatsResponse,
    WatchlistUpdate,
)
from app.services.watchlist_repo import WatchlistRepository

# กำหนดเส้นทางหลัก /api/watchlist
router = APIRouter(prefix="/api/watchlist", tags=["Watchlist"])


def _to_watchlist_response(item) -> dict:
    """ฟังก์ชันแปลง Model ของ SQLAlchemy ให้เป็น Dictionary ที่ตรงกับ Pydantic Schema."""
    return item.to_dict()


@router.get("", response_model=List[WatchlistResponse])
def get_watchlist(
    status: Optional[str] = Query(None),
    mood: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("added_at"),
    order: str = Query("desc"),
    db: Session = Depends(get_db),
):
    """ดึงรายการภาพยนตร์ใน Watchlist ทั้งหมด พร้อมรองรับการกรอง ค้นหา และจัดเรียง.

    [Data Flow การทำงาน]:
    Frontend (หน้า Watchlist) -> ส่งพารามิเตอร์กรอง (status, mood, search) ->
    get_db ส่ง Database Session เข้ามา -> WatchlistRepository.get_all() query ใน SQLite ->
    ส่งรายการภาพยนตร์กลับไปแสดงผลบนการ์ด Watchlist ใน Frontend
    """
    repo = WatchlistRepository(db)
    items = repo.get_all(
        status=status,
        mood=mood,
        search=search,
        sort_by=sort_by,
        order=order,
    )
    return [_to_watchlist_response(item) for item in items]


@router.post("", response_model=WatchlistResponse, status_code=201)
def add_to_watchlist(payload: WatchlistCreate, db: Session = Depends(get_db)):
    """เพิ่มภาพยนตร์ลงใน Watchlist หรืออัปเดตข้อมูลหากมีบันทึกอยู่แล้ว.

    [Data Flow การทำงาน]:
    Frontend (กด Bookmark หรือกดบันทึกใน Modal) -> ส่ง JSON Payload (WatchlistCreate) ->
    WatchlistRepository.create() -> บันทึกลงตาราง watchlist_items ใน SQLite ->
    ส่งข้อมูลที่บันทึกสำเร็จกลับไปอัปเดต UI ทันที
    """
    repo = WatchlistRepository(db)
    item = repo.create(payload)
    return _to_watchlist_response(item)


@router.get("/stats", response_model=WatchlistStatsResponse)
def get_watchlist_statistics(db: Session = Depends(get_db)):
    """ดึงสถิติการรับชมแบบไดนามิก (Dynamic Watch Statistics).

    [Data Flow การทำงาน]:
    Frontend (หน้า Analytics) -> get_watchlist_statistics() ->
    WatchlistRepository.get_statistics() -> รวบรวมข้อมูลใน SQLite ทั้งหมด ->
    คำนวณจำนวนเรื่องที่ดู, คะแนนเฉลี่ย, สัดส่วน Genres, สัดส่วน Mood ->
    ส่งคืน WatchlistStatsResponse ไปสร้างกราฟและ KPI Widgets ในหน้า Analytics
    """
    repo = WatchlistRepository(db)
    return repo.get_statistics()


@router.get("/export/csv")
def export_watchlist_csv(db: Session = Depends(get_db)):
    """ส่งออกข้อมูลคลังภาพยนตร์เป็นไฟล์ CSV สำหรับดาวน์โหลด.

    [Data Flow การทำงาน]:
    ผู้ใช้คลิกปุ่ม 'Export CSV' -> Frontend เรียก GET /api/watchlist/export/csv ->
    WatchlistRepository.export_to_csv() -> ดึงข้อมูลและแปลงเป็นรูปแบบ CSV ตามมาตรฐาน RFC 4180 ->
    แนบ Header Content-Disposition: attachment -> เบราว์เซอร์ดาวน์โหลดไฟล์อัตโนมัติ
    """
    repo = WatchlistRepository(db)
    csv_data = repo.export_to_csv()
    headers = {
        "Content-Disposition": "attachment; filename=imdb_at_home_watchlist.csv"
    }
    return Response(
        content=csv_data, media_type="text/csv; charset=utf-8", headers=headers
    )


@router.get("/export/json")
def export_watchlist_json(db: Session = Depends(get_db)):
    """ส่งออกข้อมูลคลังภาพยนตร์เป็นไฟล์ JSON สำหรับดาวน์โหลด.

    [Data Flow การทำงาน]:
    ผู้ใช้คลิกปุ่ม 'Export JSON' -> Frontend เรียก GET /api/watchlist/export/json ->
    WatchlistRepository.export_to_json() -> สร้าง JSON Indented String ->
    แนบ Header Content-Disposition: attachment -> เบราว์เซอร์ดาวน์โหลดไฟล์ JSON
    """
    repo = WatchlistRepository(db)
    json_data = repo.export_to_json()
    headers = {
        "Content-Disposition": "attachment; filename=imdb_at_home_watchlist.json"
    }
    return Response(
        content=json_data,
        media_type="application/json; charset=utf-8",
        headers=headers,
    )


@router.get("/{item_id}", response_model=WatchlistResponse)
def get_watchlist_item(item_id: int, db: Session = Depends(get_db)):
    """ดึงข้อมูลภาพยนตร์รายการใดรายการหนึ่งด้วย ID."""
    repo = WatchlistRepository(db)
    item = repo.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found.")
    return _to_watchlist_response(item)


@router.put("/{item_id}", response_model=WatchlistResponse)
def update_watchlist_item(
    item_id: int, payload: WatchlistUpdate, db: Session = Depends(get_db)
):
    """อัปเดตสถานะการรับชม คะแนน หรือรีวิวส่วนตัว.

    [Data Flow การทำงาน]:
    Frontend (แก้ไขข้อมูลแบบ Inline บนการ์ด) -> ส่ง JSON WatchlistUpdate ->
    WatchlistRepository.update() -> อัปเดตข้อมูลใน SQLite -> ส่งคืนข้อมูลล่าสุด
    """
    repo = WatchlistRepository(db)
    item = repo.update(item_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found.")
    return _to_watchlist_response(item)


@router.delete("/{item_id}", status_code=200)
def delete_watchlist_item(item_id: int, db: Session = Depends(get_db)):
    """ลบภาพยนตร์ออกจาก Watchlist.

    [Data Flow การทำงาน]:
    ผู้ใช้กดปุ่ม Delete บนการ์ด -> Frontend ส่งคำขอ DELETE พร้อม item_id ->
    WatchlistRepository.delete() -> ลบเรคอร์ดออกจาก SQLite -> ส่งข้อความยืนยันสำเร็จ
    """
    repo = WatchlistRepository(db)
    success = repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Watchlist item not found.")
    return {"message": f"Watchlist item {item_id} successfully removed."}
