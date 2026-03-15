import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.crud.bookmark import get_user_bookmarks, is_bookmarked, remove_bookmark, toggle_bookmark
from app.models.user import User
from app.schemas.bookmark import BookmarkResponse

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("/", response_model=list[BookmarkResponse])
async def list_bookmarks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_user_bookmarks(db, current_user.id)


@router.post("/{news_id}")
async def toggle(
    news_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    added = await toggle_bookmark(db, current_user.id, news_id)
    return {"bookmarked": added}


@router.get("/{news_id}/status")
async def bookmark_status(
    news_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    status = await is_bookmarked(db, current_user.id, news_id)
    return {"bookmarked": status}


@router.delete("/{news_id}", status_code=204)
async def delete(
    news_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await remove_bookmark(db, current_user.id, news_id)
