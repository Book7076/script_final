"""Sentiment analysis endpoints."""

from fastapi import APIRouter

from app.schemas import SentimentAnalyzeRequest, SentimentResult
from app.services.sentiment_analyzer import SentimentAnalyzer

router = APIRouter(prefix="/api/sentiment", tags=["Sentiment Analysis"])

analyzer = SentimentAnalyzer()


@router.post("/analyze", response_model=SentimentResult)
def analyze_custom_text(payload: SentimentAnalyzeRequest):
    """Analyze movie overview, review, or thoughts to extract sentiment and mood vibes."""
    result = analyzer.analyze(text=payload.text, movie_title=payload.movie_title)
    return result
