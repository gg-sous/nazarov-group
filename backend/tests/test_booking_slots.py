from datetime import UTC, datetime, time

from app.services.bookings import _build_hourly_slots


def test_hourly_slots_exclude_only_the_booked_hour() -> None:
    slots = _build_hourly_slots(
        opening=datetime(2026, 9, 1, 9, 0, tzinfo=UTC),
        closing=datetime(2026, 9, 1, 13, 0, tzinfo=UTC),
        now=datetime(2026, 9, 1, 8, 0, tzinfo=UTC),
        booked_times={time(10, 0)},
    )

    assert slots == ["09:00", "11:00", "12:00"]
