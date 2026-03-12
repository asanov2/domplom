"""add ip_address to news_views, make user_id nullable

Revision ID: 004
Revises: 003
Create Date: 2026-03-12
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make user_id nullable (was NOT NULL before)
    op.alter_column('news_views', 'user_id', existing_type=sa.UUID(), nullable=True)

    # Add ip_address column
    op.add_column('news_views', sa.Column('ip_address', sa.String(45), nullable=True))

    # Add unique constraint for ip-based views
    op.create_unique_constraint('uq_ip_news_view', 'news_views', ['ip_address', 'news_id'])


def downgrade() -> None:
    op.drop_constraint('uq_ip_news_view', 'news_views', type_='unique')
    op.drop_column('news_views', 'ip_address')
    op.alter_column('news_views', 'user_id', existing_type=sa.UUID(), nullable=False)
