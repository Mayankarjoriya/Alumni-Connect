import logging
import sys
from logging.handlers import RotatingFileHandler

def setup_logging() -> None:
    """
    Configure structured logging for the application.
    - Console: INFO level with colour-friendly format
    - File:    DEBUG level, rotating at 5MB, keeps 3 backups
    """
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    fmt = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler
    console = logging.StreamHandler(sys.stdout)
    console.setLevel(logging.INFO)
    console.setFormatter(fmt)
    root.addHandler(console)

    # Rotating file handler
    try:
        file_handler = RotatingFileHandler(
            "logs/alumni_connect.log",
            maxBytes=5 * 1024 * 1024,  # 5 MB
            backupCount=3,
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(fmt)
        root.addHandler(file_handler)
    except FileNotFoundError:
        # logs/ directory doesn't exist yet — will be created on first run
        import os
        os.makedirs("logs", exist_ok=True)
        file_handler = RotatingFileHandler(
            "logs/alumni_connect.log",
            maxBytes=5 * 1024 * 1024,
            backupCount=3,
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(fmt)
        root.addHandler(file_handler)

    # Suppress noisy library loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
