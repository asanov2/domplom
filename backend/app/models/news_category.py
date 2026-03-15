from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

news_category = Table(
    "news_category",
    Base.metadata,
    Column("news_id", UUID(as_uuid=True), ForeignKey("news.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)
