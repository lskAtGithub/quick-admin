"""init tables

Revision ID: eff7c659c810
Revises: 
Create Date: 2026-10-12 10:58:58.555207

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eff7c659c810'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('sys_user', sa.Column('dept_id', sa.Integer(), nullable=True, comment='部门ID'))
    op.create_foreign_key('fk_user_dept', 'sys_user', 'sys_dept', ['dept_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_user_dept', 'sys_user', type_='foreignkey')
    op.drop_column('sys_user', 'dept_id')
