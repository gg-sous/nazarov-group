from typing import Annotated

from fastapi import Cookie, HTTPException, Request, status

from app.core.config import settings
from app.core.security import SESSION_COOKIE_NAME, AdminIdentity, InvalidSessionError, verify_session_token


async def require_admin(
    session_token: Annotated[str | None, Cookie(alias=SESSION_COOKIE_NAME)] = None,
) -> AdminIdentity:
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        return verify_session_token(session_token)
    except InvalidSessionError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session") from exc


async def require_trusted_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin and origin not in settings.cors_origins:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Untrusted origin")
