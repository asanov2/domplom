from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.services.minio_service import ensure_bucket


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure MinIO bucket exists
    try:
        ensure_bucket()
    except Exception as e:
        print(f"Warning: Could not connect to MinIO: {e}")
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
