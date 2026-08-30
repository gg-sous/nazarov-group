from datetime import date, timedelta

import pytest
from pydantic import ValidationError

from app.schemas.booking import BookingCreate


def test_booking_requires_personal_data_consent() -> None:
    with pytest.raises(ValidationError):
        BookingCreate(
            client_name="Иван",
            client_phone="+7 900 000-00-00",
            vehicle_model="BMW X5",
            vehicle_color="Черный",
            service_ids=["detail-wash"],
            date=date.today() + timedelta(days=1),
            start_time="10:00",  # type: ignore[arg-type]
            personal_data_consent=False,
        )


def test_booking_accepts_multiple_service_slugs() -> None:
    booking = BookingCreate(
        client_name="Иван",
        client_phone="+7 900 000-00-00",
        vehicle_model="BMW X5",
        vehicle_color="Черный",
        service_ids=["detail-wash", "ceramic-coating"],
        date=date.today() + timedelta(days=1),
        start_time="10:00",  # type: ignore[arg-type]
        personal_data_consent=True,
    )
    assert booking.service_ids == ["detail-wash", "ceramic-coating"]
    assert booking.vehicle_model == "BMW X5"


def test_booking_rejects_unknown_vehicle_color() -> None:
    with pytest.raises(ValidationError):
        BookingCreate(
            client_name="Иван",
            client_phone="+7 900 000-00-00",
            vehicle_model="BMW X5",
            vehicle_color="Ультрафиолетовый",  # type: ignore[arg-type]
            service_ids=["detail-wash"],
            date=date.today() + timedelta(days=1),
            start_time="10:00",  # type: ignore[arg-type]
            personal_data_consent=True,
        )


def test_booking_requires_at_least_one_unique_service() -> None:
    common = {
        "client_name": "Иван",
        "client_phone": "+7 900 000-00-00",
        "vehicle_model": "BMW X5",
        "vehicle_color": "Черный",
        "date": date.today() + timedelta(days=1),
        "start_time": "10:00",
        "personal_data_consent": True,
    }
    with pytest.raises(ValidationError):
        BookingCreate(service_ids=[], **common)  # type: ignore[arg-type]
    with pytest.raises(ValidationError):
        BookingCreate(
            service_ids=["detail-wash", "detail-wash"],
            **common,  # type: ignore[arg-type]
        )
