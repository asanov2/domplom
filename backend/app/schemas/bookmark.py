import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.news import NewsResponse


class BookmarkResponse(BaseModel):
    id: uuid.UUID
    news: NewsResponse
    created_at: datetime

    model_config = {"from_attributes": True}
