import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_optional_user, get_db
from app.crud.comment import create_comment, get_comments_by_news, toggle_like
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("/news/{news_id}", response_model=list[CommentResponse])
async def list_comments(
    news_id: uuid.UUID,
    sort: str = Query("latest", regex="^(latest|popular)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    user_id = current_user.id if current_user else None
    return await get_comments_by_news(db, news_id, sort, user_id)


@router.post("/", response_model=CommentResponse, status_code=201)
async def create(
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = await create_comment(db, comment_in, current_user.id)
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        likes_count=comment.likes_count,
        created_at=comment.created_at,
        user=comment.user,
        is_liked_by_me=False,
    )


@router.post("/{comment_id}/like")
async def like_comment(
    comment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    liked = await toggle_like(db, comment_id, current_user.id)
    return {"liked": liked}
