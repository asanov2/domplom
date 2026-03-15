import uuid

from sqlalchemy import select, delete, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.comment import Comment
from app.models.comment_like import CommentLike
from app.schemas.comment import CommentCreate


async def get_comments_by_news(
    db: AsyncSession,
    news_id: uuid.UUID,
    sort: str = "latest",
    current_user_id: uuid.UUID | None = None,
) -> list[dict]:
    query = (
        select(Comment)
        .where(Comment.news_id == news_id)
        .options(selectinload(Comment.user))
    )

    if sort == "popular":
        query = query.order_by(Comment.likes_count.desc(), Comment.created_at.desc())
    else:
        query = query.order_by(Comment.created_at.desc())

    result = await db.execute(query)
    comments = list(result.scalars().all())

    # Check if current user liked each comment
    items = []
    for comment in comments:
        is_liked = False
        if current_user_id:
            like_result = await db.execute(
                select(CommentLike).where(
                    CommentLike.comment_id == comment.id,
                    CommentLike.user_id == current_user_id,
                )
            )
            is_liked = like_result.scalar_one_or_none() is not None

        items.append({
            "id": comment.id,
            "content": comment.content,
            "likes_count": comment.likes_count,
            "created_at": comment.created_at,
            "user": comment.user,
            "is_liked_by_me": is_liked,
        })

    return items


async def create_comment(
    db: AsyncSession, comment_in: CommentCreate, user_id: uuid.UUID
) -> Comment:
    comment = Comment(
        news_id=comment_in.news_id,
        user_id=user_id,
        content=comment_in.content,
    )
    db.add(comment)
    await db.flush()
    await db.refresh(comment)

    # Load user relationship
    result = await db.execute(
        select(Comment)
        .where(Comment.id == comment.id)
        .options(selectinload(Comment.user))
    )
    return result.scalar_one()


async def toggle_like(
    db: AsyncSession, comment_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    """Toggle like. Returns True if liked, False if unliked."""
    # Check if like exists
    result = await db.execute(
        select(CommentLike).where(
            CommentLike.comment_id == comment_id,
            CommentLike.user_id == user_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        # Remove like
        await db.execute(
            delete(CommentLike).where(CommentLike.id == existing.id)
        )
        await db.execute(
            update(Comment)
            .where(Comment.id == comment_id)
            .values(likes_count=Comment.likes_count - 1)
        )
        return False
    else:
        # Add like
        like = CommentLike(comment_id=comment_id, user_id=user_id)
        db.add(like)
        await db.execute(
            update(Comment)
            .where(Comment.id == comment_id)
            .values(likes_count=Comment.likes_count + 1)
        )
        return True
