"""Main FastAPI application entrypoint for IMDB at home.

จุดเริ่มต้นของเซิร์ฟเวอร์ Backend (FastAPI Application Entrypoint)
ทำหน้าที่:
1. สร้างตารางฐานข้อมูล SQLite อัตโนมัติเมื่อเริ่มรัน
2. ตั้งค่า CORS Middleware เพื่ออนุญาตให้ Frontend (React) ส่งคำขอข้ามโดเมนได้
3. ลงทะเบียน API Routers (Movies, Watchlist, Sentiment)
4. ให้บริการ Health Check และ Endpoint ตรวจสอบ/อัปเดตสถานะ TMDB API Key
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import WatchlistItem
from app.routes.movies import router as movies_router, tmdb_client
from app.routes.sentiment import router as sentiment_router
from app.routes.watchlist import router as watchlist_router
from app.schemas import ApiKeyRequest, ConfigStatusResponse

# สร้างตารางข้อมูลใน SQLite ตาม Model ที่กำหนดไว้ใน models.py ทันทีเมื่อเซิร์ฟเวอร์เริ่มทำงาน
Base.metadata.create_all(bind=engine)

# สร้างอินสแตนซ์หลักของ FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Full-Stack Web Application for Movie Sentiment Analysis, "
        "TMDB Movie Discovery, and Personal Watchlist Management."
    ),
)

# ตั้งค่า CORS (Cross-Origin Resource Sharing) เพื่อให้ React Frontend (พอร์ต 5173) เรียกใช้ API ได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ลงทะเบียนโมดูลเส้นทาง (Routers) ทั้งหมดเข้ากับแอปพลิเคชันหลัก
app.include_router(movies_router)       # เส้นทาง /api/movies
app.include_router(watchlist_router)    # เส้นทาง /api/watchlist
app.include_router(sentiment_router)    # เส้นทาง /api/sentiment


@app.get("/", tags=["Health"])
def root():
    """Endpoint ตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์ (Health Check)."""
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
    }


@app.get("/api/config/status", response_model=ConfigStatusResponse, tags=["Config"])
def get_config_status():
    """ตรวจสอบสถานะการเชื่อมต่อ TMDB API และจำนวนข้อมูลในฐานข้อมูล SQLite."""
    db = SessionLocal()
    try:
        total_items = db.query(WatchlistItem).count()
    finally:
        db.close()

    has_key = tmdb_client.has_valid_key()
    return {
        "has_tmdb_key": has_key,
        "using_mock_fallback": not has_key,
        "version": settings.VERSION,
        "total_watchlist_items": total_items,
    }


@app.post("/api/config/tmdb-key", tags=["Config"])
def update_tmdb_key(payload: ApiKeyRequest):
    """ตั้งค่าหรืออัปเดต TMDB API Key แบบไดนามิกผ่านหน้าบ้าน (Frontend Modal) โดยไม่ต้องรีสตาร์ต."""
    tmdb_client.set_api_key(payload.api_key)
    return {
        "success": True,
        "message": "TMDB API key updated successfully.",
        "has_valid_key": tmdb_client.has_valid_key(),
    }
