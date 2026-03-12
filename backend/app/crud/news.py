import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy import select, func, update, delete, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.news import News
from app.models.news_content_block import NewsContentBlock
from app.models.news_category import news_category
from app.models.category import Category
from app.schemas.news import NewsCreate, NewsUpdate


async def get_news_list(
    db: AsyncSession,
    page: int = 1,
    per_page: int = 10,
    category_slug: str | None = None,
    search_query: str | None = None,
    published_only: bool = True,
) -> tuple[list[News], int]:
    query = select(News).options(
        selectinload(News.author),
        selectinload(News.categories),
        selectinload(News.comments),
    )

    if published_only:
        query = query.where(News.is_published == True)

    if category_slug:
        query = query.join(News.categories).where(Category.slug == category_slug)

    if search_query:
        query = query.where(
            News.search_vector.op("@@")(func.plainto_tsquery("russian", search_query))
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination and ordering
    query = query.order_by(News.published_at.desc().nullslast(), News.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    items = list(result.scalars().unique())
    return items, total


async def get_news_by_id(db: AsyncSession, news_id: uuid.UUID) -> News | None:
    result = await db.execute(
        select(News)
        .where(News.id == news_id)
        .options(
            selectinload(News.author),
            selectinload(News.categories),
            selectinload(News.blocks),
            selectinload(News.comments),
        )
    )
    return result.scalar_one_or_none()


async def create_news(db: AsyncSession, news_in: NewsCreate, author_id: uuid.UUID) -> News:
    news = News(
        title=news_in.title,
        preview_text=news_in.preview_text,
        content=news_in.content,
        main_image=news_in.main_image,
        is_published=news_in.is_published,
        author_id=author_id,
        published_at=datetime.now(timezone.utc) if news_in.is_published else None,
    )
    db.add(news)
    await db.flush()

    # Add blocks
    for block_data in news_in.blocks:
        block = NewsContentBlock(
            news_id=news.id,
            type=block_data.type,
            content=block_data.content,
            position=block_data.position,
        )
        db.add(block)

    # Add categories
    if news_in.category_ids:
        for cat_id in news_in.category_ids:
            await db.execute(
                news_category.insert().values(news_id=news.id, category_id=cat_id)
            )

    await db.flush()

    # Update search vector
    await db.execute(
        update(News)
        .where(News.id == news.id)
        .values(
            search_vector=func.to_tsvector(
                "russian", func.coalesce(News.title, "") + " " + func.coalesce(News.preview_text, "")
            )
        )
    )

    await db.flush()
    return await get_news_by_id(db, news.id)  # type: ignore


async def update_news(db: AsyncSession, news_id: uuid.UUID, news_in: NewsUpdate) -> News | None:
    news = await get_news_by_id(db, news_id)
    if not news:
        return None

    update_data = news_in.model_dump(exclude_unset=True)

    # Handle blocks separately
    blocks_data = update_data.pop("blocks", None)
    category_ids = update_data.pop("category_ids", None)

    # Handle is_published -> published_at
    if "is_published" in update_data and update_data["is_published"] and not news.published_at:
        update_data["published_at"] = datetime.now(timezone.utc)

    for key, value in update_data.items():
        setattr(news, key, value)

    # Replace blocks if provided
    if blocks_data is not None:
        await db.execute(delete(NewsContentBlock).where(NewsContentBlock.news_id == news_id))
        for block_data in blocks_data:
            block = NewsContentBlock(
                news_id=news_id,
                type=block_data["type"],
                content=block_data["content"],
                position=block_data["position"],
            )
            db.add(block)

    # Replace categories if provided
    if category_ids is not None:
        await db.execute(news_category.delete().where(news_category.c.news_id == news_id))
        for cat_id in category_ids:
            await db.execute(
                news_category.insert().values(news_id=news_id, category_id=cat_id)
            )

    # Update search vector
    await db.execute(
        update(News)
        .where(News.id == news_id)
        .values(
            search_vector=func.to_tsvector(
                "russian",
                func.coalesce(news.title, "") + " " + func.coalesce(news.preview_text, ""),
            )
        )
    )

    await db.flush()
    return await get_news_by_id(db, news_id)


async def delete_news(db: AsyncSession, news_id: uuid.UUID) -> bool:
    result = await db.execute(delete(News).where(News.id == news_id))
    return result.rowcount > 0


async def increment_views(db: AsyncSession, news_id: uuid.UUID):
    await db.execute(
        update(News).where(News.id == news_id).values(views_count=News.views_count + 1)
    )


async def get_popular_today(db: AsyncSession, limit: int = 5) -> list[News]:
    two_days_ago = datetime.now(timezone.utc) - timedelta(days=2)

    result = await db.execute(
        select(News)
        .where(News.is_published == True, News.published_at >= two_days_ago)
        .options(selectinload(News.author), selectinload(News.categories), selectinload(News.comments))
        .order_by(News.views_count.desc(), News.published_at.desc())
        .limit(limit)
    )
    items = list(result.scalars().unique())

    # If no news in last 2 days, get latest published
    if not items:
        result = await db.execute(
            select(News)
            .where(News.is_published == True)
            .options(selectinload(News.author), selectinload(News.categories), selectinload(News.comments))
            .order_by(News.published_at.desc().nullslast())
            .limit(limit)
        )
        items = list(result.scalars().unique())

    return items


async def get_popular_week(db: AsyncSession, limit: int = 5) -> list[News]:
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    result = await db.execute(
        select(News)
        .where(News.is_published == True, News.published_at >= week_ago)
        .options(selectinload(News.author), selectinload(News.categories), selectinload(News.comments))
        .order_by(News.views_count.desc(), News.published_at.desc())
        .limit(limit)
    )
    items = list(result.scalars().unique())

    if not items:
        result = await db.execute(
            select(News)
            .where(News.is_published == True)
            .options(selectinload(News.author), selectinload(News.categories), selectinload(News.comments))
            .order_by(News.views_count.desc(), News.published_at.desc())
            .limit(limit)
        )
        items = list(result.scalars().unique())

    return items


async def get_similar_news(
    db: AsyncSession, news_id: uuid.UUID, limit: int = 4
) -> list[News]:
    # Get categories of current news
    cat_result = await db.execute(
        select(news_category.c.category_id).where(news_category.c.news_id == news_id)
    )
    cat_ids = [row[0] for row in cat_result.all()]

    if not cat_ids:
        # Fallback: just get latest news
        result = await db.execute(
            select(News)
            .where(News.is_published == True, News.id != news_id)
            .options(selectinload(News.author), selectinload(News.categories), selectinload(News.comments))
            .order_by(News.published_at.desc().nullslast())
            .limit(limit)
        )
        return list(result.scalars().unique())

    # Find news with overlapping categories
    result = await db.execute(
        select(News)
        .join(news_category, News.id == news_category.c.news_id)
        .where(
            News.is_published == True,
            News.id != news_id,
            news_category.c.category_id.in_(cat_ids),
        )
        .options(selectinload(News.author), selectinload(News.categories), selectinload(News.comments))
        .group_by(News.id)
        .order_by(func.count(news_category.c.category_id).desc(), News.published_at.desc())
        .limit(limit)
    )
    return list(result.scalars().unique())
