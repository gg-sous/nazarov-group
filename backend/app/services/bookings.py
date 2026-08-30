from datetime import UTC, date, datetime, time, timedelta
from uuid import UUID
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status
from sqlalchemy import Select, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.booking import Booking, BookingStatus
from app.models.notification_outbox import NotificationOutbox
from app.schemas.booking import BookingCreate, BookingStatusUpdate
from app.services.content import get_site_content

ACTIVE_BOOKING_STATUSES = (BookingStatus.WAITING_PAYMENT, BookingStatus.CONFIRMED)


def _normalize_phone(value: str) -> str:
    digits = "".join(character for character in value if character.isdigit())
    if len(digits) == 11 and digits.startswith("8"):
        digits = f"7{digits[1:]}"
    return f"+{digits}"


def _build_hourly_slots(
    opening: datetime,
    closing: datetime,
    now: datetime,
    booked_times: set[time],
) -> list[str]:
    slots: list[str] = []
    candidate = opening
    while candidate < closing:
        if candidate > now + timedelta(minutes=15) and candidate.time() not in booked_times:
            slots.append(candidate.strftime("%H:%M"))
        candidate += timedelta(hours=1)
    return slots


async def create_booking(session: AsyncSession, payload: BookingCreate) -> Booking:
    content = await get_site_content(session)
    active_services = {item.id: item for item in content.services if item.is_active}
    if any(service_id not in active_services for service_id in payload.service_ids):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service is unavailable")
    selected_services = [active_services[service_id] for service_id in payload.service_ids]

    timezone = ZoneInfo(settings.business_timezone)
    starts_at = datetime.combine(payload.date, payload.start_time, tzinfo=timezone)
    if starts_at <= datetime.now(timezone) + timedelta(minutes=15):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Choose a time at least 15 minutes from now",
        )
    if starts_at > datetime.now(timezone) + timedelta(days=180):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Bookings are available up to 180 days ahead",
        )
    open_time = datetime.strptime(settings.booking_open_time, "%H:%M").time()
    close_time = datetime.strptime(settings.booking_close_time, "%H:%M").time()
    if payload.start_time.minute != 0 or payload.start_time.second != 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Choose a whole-hour time",
        )
    if starts_at.time() < open_time or starts_at.time() >= close_time:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Selected time is outside booking hours",
        )

    await session.execute(
        text("SELECT pg_advisory_xact_lock(hashtext(:booking_date))"),
        {"booking_date": payload.date.isoformat()},
    )
    overlap = await session.scalar(
        select(Booking.id).where(
            Booking.date == payload.date,
            Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            Booking.start_time == starts_at.time(),
        )
    )
    if overlap is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This time is already booked")

    booking = Booking(
        client_name=payload.client_name,
        client_phone=_normalize_phone(payload.client_phone),
        vehicle_model=payload.vehicle_model,
        vehicle_color=payload.vehicle_color,
        service_slugs=[service.id for service in selected_services],
        service_names=[service.title for service in selected_services],
        date=payload.date,
        start_time=starts_at.time().replace(tzinfo=None),
        status=BookingStatus.CONFIRMED,
    )
    session.add(booking)
    await session.flush()
    session.add(
        NotificationOutbox(
            event_type="booking.created",
            payload={
                "booking_id": str(booking.id),
                "client_name": booking.client_name,
                "client_phone": booking.client_phone,
                "vehicle_model": booking.vehicle_model,
                "vehicle_color": booking.vehicle_color,
                "service_names": booking.service_names,
                "date": booking.date.isoformat(),
                "start_time": booking.start_time.strftime("%H:%M"),
            },
            status="pending",
            attempts=0,
            next_attempt_at=datetime.now(UTC),
        )
    )
    await session.commit()
    await session.refresh(booking)
    return booking


async def get_available_slots(
    session: AsyncSession,
    *,
    booking_date: date,
) -> list[str]:
    timezone = ZoneInfo(settings.business_timezone)
    now = datetime.now(timezone)
    if booking_date < now.date() or booking_date > now.date() + timedelta(days=180):
        return []
    opening = datetime.combine(
        booking_date,
        datetime.strptime(settings.booking_open_time, "%H:%M").time(),
        tzinfo=timezone,
    )
    closing = datetime.combine(
        booking_date,
        datetime.strptime(settings.booking_close_time, "%H:%M").time(),
        tzinfo=timezone,
    )
    existing = list(
        (
            await session.scalars(
                select(Booking).where(
                    Booking.date == booking_date,
                    Booking.status.in_(ACTIVE_BOOKING_STATUSES),
                )
            )
        ).all()
    )
    return _build_hourly_slots(
        opening,
        closing,
        now,
        {item.start_time for item in existing},
    )


def booking_list_query() -> Select[tuple[Booking]]:
    return select(Booking).order_by(Booking.date.desc(), Booking.start_time.desc())


async def list_bookings(session: AsyncSession, *, limit: int, offset: int) -> tuple[list[Booking], int]:
    items = list((await session.scalars(booking_list_query().limit(limit).offset(offset))).all())
    total = int((await session.scalar(select(func.count()).select_from(Booking))) or 0)
    return items, total


async def list_all_bookings(session: AsyncSession) -> list[Booking]:
    return list((await session.scalars(booking_list_query())).all())


async def update_booking_status(
    session: AsyncSession,
    booking_id: UUID,
    payload: BookingStatusUpdate,
) -> Booking:
    booking = await session.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if payload.status in ACTIVE_BOOKING_STATUSES and booking.status not in ACTIVE_BOOKING_STATUSES:
        await session.execute(
            text("SELECT pg_advisory_xact_lock(hashtext(:booking_date))"),
            {"booking_date": booking.date.isoformat()},
        )
        conflict = await session.scalar(
            select(Booking.id).where(
                Booking.id != booking.id,
                Booking.date == booking.date,
                Booking.start_time == booking.start_time,
                Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            )
        )
        if conflict is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This time is already booked",
            )
    booking.status = payload.status
    await session.commit()
    await session.refresh(booking)
    return booking
