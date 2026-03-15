import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class News(Base):
    __tablename__ = "news"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    preview_text: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=True, default="")
    main_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR, nullable=True)

    author: Mapped["User"] = relationship(back_populates="news")  # noqa: F821
    blocks: Mapped[list["NewsContentBlock"]] = relationship(  # noqa: F821
        back_populates="news", cascade="all, delete-orphan", order_by="NewsContentBlock.position"
    )
    categories: Mapped[list["Category"]] = relationship(  # noqa: F821
        secondary="news_category", back_populates="news"
    )
    comments: Mapped[list["Comment"]] = relationship(  # noqa: F821
        back_populates="news", cascade="all, delete-orphan"
    )

    @property
    def comments_count(self) -> int:
        return len(self.comments)

    __table_args__ = (
        Index("ix_news_search_vector", "search_vector", postgresql_using="gin"),
    )
