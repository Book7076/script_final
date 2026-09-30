"""Application configuration settings."""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load .env file automatically
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class Settings:
    """Settings loaded from environment variables with defaults."""

    PROJECT_NAME: str = "IMDB at home"
    VERSION: str = "1.0.0"

    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY", "")
    TMDB_BASE_URL: str = os.getenv(
        "TMDB_BASE_URL", "https://api.themoviedb.org/3"
    )
    TMDB_IMAGE_BASE: str = "https://image.tmdb.org/t/p"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./imdb_home.db")

    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
