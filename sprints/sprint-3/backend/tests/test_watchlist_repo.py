"""Unit tests for the OOP WatchlistRepository service."""

import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.schemas import WatchlistCreate, WatchlistUpdate
from app.services.watchlist_repo import WatchlistRepository


def get_test_db_session():
    """Create isolated in-memory SQLite database session for tests."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    return TestingSessionLocal()


def test_watchlist_crud_operations():
    """Verify standard Create, Read, Update, Delete in SQLite."""
    session = get_test_db_session()
    repo = WatchlistRepository(session)

    # 1. Create
    movie_payload = WatchlistCreate(
        movie_id=27205,
        title="Inception",
        poster_path="/path.jpg",
        release_date="2010-07-15",
        genres=["Action", "Science Fiction"],
        tmdb_rating=8.4,
        overview="Cobb is a skilled dream thief.",
        user_rating=9.5,
        user_review="Mind blowing story!",
        watch_status="completed",
        sentiment_label="Positive",
        sentiment_score=85.0,
        mood_tags=["Mind-Bending & Complex"],
    )
    created = repo.create(movie_payload)
    assert created.id is not None
    assert created.title == "Inception"
    assert created.watch_status == "completed"

    # 2. Read by ID and movie_id
    fetched = repo.get_by_id(created.id)
    assert fetched is not None
    assert fetched.title == "Inception"

    fetched_by_mid = repo.get_by_movie_id(27205)
    assert fetched_by_mid is not None
    assert fetched_by_mid.id == created.id

    # 3. Update
    update_data = WatchlistUpdate(
        user_rating=10.0,
        user_review="Absolute classic, revised to 10/10.",
        watch_status="completed",
    )
    updated = repo.update(created.id, update_data)
    assert updated.user_rating == 10.0
    assert "revised" in updated.user_review

    # 4. Delete
    deleted = repo.delete(created.id)
    assert deleted is True
    assert repo.get_by_id(created.id) is None


def test_watchlist_filters_and_search():
    """Verify filtering by status, mood, and title search."""
    session = get_test_db_session()
    repo = WatchlistRepository(session)

    repo.create(
        WatchlistCreate(
            movie_id=1,
            title="The Dark Knight",
            genres=["Action", "Crime"],
            watch_status="completed",
            sentiment_label="Dark",
            mood_tags=["Dark & Gritty"],
        )
    )
    repo.create(
        WatchlistCreate(
            movie_id=2,
            title="Spirited Away",
            genres=["Animation", "Family"],
            watch_status="plan_to_watch",
            sentiment_label="Positive",
            mood_tags=["Heartwarming"],
        )
    )

    # Filter by status
    completed_items = repo.get_all(status="completed")
    assert len(completed_items) == 1
    assert completed_items[0].title == "The Dark Knight"

    # Filter by mood
    heartwarming = repo.get_all(mood="Heartwarming")
    assert len(heartwarming) == 1
    assert heartwarming[0].title == "Spirited Away"

    # Search by title
    search_res = repo.get_all(search="Knight")
    assert len(search_res) == 1
    assert search_res[0].title == "The Dark Knight"


def test_watchlist_statistics():
    """Verify aggregated watch analytics calculations."""
    session = get_test_db_session()
    repo = WatchlistRepository(session)

    # Empty stats
    empty_stats = repo.get_statistics()
    assert empty_stats["total_movies"] == 0

    repo.create(
        WatchlistCreate(
            movie_id=101,
            title="Movie A",
            genres=["Drama", "Action"],
            tmdb_rating=8.0,
            user_rating=9.0,
            watch_status="completed",
            sentiment_label="Positive",
            mood_tags=["Inspiring"],
        )
    )
    repo.create(
        WatchlistCreate(
            movie_id=102,
            title="Movie B",
            genres=["Drama"],
            tmdb_rating=7.0,
            user_rating=8.0,
            watch_status="watching",
            sentiment_label="Positive",
            mood_tags=["Inspiring"],
        )
    )

    stats = repo.get_statistics()
    assert stats["total_movies"] == 2
    assert stats["completed_count"] == 1
    assert stats["watching_count"] == 1
    assert stats["avg_user_rating"] == 8.5
    assert stats["avg_tmdb_rating"] == 7.5
    assert stats["genre_distribution"]["Drama"] == 2
    assert stats["sentiment_distribution"]["Positive"] == 2


def test_export_to_csv_and_json():
    """Verify CSV and JSON export output generation."""
    session = get_test_db_session()
    repo = WatchlistRepository(session)

    repo.create(
        WatchlistCreate(
            movie_id=500,
            title="Export Test Movie",
            genres=["Sci-Fi"],
            tmdb_rating=8.2,
            user_rating=8.5,
            watch_status="completed",
            user_review="Great export test",
        )
    )

    # Test CSV export
    csv_text = repo.export_to_csv()
    assert "Title" in csv_text
    assert "Export Test Movie" in csv_text
    assert "completed" in csv_text

    # Test JSON export
    json_text = repo.export_to_json()
    parsed = json.loads(json_text)
    assert isinstance(parsed, list)
    assert len(parsed) == 1
    assert parsed[0]["title"] == "Export Test Movie"
    assert parsed[0]["user_rating"] == 8.5
