import uuid

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.bookmark import Bookmark
from app.models.news import News


async def get_user_bookmarks(db: AsyncSession, user_id: uuid.UUID) -> list[Bookmark]:
    result = await db.execute(
        select(Bookmark)
        .where(Bookmark.user_id == user_id)
        .options(
            selectinload(Bookmark.news).selectinload(News.author),
            selectinload(Bookmark.news).selectinload(News.categories),
            selectinload(Bookmark.news).selectinload(News.comments),
        )
        .order_by(Bookmark.created_at.desc())
    )
    return list(result.scalars().all())


async def toggle_bookmark(
    db: AsyncSession, user_id: uuid.UUID, news_id: uuid.UUID
) -> bool:
    """Toggle bookmark. Returns True if added, False if removed."""
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == user_id, Bookmark.news_id == news_id
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        await db.execute(delete(Bookmark).where(Bookmark.id == existing.id))
        return False
    else:
        bookmark = Bookmark(user_id=user_id, news_id=news_id)
        db.add(bookmark)
        await db.flush()
        return True


async def is_bookmarked(
    db: AsyncSession, user_id: uuid.UUID, news_id: uuid.UUID
) -> bool:
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == user_id, Bookmark.news_id == news_id
        )
    )
    return result.scalar_one_or_none() is not None


async def remove_bookmark(
    db: AsyncSession, user_id: uuid.UUID, news_id: uuid.UUID
) -> bool:
    result = await db.execute(
        delete(Bookmark).where(
            Bookmark.user_id == user_id, Bookmark.news_id == news_id
        )
    )
    return result.rowcount > 0
