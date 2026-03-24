"""add order public_id

Revision ID: a1b2c3d4e5f6
Revises: 8c8e0101d4b6
Create Date: 2026-03-23 12:00:00.000000
"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '8c8e0101d4b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add public_id column as nullable first
    op.add_column('orders', sa.Column('public_id', sa.String(length=36), nullable=True))

    # Backfill existing rows with UUIDs
    conn = op.get_bind()
    orders = conn.execute(sa.text("SELECT id FROM orders WHERE public_id IS NULL"))
    for row in orders:
        conn.execute(
            sa.text("UPDATE orders SET public_id = :pid WHERE id = :oid"),
            {"pid": str(uuid.uuid4()), "oid": row[0]},
        )

    # Now make it non-nullable and add unique index
    with op.batch_alter_table('orders') as batch_op:
        batch_op.alter_column('public_id', nullable=False)
        batch_op.create_index('ix_orders_public_id', ['public_id'], unique=True)


def downgrade() -> None:
    with op.batch_alter_table('orders') as batch_op:
        batch_op.drop_index('ix_orders_public_id')
        batch_op.drop_column('public_id')
