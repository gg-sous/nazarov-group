from datetime import date, datetime, time
from enum import StrEnum

from sqlalchemy import Date, DateTime, Enum, Index, String, Time, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class BookingStatus(StrEnum):
    WAITING_PAYMENT = "waiting_payment"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


class Booking(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bookings"
    __table_args__ = (
        Index("ix_bookings_date_status", "date", "status"),
        Index("ix_bookings_service_slugs_gin", "service_slugs", postgresql_using="gin"),
        Index(
            "uq_bookings_active_time",
            "date",
            "start_time",
            unique=True,
            postgresql_where=text("status IN ('waiting_payment', 'confirmed')"),
        ),
    )

    client_name: Mapped[str] = mapped_column(String(120), nullable=False)
    client_phone: Mapped[str] = mapped_column(String(32), nullable=False)
    vehicle_model: Mapped[str] = mapped_column(String(160), nullable=False)
    vehicle_color: Mapped[str] = mapped_column(String(40), nullable=False)
    service_slugs: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    service_names: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    consent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    status: Mapped[BookingStatus] = mapped_column(
        Enum(
            BookingStatus, name="booking_status", values_callable=lambda enum: [item.value for item in enum]
        ),
        nullable=False,
        default=BookingStatus.CONFIRMED,
        index=True,
    )
