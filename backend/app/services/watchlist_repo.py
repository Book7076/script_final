"""OOP Repository for Watchlist management, SQLite persistence, analytics, and data export."""

import csv
import io
import json
from typing import Any, Dict, List, Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models import WatchlistItem
from app.schemas import WatchlistCreate, WatchlistUpdate


class WatchlistRepository:
    """Object-Oriented repository for SQLite CRUD, analytics, and data export."""

    def __init__(self, db: Session):
        """Initialize repository with active SQLAlchemy session."""
        self.db = db

    def get_all(
        self,
        status: Optional[str] = None,
        mood: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "added_at",
        order: str = "desc",
    ) -> List[WatchlistItem]:
        """Fetch all watchlist items matching optional filter parameters."""
        query = self.db.query(WatchlistItem)

        if status and status.lower() != "all":
            query = query.filter(WatchlistItem.watch_status == status.lower())

        if mood and mood.lower() != "all":
            query = query.filter(WatchlistItem.mood_tags.ilike(f"%{mood}%"))

        if search:
            query = query.filter(WatchlistItem.title.ilike(f"%{search}%"))

        # Sorting
        sort_column = getattr(WatchlistItem, sort_by, WatchlistItem.added_at)
        if order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(desc(sort_column))

        return query.all()

    def get_by_id(self, item_id: int) -> Optional[WatchlistItem]:
        """Fetch single item by primary key."""
        return self.db.query(WatchlistItem).filter(WatchlistItem.id == item_id).first()

    def get_by_movie_id(self, movie_id: int) -> Optional[WatchlistItem]:
        """Fetch single item by TMDB movie ID."""
        return (
            self.db.query(WatchlistItem)
            .filter(WatchlistItem.movie_id == movie_id)
            .first()
        )

    def create(self, data: WatchlistCreate) -> WatchlistItem:
        """Add movie to personal watchlist."""
        existing = self.get_by_movie_id(data.movie_id)
        if existing:
            # If already exists, update status and rating
            existing.user_rating = data.user_rating
            existing.user_review = data.user_review
            existing.watch_status = data.watch_status
            if data.sentiment_label:
                existing.sentiment_label = data.sentiment_label
            if data.sentiment_score is not None:
                existing.sentiment_score = data.sentiment_score
            if data.mood_tags:
                existing.mood_tags = ", ".join(data.mood_tags)
            self.db.commit()
            self.db.refresh(existing)
            return existing

        genres_str = ", ".join(data.genres) if isinstance(data.genres, list) else data.genres
        mood_str = ", ".join(data.mood_tags) if isinstance(data.mood_tags, list) else data.mood_tags

        item = WatchlistItem(
            movie_id=data.movie_id,
            title=data.title,
            poster_path=data.poster_path,
            backdrop_path=data.backdrop_path,
            release_date=data.release_date,
            genres=genres_str or "",
            tmdb_rating=data.tmdb_rating,
            overview=data.overview,
            user_rating=data.user_rating,
            user_review=data.user_review,
            watch_status=data.watch_status or "plan_to_watch",
            sentiment_label=data.sentiment_label or "Neutral",
            sentiment_score=data.sentiment_score or 0.5,
            mood_tags=mood_str or "",
        )

        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item_id: int, data: WatchlistUpdate) -> Optional[WatchlistItem]:
        """Update review, rating, status or mood tags for a watchlist item."""
        item = self.get_by_id(item_id)
        if not item:
            return None

        if data.user_rating is not None:
            item.user_rating = data.user_rating
        if data.user_review is not None:
            item.user_review = data.user_review
        if data.watch_status is not None:
            item.watch_status = data.watch_status
        if data.sentiment_label is not None:
            item.sentiment_label = data.sentiment_label
        if data.sentiment_score is not None:
            item.sentiment_score = data.sentiment_score
        if data.mood_tags is not None:
            item.mood_tags = ", ".join(data.mood_tags)

        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item_id: int) -> bool:
        """Remove movie from watchlist."""
        item = self.get_by_id(item_id)
        if not item:
            return False

        self.db.delete(item)
        self.db.commit()
        return True

    def get_statistics(self) -> Dict[str, Any]:
        """Calculate dynamic watch statistics and analytics."""
        items = self.db.query(WatchlistItem).all()
        total_movies = len(items)

        if total_movies == 0:
            return {
                "total_movies": 0,
                "completed_count": 0,
                "watching_count": 0,
                "plan_to_watch_count": 0,
                "dropped_count": 0,
                "avg_user_rating": 0.0,
                "avg_tmdb_rating": 0.0,
                "genre_distribution": {},
                "sentiment_distribution": {},
                "mood_distribution": {},
            }

        completed_count = sum(1 for i in items if i.watch_status == "completed")
        watching_count = sum(1 for i in items if i.watch_status == "watching")
        plan_count = sum(1 for i in items if i.watch_status == "plan_to_watch")
        dropped_count = sum(1 for i in items if i.watch_status == "dropped")

        rated_items = [i.user_rating for i in items if i.user_rating > 0]
        avg_user_rating = (
            round(sum(rated_items) / len(rated_items), 1) if rated_items else 0.0
        )
        avg_tmdb_rating = round(
            sum(i.tmdb_rating for i in items) / total_movies, 1
        )

        # Genre distribution
        genre_counts: Dict[str, int] = {}
        for item in items:
            if item.genres:
                for g in item.genres.split(","):
                    name = g.strip()
                    if name:
                        genre_counts[name] = genre_counts.get(name, 0) + 1

        # Sentiment distribution
        sentiment_counts: Dict[str, int] = {}
        for item in items:
            label = item.sentiment_label or "Neutral"
            sentiment_counts[label] = sentiment_counts.get(label, 0) + 1

        # Mood distribution
        mood_counts: Dict[str, int] = {}
        for item in items:
            if item.mood_tags:
                for m in item.mood_tags.split(","):
                    tag = m.strip()
                    if tag:
                        mood_counts[tag] = mood_counts.get(tag, 0) + 1

        return {
            "total_movies": total_movies,
            "completed_count": completed_count,
            "watching_count": watching_count,
            "plan_to_watch_count": plan_count,
            "dropped_count": dropped_count,
            "avg_user_rating": avg_user_rating,
            "avg_tmdb_rating": avg_tmdb_rating,
            "genre_distribution": dict(
                sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:8]
            ),
            "sentiment_distribution": sentiment_counts,
            "mood_distribution": dict(
                sorted(mood_counts.items(), key=lambda x: x[1], reverse=True)[:8]
            ),
        }

    def export_to_csv(self) -> str:
        """Export full watchlist as CSV formatted string."""
        items = self.db.query(WatchlistItem).order_by(WatchlistItem.added_at.desc()).all()
        output = io.StringIO()
        writer = csv.writer(output)

        # CSV Header
        writer.writerow(
            [
                "ID",
                "TMDB_Movie_ID",
                "Title",
                "Release_Date",
                "Genres",
                "TMDB_Rating",
                "User_Rating",
                "Watch_Status",
                "Sentiment_Label",
                "Sentiment_Score",
                "Mood_Tags",
                "User_Review",
                "Overview",
                "Added_At",
            ]
        )

        for item in items:
            writer.writerow(
                [
                    item.id,
                    item.movie_id,
                    item.title,
                    item.release_date or "",
                    item.genres or "",
                    item.tmdb_rating,
                    item.user_rating,
                    item.watch_status,
                    item.sentiment_label,
                    item.sentiment_score,
                    item.mood_tags or "",
                    item.user_review or "",
                    item.overview or "",
                    item.added_at.isoformat() if item.added_at else "",
                ]
            )

        return output.getvalue()

    def export_to_json(self) -> str:
        """Export full watchlist as indented JSON string."""
        items = self.db.query(WatchlistItem).order_by(WatchlistItem.added_at.desc()).all()
        data = [item.to_dict() for item in items]
        return json.dumps(data, indent=2, ensure_ascii=False)
