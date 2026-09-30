"""Unit tests for the OOP TMDBClient service."""

from unittest.mock import MagicMock, patch
import requests

from app.services.tmdb_client import TMDBClient


def test_tmdb_client_initialization():
    """Verify initialization and dynamic key updating."""
    client = TMDBClient(api_key="test_dummy_key_123")
    assert client.has_valid_key() is True
    assert client.api_key == "test_dummy_key_123"

    client.set_api_key("new_key_xyz")
    assert client.api_key == "new_key_xyz"


def test_tmdb_fallback_trending():
    """Verify trending movies fallback returns valid movies with metadata."""
    client = TMDBClient(api_key="")
    data = client.get_trending()

    assert "results" in data
    assert len(data["results"]) > 0
    first_movie = data["results"][0]
    assert "id" in first_movie
    assert "title" in first_movie
    assert "tmdb_rating" in first_movie
    assert "genres" in first_movie


def test_tmdb_fallback_top_rated():
    """Verify top-rated movies are ordered by rating."""
    client = TMDBClient(api_key="")
    data = client.get_top_rated()

    assert "results" in data
    results = data["results"]
    assert len(results) >= 2
    # Verify rating is descending or equal
    for i in range(len(results) - 1):
        assert results[i]["tmdb_rating"] >= results[i + 1]["tmdb_rating"]


def test_tmdb_fallback_search():
    """Verify movie search finds matching titles."""
    client = TMDBClient(api_key="")

    # Search for 'Inception'
    data = client.search_movies(query="Inception")
    assert len(data["results"]) > 0
    assert any("Inception" in m["title"] for m in data["results"])

    # Search for non-existent movie
    no_match = client.search_movies(query="xyz987nonexistenttitle")
    assert len(no_match["results"]) == 0

    # Search with empty query
    empty = client.search_movies(query="   ")
    assert len(empty["results"]) == 0


def test_tmdb_fallback_details():
    """Verify fetching detailed profile with cast and reviews."""
    client = TMDBClient(api_key="")
    # 27205 is Inception in the mock catalog
    details = client.get_movie_details(27205)

    assert details["title"] == "Inception"
    assert "cast" in details
    assert len(details["cast"]) > 0
    assert "reviews" in details
    assert len(details["reviews"]) > 0


def test_tmdb_network_error_fallback():
    """Verify that network exceptions trigger mock fallback without raising an unhandled error."""
    client = TMDBClient(api_key="valid_looking_key_abc123")

    with patch("requests.get", side_effect=requests.RequestException("Network timeout")):
        trending = client.get_trending()
        assert "results" in trending
        assert len(trending["results"]) > 0

        details = client.get_movie_details(27205)
        assert details["title"] == "Inception"


def test_tmdb_api_success_formatting():
    """Verify parsing and format conversion when TMDB returns live 200 payload."""
    client = TMDBClient(api_key="real_api_key_mock")

    mock_payload = {
        "page": 1,
        "total_results": 1,
        "total_pages": 1,
        "results": [
            {
                "id": 9999,
                "title": "Simulated Live Movie",
                "poster_path": "/poster.jpg",
                "backdrop_path": "/backdrop.jpg",
                "release_date": "2024-01-01",
                "genre_ids": [28, 878],  # Action, Science Fiction
                "vote_average": 8.7,
                "vote_count": 1200,
                "overview": "A live TMDB simulated film.",
            }
        ],
    }

    mock_resp = MagicMock()
    mock_resp.json.return_value = mock_payload
    mock_resp.raise_for_status.return_value = None

    with patch("requests.get", return_value=mock_resp):
        res = client.get_trending()
        assert res["total_results"] == 1
        assert res["results"][0]["title"] == "Simulated Live Movie"
        assert "Action" in res["results"][0]["genres"]
        assert "Science Fiction" in res["results"][0]["genres"]
