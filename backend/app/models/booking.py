from datetime import date, datetime, time
from enum import StrEnum
from uuid import UUID

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Index, String, Time, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class BookingStatus(StrEnum):
    WAITING_PAYMENT = "waiting_payment"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


class Booking(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bookings"
    __table_args__ = (Index("ix_bookings_date_status", "date", "status"),)

    client_name: Mapped[str] = mapped_column(String(120), nullable=False)
    client_phone: Mapped[str] = mapped_column(String(32), nullable=False)
    service_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("services.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    service_slug: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    service_name: Mapped[str] = mapped_column(String(160), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
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

    service: Mapped["Service | None"] = relationship(back_populates="bookings")


from app.models.service import Service  # noqa: E402
