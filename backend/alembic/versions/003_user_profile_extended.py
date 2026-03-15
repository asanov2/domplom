"""add birthday, gender, show_stats to users + news_views table

Revision ID: 003
Revises: 002
Create Date: 2026-03-12
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Extend users table
    op.add_column('users', sa.Column('birthday', sa.Date(), nullable=True))
    op.add_column('users', sa.Column('gender', sa.String(10), nullable=True))
    op.add_column('users', sa.Column('show_stats', sa.Boolean(), nullable=False, server_default='true'))

    # Create news_views table
    op.create_table(
        'news_views',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('news_id', UUID(as_uuid=True), sa.ForeignKey('news.id', ondelete='CASCADE'), nullable=False),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('viewed_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'news_id', name='uq_user_news_view'),
        sa.UniqueConstraint('ip_address', 'news_id', name='uq_ip_news_view'),
    )


def downgrade() -> None:
    op.drop_table('news_views')
    op.drop_column('users', 'show_stats')
    op.drop_column('users', 'gender')
    op.drop_column('users', 'birthday')
