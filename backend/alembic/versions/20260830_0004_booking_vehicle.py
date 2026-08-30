"""Add vehicle details to bookings."""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260830_0004"
down_revision: str | None = "20260827_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("bookings", sa.Column("vehicle_model", sa.String(length=160), nullable=True))
    op.add_column("bookings", sa.Column("vehicle_color", sa.String(length=40), nullable=True))
    op.execute(
        "UPDATE bookings SET vehicle_model = 'Не указано', vehicle_color = 'Не указано' "
        "WHERE vehicle_model IS NULL OR vehicle_color IS NULL"
    )
    op.alter_column("bookings", "vehicle_model", existing_type=sa.String(length=160), nullable=False)
    op.alter_column("bookings", "vehicle_color", existing_type=sa.String(length=40), nullable=False)


def downgrade() -> None:
    op.drop_column("bookings", "vehicle_color")
    op.drop_column("bookings", "vehicle_model")
