import asyncio
import logging
from datetime import UTC, datetime, timedelta

import httpx
from sqlalchemy import select

from app.core.config import settings
from app.db.session import async_session_factory
from app.models.notification_outbox import NotificationOutbox

LOGGER = logging.getLogger("nazarovgroup.notifications")


async def dispatch_pending_notifications() -> None:
    if not settings.bot_internal_secret:
        return
    async with async_session_factory() as session:
        items = list(
            (
                await session.scalars(
                    select(NotificationOutbox)
                    .where(
                        NotificationOutbox.status == "pending",
                        NotificationOutbox.next_attempt_at <= datetime.now(UTC),
                    )
                    .order_by(NotificationOutbox.created_at)
                    .limit(10)
                    .with_for_update(skip_locked=True)
                )
            ).all()
        )
        if not items:
            return
        async with httpx.AsyncClient(timeout=10) as client:
            for item in items:
                try:
                    response = await client.post(
                        f"{settings.bot_internal_url}/notifications/booking",
                        headers={"X-Internal-Secret": settings.bot_internal_secret},
                        json=item.payload,
                    )
                    response.raise_for_status()
                    item.status = "sent"
                    item.processed_at = datetime.now(UTC)
                    item.last_error = None
                except httpx.HTTPError as exc:
                    item.attempts += 1
                    item.last_error = str(exc)[:1_000]
                    item.next_attempt_at = datetime.now(UTC) + timedelta(
                        seconds=min(300, 2 ** min(item.attempts, 8))
                    )
                    LOGGER.warning("Notification delivery failed for outbox item %s", item.id)
        await session.commit()


async def notification_worker() -> None:
    while True:
        try:
            await dispatch_pending_notifications()
        except asyncio.CancelledError:
            raise
        except Exception:
            LOGGER.exception("Notification worker iteration failed")
        await asyncio.sleep(5)
