import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user, get_db
from app.core.security import verify_password, create_access_token
from app.crud.user import get_user_by_email, get_user_by_id, create_user, update_user_profile
from app.models.bookmark import Bookmark
from app.models.comment import Comment
from app.models.comment_like import CommentLike
from app.models.news import News
from app.models.news_view import NewsView
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, ProfileUpdate, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = await create_user(db, user_in)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, user_in.email)
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await update_user_profile(db, current_user, profile_in)


@router.get("/me/stats")
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uid = current_user.id

    comments_res = await db.execute(select(func.count()).where(Comment.user_id == uid))
    comments_count = comments_res.scalar() or 0

    reactions_given_res = await db.execute(select(func.count()).where(CommentLike.user_id == uid))
    reactions_given = reactions_given_res.scalar() or 0

    reactions_received_res = await db.execute(
        select(func.count())
        .select_from(CommentLike)
        .join(Comment, CommentLike.comment_id == Comment.id)
        .where(Comment.user_id == uid)
    )
    reactions_received = reactions_received_res.scalar() or 0

    news_read_res = await db.execute(select(func.count()).where(NewsView.user_id == uid))
    news_read = news_read_res.scalar() or 0

    bookmarks_res = await db.execute(select(func.count()).where(Bookmark.user_id == uid))
    bookmarks_count = bookmarks_res.scalar() or 0

    return {
        "comments_count": comments_count,
        "reactions_given": reactions_given,
        "reactions_received": reactions_received,
        "news_read": news_read,
        "bookmarks_count": bookmarks_count,
    }


@router.get("/me/comments")
async def get_my_comments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Comment)
        .where(Comment.user_id == current_user.id)
        .options(selectinload(Comment.news))
        .order_by(Comment.created_at.desc())
        .limit(10)
    )
    comments = list(result.scalars().all())
    return [
        {
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at,
            "likes_count": c.likes_count,
            "news_id": c.news_id,
            "news_title": c.news.title if c.news else None,
        }
        for c in comments
    ]


@router.get("/me/recent-reads")
async def get_recent_reads(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    result = await db.execute(
        select(NewsView, News)
        .join(News, NewsView.news_id == News.id)
        .where(
            NewsView.user_id == current_user.id,
            NewsView.viewed_at >= week_ago,
            News.is_published == True,
        )
        .order_by(NewsView.viewed_at.desc())
        .limit(10)
    )
    rows = result.all()
    return [
        {
            "id": news.id,
            "title": news.title,
            "main_image": news.main_image,
            "published_at": news.published_at,
            "viewed_at": view.viewed_at,
        }
        for view, news in rows
    ]


@router.get("/users/{user_id}")
async def get_public_profile(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    count_result = await db.execute(
        select(func.count()).where(Comment.user_id == user_id)
    )
    comments_count = count_result.scalar() or 0

    stats = None
    if user.show_stats:
        reactions_given_res = await db.execute(select(func.count()).where(CommentLike.user_id == user_id))
        reactions_received_res = await db.execute(
            select(func.count())
            .select_from(CommentLike)
            .join(Comment, CommentLike.comment_id == Comment.id)
            .where(Comment.user_id == user_id)
        )
        news_read_res = await db.execute(select(func.count()).where(NewsView.user_id == user_id))

        stats = {
            "comments_count": comments_count,
            "reactions_given": reactions_given_res.scalar() or 0,
            "reactions_received": reactions_received_res.scalar() or 0,
            "news_read": news_read_res.scalar() or 0,
        }

    comments_result = await db.execute(
        select(Comment)
        .where(Comment.user_id == user_id)
        .options(selectinload(Comment.news))
        .order_by(Comment.created_at.desc())
        .limit(5)
    )
    comments = [
        {
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at,
            "likes_count": c.likes_count,
            "news_id": c.news_id,
            "news_title": c.news.title if c.news else None,
        }
        for c in comments_result.scalars().all()
    ]

    return {
        "id": user.id,
        "name": user.name,
        "avatar": user.avatar,
        "created_at": user.created_at,
        "comments_count": comments_count,
        "show_stats": user.show_stats,
        "stats": stats,
        "comments": comments,
    }
