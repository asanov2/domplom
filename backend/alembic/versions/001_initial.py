"""initial migration

Revision ID: 001
Revises:
Create Date: 2026-03-11
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(10), nullable=False, server_default='user'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Categories
    op.create_table(
        'categories',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # News
    op.create_table(
        'news',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('preview_text', sa.Text, nullable=False),
        sa.Column('content', sa.Text, nullable=True, server_default=''),
        sa.Column('main_image', sa.String(500), nullable=True),
        sa.Column('views_count', sa.Integer, server_default='0'),
        sa.Column('is_published', sa.Boolean, server_default='false'),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('author_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('search_vector', TSVECTOR, nullable=True),
    )
    op.create_index('ix_news_search_vector', 'news', ['search_vector'], postgresql_using='gin')

    # News content blocks
    op.create_table(
        'news_content_blocks',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('news_id', UUID(as_uuid=True), sa.ForeignKey('news.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('position', sa.Integer, nullable=False, server_default='0'),
    )

    # News-Category many-to-many
    op.create_table(
        'news_category',
        sa.Column('news_id', UUID(as_uuid=True), sa.ForeignKey('news.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('category_id', UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='CASCADE'), primary_key=True),
    )

    # Comments
    op.create_table(
        'comments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('news_id', UUID(as_uuid=True), sa.ForeignKey('news.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('likes_count', sa.Integer, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Comment likes
    op.create_table(
        'comment_likes',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('comment_id', UUID(as_uuid=True), sa.ForeignKey('comments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.UniqueConstraint('comment_id', 'user_id', name='uq_comment_user_like'),
    )

    # Bookmarks
    op.create_table(
        'bookmarks',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('news_id', UUID(as_uuid=True), sa.ForeignKey('news.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'news_id', name='uq_user_news_bookmark'),
    )

    # Create trigger for search_vector auto-update
    op.execute("""
        CREATE OR REPLACE FUNCTION news_search_vector_update() RETURNS trigger AS $$
        BEGIN
            NEW.search_vector := to_tsvector('russian', coalesce(NEW.title, '') || ' ' || coalesce(NEW.preview_text, ''));
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    op.execute("""
        CREATE TRIGGER news_search_vector_trigger
        BEFORE INSERT OR UPDATE ON news
        FOR EACH ROW EXECUTE FUNCTION news_search_vector_update();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS news_search_vector_trigger ON news")
    op.execute("DROP FUNCTION IF EXISTS news_search_vector_update()")
    op.drop_table('bookmarks')
    op.drop_table('comment_likes')
    op.drop_table('comments')
    op.drop_table('news_category')
    op.drop_table('news_content_blocks')
    op.drop_index('ix_news_search_vector', 'news')
    op.drop_table('news')
    op.drop_table('categories')
    op.drop_table('users')
