import asyncio
import time
from collections import defaultdict, deque
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.schemas.booking import BookingAvailabilityResponse, BookingCreate, BookingResponse
from app.services.bookings import create_booking, get_available_slots

router = APIRouter()
SessionDependency = Annotated[AsyncSession, Depends(get_db_session)]
_attempts: dict[str, deque[float]] = defaultdict(deque)
_lock = asyncio.Lock()


@router.get("/availability", response_model=BookingAvailabilityResponse)
async def read_availability(
    service_id: str,
    date: date,
    session: SessionDependency,
) -> BookingAvailabilityResponse:
    slots = await get_available_slots(session, service_id=service_id, booking_date=date)
    return BookingAvailabilityResponse(slots=slots)


async def _check_rate_limit(client_ip: str) -> None:
    now = time.monotonic()
    async with _lock:
        attempts = _attempts[client_ip]
        while attempts and now - attempts[0] > 300:
            attempts.popleft()
        if len(attempts) >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many booking attempts. Try again later.",
            )
        attempts.append(now)


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_public_booking(
    payload: BookingCreate,
    request: Request,
    session: SessionDependency,
) -> BookingResponse:
    client_ip = request.headers.get("x-real-ip") or (
        request.client.host if request.client else "unknown"
    )
    await _check_rate_limit(client_ip)
    booking = await create_booking(session, payload)
    return BookingResponse.model_validate(booking)
