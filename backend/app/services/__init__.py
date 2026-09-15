"""Services package containing core OOP classes."""

from app.services.tmdb_client import TMDBClient
from app.services.sentiment_analyzer import SentimentAnalyzer
from app.services.watchlist_repo import WatchlistRepository

__all__ = ["TMDBClient", "SentimentAnalyzer", "WatchlistRepository"]
