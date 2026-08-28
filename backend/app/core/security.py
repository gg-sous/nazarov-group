import base64
import hashlib
import hmac
import json
import secrets
import time
from dataclasses import dataclass

from app.core.config import settings

SESSION_COOKIE_NAME = "ng_admin_session"
PBKDF2_ITERATIONS = 600_000


class InvalidSessionError(ValueError):
    pass


@dataclass(frozen=True)
class AdminIdentity:
    username: str


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str, *, salt: bytes | None = None) -> str:
    actual_salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), actual_salt, PBKDF2_ITERATIONS
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${_encode(actual_salt)}${_encode(digest)}"


def verify_admin_password(password: str) -> bool:
    if settings.admin_password_hash:
        try:
            algorithm, iterations_raw, salt_raw, expected_raw = settings.admin_password_hash.split("$", 3)
            if algorithm != "pbkdf2_sha256":
                return False
            digest = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                _decode(salt_raw),
                int(iterations_raw),
            )
            return hmac.compare_digest(digest, _decode(expected_raw))
        except (ValueError, TypeError):
            return False

    if settings.environment.lower() != "production" and settings.admin_password:
        return hmac.compare_digest(password, settings.admin_password)
    return False


def create_session_token(username: str) -> str:
    now = int(time.time())
    payload = {
        "sub": username,
        "iat": now,
        "exp": now + settings.admin_session_ttl_seconds,
        "nonce": secrets.token_urlsafe(12),
    }
    encoded_payload = _encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(
        settings.jwt_secret.encode("utf-8"), encoded_payload.encode("ascii"), hashlib.sha256
    ).digest()
    return f"{encoded_payload}.{_encode(signature)}"


def verify_session_token(token: str) -> AdminIdentity:
    try:
        encoded_payload, encoded_signature = token.split(".", 1)
        expected_signature = hmac.new(
            settings.jwt_secret.encode("utf-8"), encoded_payload.encode("ascii"), hashlib.sha256
        ).digest()
        if not hmac.compare_digest(expected_signature, _decode(encoded_signature)):
            raise InvalidSessionError("Invalid signature")
        payload = json.loads(_decode(encoded_payload))
        username = payload.get("sub")
        expires_at = payload.get("exp")
        if username != settings.admin_username or not isinstance(expires_at, int):
            raise InvalidSessionError("Invalid payload")
        if expires_at <= int(time.time()):
            raise InvalidSessionError("Session expired")
        return AdminIdentity(username=username)
    except (ValueError, TypeError, json.JSONDecodeError) as exc:
        raise InvalidSessionError("Invalid session") from exc
