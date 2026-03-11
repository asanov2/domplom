import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_admin, get_db
from app.crud.news import (
    create_news,
    delete_news,
    get_news_by_id,
    get_news_list,
    get_popular_today,
    get_similar_news,
    increment_views,
    update_news,
)
from app.models.user import User
from app.schemas.news import (
    NewsCreate,
    NewsDetailResponse,
    NewsPaginatedResponse,
    NewsResponse,
    NewsUpdate,
)

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/popular-today", response_model=list[NewsResponse])
async def popular_today(db: AsyncSession = Depends(get_db)):
    return await get_popular_today(db)


@router.get("/search", response_model=NewsPaginatedResponse)
async def search_news(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_news_list(db, page, per_page, search_query=q)
    return NewsPaginatedResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/", response_model=NewsPaginatedResponse)
async def list_news(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_news_list(db, page, per_page, category_slug=category)
    return NewsPaginatedResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{news_id}", response_model=NewsDetailResponse)
async def get_news(news_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    news = await get_news_by_id(db, news_id)
    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")
    await increment_views(db, news_id)
    return news


@router.get("/{news_id}/similar", response_model=list[NewsResponse])
async def similar_news(news_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await get_similar_news(db, news_id)


@router.post("/", response_model=NewsDetailResponse, status_code=status.HTTP_201_CREATED)
async def create(
    news_in: NewsCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await create_news(db, news_in, admin.id)


@router.put("/{news_id}", response_model=NewsDetailResponse)
async def update(
    news_id: uuid.UUID,
    news_in: NewsUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    news = await update_news(db, news_id, news_in)
    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")
    return news


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove(
    news_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    deleted = await delete_news(db, news_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")
