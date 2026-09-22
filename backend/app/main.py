from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.seed import seed_initial_data

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.posts import router as posts_router
from app.routers.messages import router as messages_router
from app.routers.admin import router as admin_router
from app.routers.faculty import router as faculty_router
from app.routers.projects import router as projects_router
from app.routers.bulletin import router as bulletin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed demo records if DB is empty
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Feature Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(posts_router)
app.include_router(messages_router)
app.include_router(admin_router)
app.include_router(faculty_router)
app.include_router(projects_router)
app.include_router(bulletin_router)

@app.get("/")
def root():
    return {"message": "Alumni Connect Centralized API operational (SQLite/SQLAlchemy)!"}
