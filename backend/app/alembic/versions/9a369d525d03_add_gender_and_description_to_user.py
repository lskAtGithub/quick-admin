"""add gender and description to user

Revision ID: 9a369d525d03
Revises: eff7c659c810
Create Date: 2026-10-13 15:17:11.035556

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a369d525d03'
down_revision: Union[str, Sequence[str], None] = 'eff7c659c810'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('sys_user', sa.Column('gender', sa.String(length=10), nullable=True, comment='性别(1:男 2:女 0:未知)'))
    op.add_column('sys_user', sa.Column('description', sa.Text(), nullable=True, comment='描述'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('sys_user', 'description')
    op.drop_column('sys_user', 'gender')
