import pytest
from pydantic import ValidationError

from app.core.config import Settings


def production_settings(**overrides: object) -> Settings:
    values: dict[str, object] = {
        "ENVIRONMENT": "production",
        "DATABASE_URL": "postgresql+asyncpg://app:strong-password@postgres:5432/app",
        "CORS_ORIGINS": "https://nazarovgroup.example",
        "JWT_SECRET": "a-strong-production-signing-secret",
        "ADMIN_PASSWORD": "",
        "ADMIN_PASSWORD_HASH": "pbkdf2_sha256$600000$salt$digest",
        "ADMIN_COOKIE_SECURE": True,
        "BOT_INTERNAL_SECRET": "a-strong-internal-bot-secret-value",
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)  # type: ignore[arg-type]


@pytest.mark.parametrize(
    ("override", "message"),
    [
        ({"DATABASE_URL": "postgresql+asyncpg://app:change_me@postgres/app"}, "DATABASE_URL"),
        ({"CORS_ORIGINS": "http://localhost:3000"}, "CORS_ORIGINS"),
        ({"ADMIN_PASSWORD": "plaintext-password"}, "ADMIN_PASSWORD"),
    ],
)
def test_insecure_production_settings_are_rejected(
    override: dict[str, object],
    message: str,
) -> None:
    with pytest.raises(ValidationError, match=message):
        production_settings(**override)


def test_secure_production_settings_are_accepted() -> None:
    settings = production_settings()
    assert settings.environment == "production"
