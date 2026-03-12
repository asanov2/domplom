import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select, func, update as sa_update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_admin, get_db, get_optional_user
from app.models.news import News
from app.models.news_view import NewsView
from app.crud.news import (
    create_news,
    delete_news,
    get_news_by_id,
    get_news_list,
    get_popular_today,
    get_popular_week,
    get_similar_news,
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


@router.get("/popular-week", response_model=list[NewsResponse])
async def popular_week(db: AsyncSession = Depends(get_db)):
    return await get_popular_week(db)


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
async def get_news(
    news_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    news = await get_news_by_id(db, news_id)
    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")

    # Record unique view
    is_new_view = False
    client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or request.client.host if request.client else None

    if current_user:
        existing = await db.execute(
            select(NewsView).where(
                NewsView.user_id == current_user.id,
                NewsView.news_id == news_id,
            )
        )
        if not existing.scalar_one_or_none():
            db.add(NewsView(user_id=current_user.id, news_id=news_id, ip_address=client_ip))
            is_new_view = True
    elif client_ip:
        existing = await db.execute(
            select(NewsView).where(
                NewsView.ip_address == client_ip,
                NewsView.news_id == news_id,
            )
        )
        if not existing.scalar_one_or_none():
            db.add(NewsView(ip_address=client_ip, news_id=news_id))
            is_new_view = True

    if is_new_view:
        await db.execute(
            sa_update(News).where(News.id == news_id).values(views_count=News.views_count + 1)
        )
        await db.flush()
        # Refresh the count on the loaded object
        news.views_count += 1

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
