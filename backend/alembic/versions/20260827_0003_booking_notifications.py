"""Add public booking fields and notification outbox."""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260827_0003"
down_revision: str | None = "20260827_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("bookings", "service_id", existing_type=postgresql.UUID(), nullable=True)
    op.add_column("bookings", sa.Column("service_slug", sa.String(length=80), nullable=True))
    op.add_column("bookings", sa.Column("service_name", sa.String(length=160), nullable=True))
    op.add_column(
        "bookings",
        sa.Column("consent_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.execute(
        "UPDATE bookings SET service_slug = 'legacy', "
        "service_name = 'Услуга' WHERE service_slug IS NULL"
    )
    op.alter_column("bookings", "service_slug", nullable=False)
    op.alter_column("bookings", "service_name", nullable=False)
    op.create_index("ix_bookings_service_slug", "bookings", ["service_slug"])
    op.create_table(
        "notification_outbox",
        sa.Column("event_type", sa.String(length=80), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notification_outbox_delivery", "notification_outbox", ["status", "next_attempt_at"])


def downgrade() -> None:
    op.drop_table("notification_outbox")
    op.drop_index("ix_bookings_service_slug", table_name="bookings")
    op.drop_column("bookings", "consent_at")
    op.drop_column("bookings", "service_name")
    op.drop_column("bookings", "service_slug")
    op.alter_column("bookings", "service_id", existing_type=postgresql.UUID(), nullable=False)
