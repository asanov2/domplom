import uuid

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.schemas.category import CategoryCreate


async def get_all_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.name))
    return list(result.scalars().all())


async def get_category_by_slug(db: AsyncSession, slug: str) -> Category | None:
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalar_one_or_none()


async def create_category(db: AsyncSession, category_in: CategoryCreate) -> Category:
    category = Category(name=category_in.name, slug=category_in.slug)
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category_id: uuid.UUID) -> bool:
    result = await db.execute(delete(Category).where(Category.id == category_id))
    return result.rowcount > 0
