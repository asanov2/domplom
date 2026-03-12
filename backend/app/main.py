from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import async_session
from app.models.user import User
from app.services.minio_service import ensure_bucket


async def create_default_admin():
    """Create default admin user if it doesn't exist."""
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == "admin@gmail.com"))
        if result.scalar_one_or_none() is None:
            admin = User(
                email="admin@gmail.com",
                password_hash=hash_password("admin"),
                role="admin",
            )
            session.add(admin)
            await session.commit()
            print("Default admin user created: admin@gmail.com")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure MinIO bucket exists
    try:
        ensure_bucket()
    except Exception as e:
        print(f"Warning: Could not connect to MinIO: {e}")
    # Create default admin
    try:
        await create_default_admin()
    except Exception as e:
        print(f"Warning: Could not create default admin: {e}")
    yield


app = FastAPI(
    title="ASANOV NEWS API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.BACKEND_CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.api.auth import router as auth_router
from app.api.news import router as news_router
from app.api.categories import router as categories_router
from app.api.comments import router as comments_router
from app.api.bookmarks import router as bookmarks_router
from app.api.upload import router as upload_router

app.include_router(auth_router)
app.include_router(news_router)
app.include_router(categories_router)
app.include_router(comments_router)
app.include_router(bookmarks_router)
app.include_router(upload_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
