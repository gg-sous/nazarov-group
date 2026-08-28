import asyncio
import secrets
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Request, Response, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_admin, require_trusted_origin
from app.core.config import settings
from app.core.security import (
    SESSION_COOKIE_NAME,
    AdminIdentity,
    create_session_token,
    verify_admin_password,
)
from app.db.session import get_db_session
from app.schemas.booking import AdminBookingResponse, BookingListResponse, BookingStatusUpdate
from app.schemas.content import (
    AdminLoginRequest,
    AdminSessionResponse,
    MediaUploadResponse,
    SiteContentBundle,
)
from app.services.bookings import list_bookings, update_booking_status
from app.services.content import get_site_content, save_site_content
from app.services.media import (
    InvalidImageError,
    collect_media_urls,
    process_uploaded_image,
    remove_stale_unreferenced_media,
)

router = APIRouter()
_login_attempts: dict[str, deque[float]] = defaultdict(deque)
_login_lock = asyncio.Lock()
_MAX_ATTEMPTS = 5
_WINDOW_SECONDS = 300
_ALLOWED_MEDIA_TYPES = {"image/jpeg", "image/png", "image/webp"}
_MAX_MEDIA_BYTES = 8 * 1024 * 1024
AdminDependency = Annotated[AdminIdentity, Depends(require_admin)]
SessionDependency = Annotated[AsyncSession, Depends(get_db_session)]
ImageDependency = Annotated[UploadFile, File()]


async def _check_rate_limit(client_ip: str) -> None:
    now = time.monotonic()
    async with _login_lock:
        attempts = _login_attempts[client_ip]
        while attempts and now - attempts[0] > _WINDOW_SECONDS:
            attempts.popleft()
        if len(attempts) >= _MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts",
            )
        attempts.append(now)


@router.post("/login", response_model=AdminSessionResponse, dependencies=[Depends(require_trusted_origin)])
async def login(payload: AdminLoginRequest, request: Request, response: Response) -> AdminSessionResponse:
    client_ip = request.headers.get("x-real-ip") or (request.client.host if request.client else "unknown")
    await _check_rate_limit(client_ip)
    if not settings.admin_password and not settings.admin_password_hash:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin access is not configured",
        )
    valid_username = secrets.compare_digest(payload.username, settings.admin_username)
    if not valid_username or not verify_admin_password(payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    async with _login_lock:
        _login_attempts.pop(client_ip, None)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=create_session_token(payload.username),
        max_age=settings.admin_session_ttl_seconds,
        httponly=True,
        secure=settings.admin_cookie_secure,
        samesite="strict",
        path="/",
    )
    response.headers["Cache-Control"] = "no-store"
    return AdminSessionResponse(authenticated=True, username=payload.username)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_trusted_origin)],
)
async def logout(response: Response, _: AdminDependency) -> None:
    response.delete_cookie(SESSION_COOKIE_NAME, path="/", samesite="strict")
    response.headers["Cache-Control"] = "no-store"


@router.get("/session", response_model=AdminSessionResponse)
async def read_session(identity: AdminDependency) -> AdminSessionResponse:
    return AdminSessionResponse(authenticated=True, username=identity.username)


@router.get("/content", response_model=SiteContentBundle)
async def read_content(
    _: AdminDependency,
    session: SessionDependency,
) -> SiteContentBundle:
    return await get_site_content(session)


@router.put("/content", response_model=SiteContentBundle, dependencies=[Depends(require_trusted_origin)])
async def update_content(
    payload: SiteContentBundle,
    _: AdminDependency,
    session: SessionDependency,
) -> SiteContentBundle:
    return await save_site_content(session, payload)


@router.get("/bookings", response_model=BookingListResponse)
async def read_bookings(
    _: AdminDependency,
    session: SessionDependency,
    limit: int = 100,
    offset: int = 0,
) -> BookingListResponse:
    items, total = await list_bookings(
        session,
        limit=min(max(limit, 1), 200),
        offset=max(offset, 0),
    )
    return BookingListResponse(
        items=[AdminBookingResponse.model_validate(item) for item in items],
        total=total,
    )


@router.patch(
    "/bookings/{booking_id}/status",
    response_model=AdminBookingResponse,
    dependencies=[Depends(require_trusted_origin)],
)
async def change_booking_status(
    booking_id: UUID,
    payload: BookingStatusUpdate,
    _: AdminDependency,
    session: SessionDependency,
) -> AdminBookingResponse:
    booking = await update_booking_status(session, booking_id, payload)
    return AdminBookingResponse.model_validate(booking)


@router.post("/media", response_model=MediaUploadResponse, dependencies=[Depends(require_trusted_origin)])
async def upload_media(
    image: ImageDependency,
    _: AdminDependency,
    session: SessionDependency,
) -> MediaUploadResponse:
    if image.content_type not in _ALLOWED_MEDIA_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported image type",
        )
    content = await image.read(_MAX_MEDIA_BYTES + 1)
    await image.close()
    if len(content) > _MAX_MEDIA_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image is too large")
    media_directory = await asyncio.to_thread(Path(settings.media_directory).resolve)
    asset_id = secrets.token_urlsafe(18)
    try:
        processed = await asyncio.to_thread(process_uploaded_image, content, media_directory, asset_id)
    except InvalidImageError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error

    current_content = await get_site_content(session)
    referenced_urls = collect_media_urls(current_content.model_dump(mode="json"))
    await asyncio.to_thread(remove_stale_unreferenced_media, media_directory, referenced_urls)
    return MediaUploadResponse(
        url=processed.url,
        width=processed.width,
        height=processed.height,
        original_bytes=processed.original_bytes,
        optimized_bytes=processed.optimized_bytes,
    )
