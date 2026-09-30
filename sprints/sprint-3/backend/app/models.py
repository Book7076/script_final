"""SQLAlchemy database models."""

from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.database import Base


class WatchlistItem(Base):
    """Model representing a movie stored in the user's personal watchlist."""

    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    movie_id = Column(Integer, unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    poster_path = Column(String(255), nullable=True)
    backdrop_path = Column(String(255), nullable=True)
    release_date = Column(String(50), nullable=True)
    genres = Column(String(255), default="")
    tmdb_rating = Column(Float, default=0.0)
    overview = Column(Text, default="")
    user_rating = Column(Float, default=0.0)
    user_review = Column(Text, default="")
    watch_status = Column(String(50), default="plan_to_watch")
    sentiment_label = Column(String(50), default="Neutral")
    sentiment_score = Column(Float, default=0.5)
    mood_tags = Column(String(255), default="")
    added_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert model instance to Python dictionary."""
        return {
            "id": self.id,
            "movie_id": self.movie_id,
            "title": self.title,
            "poster_path": self.poster_path,
            "backdrop_path": self.backdrop_path,
            "release_date": self.release_date,
            "genres": [g.strip() for g in self.genres.split(",") if g.strip()]
            if self.genres
            else [],
            "tmdb_rating": self.tmdb_rating,
            "overview": self.overview,
            "user_rating": self.user_rating,
            "user_review": self.user_review,
            "watch_status": self.watch_status,
            "sentiment_label": self.sentiment_label,
            "sentiment_score": self.sentiment_score,
            "mood_tags": [m.strip() for m in self.mood_tags.split(",") if m.strip()]
            if self.mood_tags
            else [],
            "added_at": self.added_at.isoformat() if self.added_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
