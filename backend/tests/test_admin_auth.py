from httpx import ASGITransport, AsyncClient

from app.core.config import settings
from app.core.security import SESSION_COOKIE_NAME, hash_password
from app.main import app


async def test_admin_content_requires_authentication() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/admin/content")
    assert response.status_code == 401


async def test_login_sets_protected_cookie(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.setattr(settings, "admin_username", "admin")
    monkeypatch.setattr(settings, "admin_password", "")
    monkeypatch.setattr(settings, "admin_password_hash", hash_password("a-secure-test-password"))
    monkeypatch.setattr(settings, "jwt_secret", "test-secret-that-is-long-enough-for-signing")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/admin/login",
            headers={"Origin": "http://localhost:3000"},
            json={"username": "admin", "password": "a-secure-test-password"},
        )
        session = await client.get("/api/admin/session")
    assert response.status_code == 200
    assert session.status_code == 200
    cookie = response.headers["set-cookie"]
    assert SESSION_COOKIE_NAME in cookie
    assert "HttpOnly" in cookie
    assert "SameSite=strict" in cookie


async def test_login_rejects_untrusted_origin() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/admin/login",
            headers={"Origin": "https://attacker.example"},
            json={"username": "admin", "password": "irrelevant"},
        )
    assert response.status_code == 403
