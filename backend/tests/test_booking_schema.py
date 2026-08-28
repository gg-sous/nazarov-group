from datetime import date, timedelta

import pytest
from pydantic import ValidationError

from app.schemas.booking import BookingCreate


def test_booking_requires_personal_data_consent() -> None:
    with pytest.raises(ValidationError):
        BookingCreate(
            client_name="Иван",
            client_phone="+7 900 000-00-00",
            service_id="detail-wash",
            date=date.today() + timedelta(days=1),
            start_time="10:00",  # type: ignore[arg-type]
            personal_data_consent=False,
        )


def test_booking_accepts_service_slug() -> None:
    booking = BookingCreate(
        client_name="Иван",
        client_phone="+7 900 000-00-00",
        service_id="detail-wash",
        date=date.today() + timedelta(days=1),
        start_time="10:00",  # type: ignore[arg-type]
        personal_data_consent=True,
    )
    assert booking.service_id == "detail-wash"
