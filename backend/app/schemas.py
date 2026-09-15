"""Pydantic schemas for data validation and API request/response serialization."""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SentimentBreakdown(BaseModel):
    """Breakdown of sentiment polarity distribution."""

    positive: float = Field(0.0, ge=0.0, le=1.0)
    neutral: float = Field(0.0, ge=0.0, le=1.0)
    negative: float = Field(0.0, ge=0.0, le=1.0)


class SentimentResult(BaseModel):
    """Detailed sentiment analysis report."""

    polarity: float = Field(..., ge=-1.0, le=1.0)
    vibe_score: float = Field(..., ge=0.0, le=100.0)
    sentiment_label: str  # Positive, Neutral, Negative
    subjectivity: float = Field(..., ge=0.0, le=1.0)
    mood_tags: List[str] = []
    keywords: List[str] = []
    summary: str
    breakdown: SentimentBreakdown


class MovieCastMember(BaseModel):
    """Cast member profile."""

    id: int
    name: str
    character: Optional[str] = None
    profile_path: Optional[str] = None


class MovieReviewItem(BaseModel):
    """Review snippet from TMDB."""

    author: str
    content: str
    rating: Optional[float] = None
    sentiment: Optional[SentimentResult] = None


class MovieItem(BaseModel):
    """Movie metadata item."""

    id: int
    title: str
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    genres: List[str] = []
    tmdb_rating: float = 0.0
    vote_count: int = 0
    overview: str = ""
    sentiment: Optional[SentimentResult] = None


class MovieDetailResponse(MovieItem):
    """Detailed movie view including runtime, budget, cast, and sentiment."""

    runtime: Optional[int] = None
    tagline: Optional[str] = None
    cast: List[MovieCastMember] = []
    reviews: List[MovieReviewItem] = []


class MovieListResponse(BaseModel):
    """Paginated or standard list of movies."""

    page: int = 1
    total_results: int = 0
    total_pages: int = 1
    results: List[MovieItem] = []


class WatchlistCreate(BaseModel):
    """Schema for adding a movie to personal watchlist."""

    movie_id: int
    title: str
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    genres: List[str] = []
    tmdb_rating: float = 0.0
    overview: str = ""
    user_rating: float = Field(0.0, ge=0.0, le=10.0)
    user_review: str = ""
    watch_status: str = Field("plan_to_watch")
    sentiment_label: Optional[str] = "Neutral"
    sentiment_score: Optional[float] = 0.5
    mood_tags: List[str] = []


class WatchlistUpdate(BaseModel):
    """Schema for updating an existing watchlist record."""

    user_rating: Optional[float] = Field(None, ge=0.0, le=10.0)
    user_review: Optional[str] = None
    watch_status: Optional[str] = None
    sentiment_label: Optional[str] = None
    sentiment_score: Optional[float] = None
    mood_tags: Optional[List[str]] = None


class WatchlistResponse(BaseModel):
    """Schema for returning a watchlist item."""

    id: int
    movie_id: int
    title: str
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    genres: List[str] = []
    tmdb_rating: float = 0.0
    overview: str = ""
    user_rating: float = 0.0
    user_review: str = ""
    watch_status: str = "plan_to_watch"
    sentiment_label: str = "Neutral"
    sentiment_score: float = 0.5
    mood_tags: List[str] = []
    added_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class WatchlistStatsResponse(BaseModel):
    """Aggregated personal watch statistics."""

    total_movies: int = 0
    completed_count: int = 0
    watching_count: int = 0
    plan_to_watch_count: int = 0
    dropped_count: int = 0
    avg_user_rating: float = 0.0
    avg_tmdb_rating: float = 0.0
    genre_distribution: Dict[str, int] = {}
    sentiment_distribution: Dict[str, int] = {}
    mood_distribution: Dict[str, int] = {}


class SentimentAnalyzeRequest(BaseModel):
    """Request payload for arbitrary text sentiment analysis."""

    text: str = Field(..., min_length=1)
    movie_title: Optional[str] = None


class ApiKeyRequest(BaseModel):
    """Payload to update the TMDB API key at runtime."""

    api_key: str


class ConfigStatusResponse(BaseModel):
    """System and TMDB connection status."""

    has_tmdb_key: bool
    using_mock_fallback: bool
    version: str
    total_watchlist_items: int
