import os

class Settings:
    PROJECT_NAME: str = "Alumni Connect API - Centralized Platform"
    PROJECT_VERSION: str = "1.0.0"
    
    # Default to SQLite, can be overridden with Postgres, MySQL, etc. via DATABASE_URL
    # e.g., postgresql://user:password@localhost:5432/alumni_db
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./alumni_connect.db")
    
    # CORS Origins
    CORS_ORIGINS: list = ["*"]

settings = Settings()
