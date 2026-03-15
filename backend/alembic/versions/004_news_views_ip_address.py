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
    # All changes already included in migration 003 (ip_address column,
    # uq_ip_news_view constraint, nullable user_id). Nothing to do here.
    pass


def downgrade() -> None:
    pass
