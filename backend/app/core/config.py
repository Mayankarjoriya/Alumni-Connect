import os
from typing import List

class Settings:
    PROJECT_NAME: str = "Alumni Connect API - Centralized Platform"
    PROJECT_VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./alumni_connect.db")

    # JWT / Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "alumni-connect-super-secret-key-change-in-production-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

    # CORS – restrict to your frontend origins
    # In production: set CORS_ORIGINS env var to comma-separated list
    _origins_env: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    CORS_ORIGINS: List[str] = [o.strip() for o in _origins_env.split(",")]

    # Rate limiting – requests per minute per IP
    RATE_LIMIT: str = os.getenv("RATE_LIMIT", "60/minute")

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")  # development | production

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

settings = Settings()
