"""Movie endpoints interfacing with TMDBClient and SentimentAnalyzer.

โมดูล API เส้นทางภาพยนตร์ (Movies Router)
ทำหน้าที่เป็นตัวกลาง (Controller) เชื่อมประสานการทำงานระหว่าง:
1. Frontend (React) -> ส่งคำขอค้นหา/เปิดดูหนัง
2. TMDBClient (Service) -> ยิงขอข้อมูลเมทาดาทาภาพยนตร์จาก The Movie Database API
3. SentimentAnalyzer (Service) -> นำเรื่องย่อและบทวิจารณ์มาวิเคราะห์อารมณ์/บรรยากาศ (NLP)
4. Schemas (Pydantic) -> ตรวจสอบความถูกต้องและแปลงรูปแบบข้อมูลก่อนส่งกลับ Frontend
"""

from fastapi import APIRouter, HTTPException, Query

from app.schemas import MovieDetailResponse, MovieListResponse
from app.services.sentiment_analyzer import SentimentAnalyzer
from app.services.tmdb_client import TMDBClient

# ประกาศ Router สำหรับจัดกลุ่มเส้นทางที่ขึ้นต้นด้วย /api/movies
router = APIRouter(prefix="/api/movies", tags=["Movies"])

# สร้าง Object Instance ของ Class เพื่อใช้งานตลอด Lifecycle ของแอปพลิเคชัน
tmdb_client = TMDBClient()  # คลาสจัดการการเชื่อมต่อ TMDB API ภายนอก
sentiment_analyzer = SentimentAnalyzer()  # คลาสวิเคราะห์อารมณ์และความรู้สึก (NLP)


def _attach_sentiment_to_movies(movie_data: dict) -> dict:
    """ฟังก์ชันช่วย (Helper Function) สำหรับผนวกผลวิเคราะห์ Sentiment เข้ากับรายการภาพยนตร์.

    [Data Flow การทำงาน]:
    1. รับพจนานุกรมข้อมูลภาพยนตร์ (movie_data) ที่ได้มาจาก TMDBClient
    2. วนลูปอ่านรายการภาพยนตร์ทีละเรื่องใน results
    3. ดึงข้อความเรื่องย่อ (overview)
    4. ส่งข้อความ overview ไปให้ sentiment_analyzer.analyze() คำนวณคะแนน
    5. นำผลลัพธ์ (คะแนน vibe, mood tags, polarity) แปะลงในคีย์ 'sentiment' ของแต่ละเรื่อง
    6. ส่งคืนโครงสร้างข้อมูลที่สมบูรณ์พร้อมส่งกลับไปยัง Frontend
    """
    results = movie_data.get("results", [])
    for item in results:
        overview = item.get("overview", "")
        # คำนวณ Sentiment จากเนื้อเรื่องย่อ (overview) โดยไม่นำชื่อเรื่องไปประมวลผล
        item["sentiment"] = sentiment_analyzer.analyze(text=overview)
    return movie_data


@router.get("/trending", response_model=MovieListResponse)
def get_trending_movies(
    time_window: str = Query("week", pattern="^(day|week)$"),
    page: int = Query(1, ge=1),
):
    """[UC-02] ดึงรายการภาพยนตร์ที่กำลังมาแรง (Trending Movies).

    [Data Flow การทำงาน]:
    Frontend (ส่งคำขอ GET) -> movies.py -> TMDBClient.get_trending() ->
    ได้ข้อมูลดิบ -> _attach_sentiment_to_movies() -> SentimentAnalyzer ->
    แปลงเป็น MovieListResponse -> ส่งกลับให้ Frontend แสดงผลบนการ์ดภาพยนตร์
    """
    # 1. เรียกใช้ TMDBClient เพื่อดึงข้อมูลภาพยนตร์มาแรงจาก TMDB API
    data = tmdb_client.get_trending(time_window=time_window, page=page)

    # 2. นำข้อมูลที่ได้มาวิเคราะห์ Sentiment ของเรื่องย่อแต่ละเรื่อง แล้วส่งคืน Frontend
    return _attach_sentiment_to_movies(data)


