import re
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl, field_validator

MEDIA_URL_PATTERN = r"^/media/[A-Za-z0-9_-]{12,100}(?:/(?:640|1280|1920)\.webp|\.(?:jpe?g|png|webp))$"
DEFAULT_2GIS_MAP_URL = (
    "https://makemap.2gis.ru/widget?data="
    "eJw1j81ugzAQhN9le0WRMTZgHiBVesqh6q9yoPGmsWpYZJy2BPHu3Rh1T9bM7OznGShYDGjvkTqMwe"
    "EIzfsMcRoQGthiGy8BIYMh0IAhJp9tF_3Nf-y25evLw7f9stNH8fTDQYvjMbghOuo5wMKRPAV-3glZ5"
    "yfJynXXW_yFJhf_s2TwuQJMqX69vifXx9TAkK5vY4LT5UbUWhiTabWpZaVrdeB9Z6EplVgOGXTtsKf"
    "RrQgz-DZCk7JlrkWujDamrsoM_M1PdYUshKmkNEIoNq5EHeNVXMufIe-fz4j-LakxXHD5A1QQX1A"
)


class HeroContent(BaseModel):
    eyebrow: str = Field(min_length=2, max_length=100)
    accent: str = Field(min_length=2, max_length=80)
    title: str = Field(min_length=5, max_length=180)
    description: str = Field(min_length=10, max_length=500)
    primary_button: str = Field(min_length=2, max_length=60)
    secondary_button: str = Field(min_length=2, max_length=60)
    image_url: str = Field(min_length=1, max_length=500)

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str) -> str:
        if re.fullmatch(MEDIA_URL_PATTERN, value) or value == "/og.png":
            return value
        raise ValueError("Only uploaded media or the default image can be used")


class ServiceContent(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9-]{2,80}$")
    marker: str = Field(min_length=1, max_length=8)
    title: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=5, max_length=600)
    price_from: str = Field(min_length=1, max_length=80)
    is_active: bool = True
    is_featured: bool = True
    sort_order: int = Field(default=0, ge=0, le=10_000)
    image_url: str | None = Field(default=None, max_length=500)

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str | None) -> str | None:
        if value is None or re.fullmatch(MEDIA_URL_PATTERN, value):
            return value
        raise ValueError("Only uploaded service media can be used")


class PortfolioContent(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9-]{2,80}$")
    title: str = Field(min_length=2, max_length=160)
    category: str = Field(min_length=2, max_length=100)
    treatment: str = Field(min_length=2, max_length=200)
    tone: Literal["graphite", "silver", "black"] = "graphite"
    image_url: str | None = Field(default=None, max_length=500)

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str | None) -> str | None:
        if value is None or re.fullmatch(MEDIA_URL_PATTERN, value):
            return value
        raise ValueError("Only uploaded portfolio media can be used")


class ContactsContent(BaseModel):
    phone: str = Field(min_length=5, max_length=40)
    phone_href: str = Field(pattern=r"^tel:\+?[0-9]+$")
    address: str = Field(min_length=3, max_length=300)
    map_url: HttpUrl = Field(
        default=DEFAULT_2GIS_MAP_URL,
        validate_default=True,
    )
    schedule: str = Field(min_length=3, max_length=200)
    telegram: HttpUrl
    vk: HttpUrl
    email: str = Field(min_length=5, max_length=200)

    @field_validator("map_url")
    @classmethod
    def validate_map_url(cls, value: HttpUrl) -> HttpUrl:
        if value.host != "makemap.2gis.ru" or value.path != "/widget" or "data=" not in str(value):
            raise ValueError("Only 2GIS map widget links can be used")
        return value


class LegalContent(BaseModel):
    slug: Literal["privacy", "personal-data-consent", "offer", "requisites"]
    title: str = Field(min_length=3, max_length=200)
    body: str = Field(min_length=10, max_length=50_000)


class SiteContentBundle(BaseModel):
    hero: HeroContent
    services: list[ServiceContent] = Field(min_length=1, max_length=30)
    portfolio: list[PortfolioContent] = Field(max_length=50)
    contacts: ContactsContent
    legal: list[LegalContent] = Field(min_length=4, max_length=4)

    @field_validator("services", "portfolio", "legal")
    @classmethod
    def validate_unique_ids(cls, value: list[object]) -> list[object]:
        identifiers = [getattr(item, "id", getattr(item, "slug", None)) for item in value]
        if len(identifiers) != len(set(identifiers)):
            raise ValueError("Identifiers must be unique")
        return value


class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=500)


class AdminSessionResponse(BaseModel):
    authenticated: bool
    username: str


class MediaUploadResponse(BaseModel):
    url: str
    width: int
    height: int
    original_bytes: int
    optimized_bytes: int
