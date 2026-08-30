from datetime import UTC, date, datetime, time
from io import BytesIO
from uuid import uuid4

from openpyxl import load_workbook

from app.models.booking import Booking, BookingStatus
from app.services.booking_export import build_booking_workbook


def test_booking_export_contains_details_and_statistics() -> None:
    booking = Booking(
        id=uuid4(),
        client_name="Иван Иванов",
        client_phone="+79000000000",
        vehicle_model="BMW X5",
        vehicle_color="Черный",
        service_slugs=["detail-wash", "ceramic-coating"],
        service_names=["Детейлинг-мойка", "Керамическое покрытие"],
        date=date(2026, 9, 3),
        start_time=time(10, 0),
        status=BookingStatus.CONFIRMED,
        created_at=datetime(2026, 8, 30, 8, 30, tzinfo=UTC),
        updated_at=datetime(2026, 8, 30, 8, 30, tzinfo=UTC),
    )

    payload = build_booking_workbook([booking])
    workbook = load_workbook(BytesIO(payload), data_only=False)

    details = workbook["Осмотры"]
    assert details["G2"].value == "BMW X5"
    assert details["H2"].value == "Черный"
    assert details["I2"].value == "Детейлинг-мойка, Керамическое покрытие"
    assert details["B2"].is_date
    assert details["C2"].is_date
    statistics = workbook["Статистика"]
    assert statistics["B3"].value == 1
    assert statistics["B7"].value == 1
    assert statistics["E6"].value == 1
    assert statistics["E7"].value == 1
