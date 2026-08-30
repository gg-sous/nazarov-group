import re
from datetime import date as Date
from datetime import datetime
from datetime import time as Time
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.booking import BookingStatus

VehicleColor = Literal[
    "Черный",
    "Белый",
    "Серый",
    "Серебристый",
    "Красный",
    "Синий",
    "Зеленый",
    "Коричневый",
    "Бежевый",
    "Желтый",
    "Оранжевый",
    "Фиолетовый",
    "Другой",
]


class BookingCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    client_name: str = Field(min_length=2, max_length=120)
    client_phone: str = Field(min_length=10, max_length=32, pattern=r"^[+\d\s()\-]+$")
    vehicle_model: str = Field(min_length=2, max_length=160)
    vehicle_color: VehicleColor
    service_ids: list[str] = Field(min_length=1, max_length=30)
    date: Date
    start_time: Time
    personal_data_consent: bool

    @field_validator("service_ids")
    @classmethod
    def validate_service_ids(cls, value: list[str]) -> list[str]:
        if any(not re.fullmatch(r"[a-z0-9-]{2,80}", item) for item in value):
            raise ValueError("Invalid service identifier")
        if len(value) != len(set(value)):
            raise ValueError("Services must be unique")
        return value

    @field_validator("date")
    @classmethod
    def validate_date_not_past(cls, value: Date) -> Date:
        if value < Date.today():
            raise ValueError("Booking date cannot be in the past")
        return value

    @field_validator("personal_data_consent")
    @classmethod
    def validate_consent(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Personal data consent is required")
        return value


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: BookingStatus
    service_names: list[str]
    vehicle_model: str
    vehicle_color: str
    date: Date
    start_time: Time


class AdminBookingResponse(BookingResponse):
    client_name: str
    client_phone: str
    service_slugs: list[str]
    created_at: datetime


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingListResponse(BaseModel):
    items: list[AdminBookingResponse]
    total: int


class BookingAvailabilityResponse(BaseModel):
    slots: list[str]
