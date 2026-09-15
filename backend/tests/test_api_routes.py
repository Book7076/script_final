"""Integration tests for FastAPI endpoints."""

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# Create isolated test database with StaticPool so all sessions share in-memory tables
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


def override_get_db():
    """Override database dependency with in-memory session."""
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_test_database():
    """Create fresh tables before each test and drop after."""
    Base.metadata.create_all(bind=test_engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()


client = TestClient(app)


def test_root_and_config_status():
    """Verify health and configuration status endpoints."""
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "online"

    config_resp = client.get("/api/config/status")
    assert config_resp.status_code == 200
    data = config_resp.json()
    assert "has_tmdb_key" in data
    assert "version" in data


def test_update_tmdb_key_endpoint():
    """Verify dynamic TMDB key update endpoint."""
    resp = client.post("/api/config/tmdb-key", json={"api_key": "custom_test_key_12345"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_movies_trending_endpoint():
    """Verify UC-02: Trending movies endpoint."""
    resp = client.get("/api/movies/trending?time_window=week")
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    assert len(data["results"]) > 0
    # Ensure sentiment was attached to movie items
    assert "sentiment" in data["results"][0]


def test_movies_top_rated_endpoint():
    """Verify UC-02: Top rated movies endpoint."""
    resp = client.get("/api/movies/top-rated")
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    assert len(data["results"]) > 0


def test_movies_search_endpoint():
    """Verify UC-01: Search movies by title."""
    resp = client.get("/api/movies/search?query=Inception")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["results"]) > 0
    assert "Inception" in data["results"][0]["title"]


def test_movie_detail_profile_endpoint():
    """Verify UC-03: View detailed movie profile."""
    # Inception mock id: 27205
    resp = client.get("/api/movies/27205")
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Inception"
    assert "cast" in data
    assert "reviews" in data
    assert "sentiment" in data


def test_sentiment_analysis_endpoint():
    """Verify ad-hoc sentiment analysis endpoint."""
    payload = {
        "text": "An awe-inspiring masterpiece that left me in absolute tears and wonder.",
        "movie_title": "Interstellar",
    }
    resp = client.post("/api/sentiment/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["sentiment_label"] == "Positive"
    assert data["polarity"] > 0
    assert "summary" in data


def test_watchlist_workflow():
    """Verify Watchlist full lifecycle: add, list, update, stats, export, delete."""
    # 1. Add movie
    create_payload = {
        "movie_id": 27205,
        "title": "Inception",
        "poster_path": "/path.jpg",
        "release_date": "2010-07-15",
        "genres": ["Action", "Sci-Fi"],
        "tmdb_rating": 8.4,
        "overview": "Dream heist movie.",
        "user_rating": 9.0,
        "user_review": "Awesome film!",
        "watch_status": "completed",
        "sentiment_label": "Positive",
        "sentiment_score": 85.0,
        "mood_tags": ["Mind-Bending & Complex"],
    }
    post_resp = client.post("/api/watchlist", json=create_payload)
    assert post_resp.status_code == 201
    created = post_resp.json()
    item_id = created["id"]
    assert created["title"] == "Inception"

    # 2. Get list
    get_resp = client.get("/api/watchlist")
    assert get_resp.status_code == 200
    items = get_resp.json()
    assert len(items) == 1

    # 3. Get stats
    stats_resp = client.get("/api/watchlist/stats")
    assert stats_resp.status_code == 200
    assert stats_resp.json()["total_movies"] == 1
    assert stats_resp.json()["completed_count"] == 1

    # 4. Update
    put_resp = client.put(
        f"/api/watchlist/{item_id}",
        json={"user_rating": 10.0, "user_review": "Upgraded to 10."},
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["user_rating"] == 10.0

    # 5. Export CSV
    csv_resp = client.get("/api/watchlist/export/csv")
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers.get("content-type", "")
    assert "Inception" in csv_resp.text

    # 6. Export JSON
    json_resp = client.get("/api/watchlist/export/json")
    assert json_resp.status_code == 200
    assert "application/json" in json_resp.headers.get("content-type", "")
    assert len(json_resp.json()) == 1

    # 7. Delete
    del_resp = client.delete(f"/api/watchlist/{item_id}")
    assert del_resp.status_code == 200

    # Verify empty after delete
    empty_list = client.get("/api/watchlist").json()
    assert len(empty_list) == 0
