import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserResponse


class ContentBlockCreate(BaseModel):
    type: str  # text, image, youtube
    content: str
    position: int


class ContentBlockResponse(BaseModel):
    id: uuid.UUID
    type: str
    content: str
    position: int

    model_config = {"from_attributes": True}


class CategoryBrief(BaseModel):
    id: uuid.UUID
    name: str
    slug: str

    model_config = {"from_attributes": True}


class NewsCreate(BaseModel):
    title: str
    preview_text: str
    content: str = ""
    main_image: str | None = None
    is_published: bool = False
    category_ids: list[uuid.UUID] = []
    blocks: list[ContentBlockCreate] = []


class NewsUpdate(BaseModel):
    title: str | None = None
    preview_text: str | None = None
    content: str | None = None
    main_image: str | None = None
    is_published: bool | None = None
    category_ids: list[uuid.UUID] | None = None
    blocks: list[ContentBlockCreate] | None = None


class NewsResponse(BaseModel):
    id: uuid.UUID
    title: str
    preview_text: str
    main_image: str | None
    views_count: int
    is_published: bool
    published_at: datetime | None
    created_at: datetime
    author: UserResponse
    categories: list[CategoryBrief]

    model_config = {"from_attributes": True}


class NewsDetailResponse(NewsResponse):
    content: str
    blocks: list[ContentBlockResponse]


class NewsPaginatedResponse(BaseModel):
    items: list[NewsResponse]
    total: int
    page: int
    per_page: int