@router.get("/top-rated", response_model=MovieListResponse)
def get_top_rated_movies(page: int = Query(1, ge=1)):
    """[UC-02] ดึงรายการภาพยนตร์ที่ได้คะแนนสูงสุด (Top-Rated Movies).

    [Data Flow การทำงาน]:
    Frontend -> movies.py -> TMDBClient.get_top_rated() ->
    _attach_sentiment_to_movies() -> ตอบกลับ Frontend
    """
    # 1. เรียก TMDBClient เพื่อดึงหนังที่ได้คะแนนโหวตสูงสุด
    data = tmdb_client.get_top_rated(page=page)

    # 2. เสริมผลวิเคราะห์ Sentiment ให้ทุกเรื่อง ก่อนส่งกลับไปยังหน้า Discover
    return _attach_sentiment_to_movies(data)


@router.get("/search", response_model=MovieListResponse)
def search_movies(
    query: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
):
    """[UC-01] ค้นหาภาพยนตร์ด้วยชื่อเรื่อง (Search Movies by Title).

    [Data Flow การทำงาน]:
    Frontend (พิมพ์คำค้นหาใน Search Bar) -> ส่ง query มาที่ /api/movies/search ->
    TMDBClient.search_movies(query) -> ยิงค้นหากับเซิร์ฟเวอร์ TMDB ->
    _attach_sentiment_to_movies() -> ได้ผลลัพธ์พร้อม Sentiment Badge -> Frontend
    """
    # 1. ส่งคำค้นหาของผู้ใช้ไปให้ TMDBClient ยิงค้นหาข้อมูล
    data = tmdb_client.search_movies(query=query, page=page)

    # 2. วิเคราะห์อารมณ์ภาพยนตร์ที่ค้นพบ แล้วตอบกลับ Frontend
    return _attach_sentiment_to_movies(data)


@router.get("/{movie_id}", response_model=MovieDetailResponse)
def get_movie_profile(movie_id: int):
    """[UC-03] แสดงรายละเอียดเชิงลึกของภาพยนตร์ (Detailed Movie Profile).

    [Data Flow การทำงาน]:
    1. ผู้ใช้คลิกการ์ดภาพยนตร์บนหน้าเว็บ -> Frontend ส่ง movie_id มาที่ Endpoint นี้
    2. movies.py เรียก tmdb_client.get_movie_details(movie_id)
       - ได้ข้อมูลโครงสร้างลึก: เรื่องย่อ, ภาพ Backdrop, นักแสดง (Cast), บทวิจารณ์ (Reviews)
    3. ส่งเรื่องย่อ (overview) เข้า SentimentAnalyzer เพื่อคำนวณ Vibe Score และ Mood Tags
    4. วนลูปนำบทวิจารณ์แต่ละอัน (reviews) ส่งเข้า SentimentAnalyzer เพื่อให้คะแนนรีวิวแต่ละชิ้น
    5. ส่งคืน MovieDetailResponse ให้ Frontend นำไปเรนเดอร์ในหน้าต่าง Modal
    """
    # 1. ดึงรายละเอียดเชิงลึกจาก TMDB
    details = tmdb_client.get_movie_details(movie_id)
    if not details:
        raise HTTPException(status_code=404, detail="Movie not found.")

    # 2. วิเคราะห์ Sentiment ของเนื้อเรื่องย่อหลัก (Overview) โดยไม่นำชื่อเรื่องไปประมวลผล
    overview_text = details.get("overview", "")
    details["sentiment"] = sentiment_analyzer.analyze(text=overview_text)

    # 3. วิเคราะห์ Sentiment ของบทวิจารณ์จากผู้ชม/นักวิจารณ์ (Reviews) แต่ละชิ้น
    for review in details.get("reviews", []):
        review_content = review.get("content", "")
        review["sentiment"] = sentiment_analyzer.analyze(text=review_content)

    # 4. ส่งข้อมูลที่สมบูรณ์กลับไปเปิดในหน้าต่าง MovieDetailModal บน Frontend
    return details
