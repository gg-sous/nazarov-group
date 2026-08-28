from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    app_name: str = "NazarovGroup API"
    environment: str = "development"
    docs_enabled: bool = True
    database_url: str = "postgresql+asyncpg://nazarovgroup:change_me@localhost:5432/nazarovgroup"
    cors_origins_raw: str = Field(default="http://localhost:3000", validation_alias="CORS_ORIGINS")
    jwt_secret: str = "change_me_in_environment"
    admin_username: str = "admin"
    admin_password: str = ""
    admin_password_hash: str = ""
    admin_session_ttl_seconds: int = 28_800
    admin_cookie_secure: bool = False
    media_directory: str = "/app/media"
    business_timezone: str = "Asia/Yekaterinburg"
    booking_open_time: str = "09:00"
    booking_close_time: str = "20:00"
    bot_internal_url: str = "http://bot:8081"
    bot_internal_secret: str = ""
    yookassa_shop_id: str = ""
    yookassa_secret_key: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.environment.lower() == "production":
            if self.jwt_secret == "change_me_in_environment" or len(self.jwt_secret) < 32:
                raise ValueError("JWT_SECRET must be a strong secret in production")
            if not self.admin_password_hash:
                raise ValueError("ADMIN_PASSWORD_HASH is required in production")
            if not self.admin_cookie_secure:
                raise ValueError("ADMIN_COOKIE_SECURE must be true in production")
            if len(self.bot_internal_secret) < 32:
                raise ValueError("BOT_INTERNAL_SECRET must be set in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
