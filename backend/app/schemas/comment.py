import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserResponse


class CommentCreate(BaseModel):
    news_id: uuid.UUID
    content: str


class CommentResponse(BaseModel):
    id: uuid.UUID
    content: str
    likes_count: int
    created_at: datetime
    user: UserResponse
    is_liked_by_me: bool = False

    model_config = {"from_attributes": True}
