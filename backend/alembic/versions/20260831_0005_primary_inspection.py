"""Support primary inspections with multiple selected services."""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260831_0005"
down_revision: str | None = "20260830_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("bookings", sa.Column("service_slugs", postgresql.JSONB(), nullable=True))
    op.add_column("bookings", sa.Column("service_names", postgresql.JSONB(), nullable=True))
    op.execute(
        "UPDATE bookings SET service_slugs = jsonb_build_array(service_slug), "
        "service_names = jsonb_build_array(service_name)"
    )
    op.alter_column("bookings", "service_slugs", existing_type=postgresql.JSONB(), nullable=False)
    op.alter_column("bookings", "service_names", existing_type=postgresql.JSONB(), nullable=False)
    op.create_index(
        "ix_bookings_service_slugs_gin",
        "bookings",
        ["service_slugs"],
        postgresql_using="gin",
    )
    op.create_index(
        "uq_bookings_active_time",
        "bookings",
        ["date", "start_time"],
        unique=True,
        postgresql_where=sa.text("status IN ('waiting_payment', 'confirmed')"),
    )
    op.drop_index("ix_bookings_service_slug", table_name="bookings")
    op.drop_index("ix_bookings_service_id", table_name="bookings")
    op.drop_constraint("bookings_service_id_fkey", "bookings", type_="foreignkey")
    op.drop_column("bookings", "end_time")
    op.drop_column("bookings", "service_id")
    op.drop_column("bookings", "service_name")
    op.drop_column("bookings", "service_slug")
    op.drop_column("services", "duration_minutes")
    op.execute(
        """
        UPDATE site_content
        SET payload = jsonb_set(
            payload,
            '{hero,primary_button}',
            to_jsonb('Записаться на осмотр'::text),
            true
        )
        WHERE key = 'main'
          AND payload #>> '{hero,primary_button}' IN ('Записаться', 'Оставить заявку')
        """
    )


def downgrade() -> None:
    op.add_column(
        "services",
        sa.Column("duration_minutes", sa.Integer(), server_default="120", nullable=False),
    )
    op.add_column("bookings", sa.Column("service_slug", sa.String(length=80), nullable=True))
    op.add_column("bookings", sa.Column("service_name", sa.String(length=160), nullable=True))
    op.add_column("bookings", sa.Column("service_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("bookings", sa.Column("end_time", sa.Time(), nullable=True))
    op.execute(
        "UPDATE bookings SET service_slug = COALESCE(service_slugs ->> 0, 'legacy'), "
        "service_name = COALESCE(service_names ->> 0, 'Услуга'), end_time = start_time"
    )
    op.alter_column("bookings", "service_slug", existing_type=sa.String(length=80), nullable=False)
    op.alter_column("bookings", "service_name", existing_type=sa.String(length=160), nullable=False)
    op.alter_column("bookings", "end_time", existing_type=sa.Time(), nullable=False)
    op.create_index("ix_bookings_service_slug", "bookings", ["service_slug"])
    op.create_foreign_key(
        "bookings_service_id_fkey",
        "bookings",
        "services",
        ["service_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_bookings_service_id", "bookings", ["service_id"])
    op.drop_index("uq_bookings_active_time", table_name="bookings")
    op.drop_index("ix_bookings_service_slugs_gin", table_name="bookings")
    op.drop_column("bookings", "service_names")
    op.drop_column("bookings", "service_slugs")
    op.execute(
        """
        UPDATE site_content
        SET payload = jsonb_set(
            payload,
            '{hero,primary_button}',
            to_jsonb('Записаться'::text),
            true
        )
        WHERE key = 'main'
          AND payload #>> '{hero,primary_button}' = 'Записаться на осмотр'
        """
    )
