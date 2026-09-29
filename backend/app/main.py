from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.logging_config import setup_logging
from app.core.middleware import RequestLoggingMiddleware, SecurityHeadersMiddleware
from app.seed import seed_initial_data

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.posts import router as posts_router
from app.routers.messages import router as messages_router
from app.routers.admin import router as admin_router
from app.routers.faculty import router as faculty_router
from app.routers.projects import router as projects_router

# ── Logging ──────────────────────────────────────────────────────────────────
setup_logging()
logger = logging.getLogger("alumni_connect")

# ── Rate Limiter (SlowAPI) ────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])


# ── App Lifecycle ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Alumni Connect API starting up  [env=%s]", settings.ENVIRONMENT)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield
    logger.info("🛑 Alumni Connect API shutting down")


# ── App Instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan,
    # Hide /docs and /redoc in production
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
)

# Attach rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Middleware Stack ──────────────────────────────────────────────────────────
# NOTE: FastAPI applies middleware in reverse-registration order.
# The LAST one added runs FIRST for incoming requests.

# 1. Security response headers (runs last on response, first on request)
app.add_middleware(SecurityHeadersMiddleware)

# 2. Request / response logging + trace IDs
app.add_middleware(RequestLoggingMiddleware)

# 3. SlowAPI rate limiting
app.add_middleware(SlowAPIMiddleware)

# 4. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)

# 5. TrustedHost – only in production to avoid breaking local dev
if settings.is_production:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["alumni-connect.example.com", "*.alumni-connect.example.com"],
    )

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(posts_router)
app.include_router(messages_router)
app.include_router(admin_router)
app.include_router(faculty_router)
app.include_router(projects_router)


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "operational",
        "environment": settings.ENVIRONMENT,
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
