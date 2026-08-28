import asyncio
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.site_content import SiteContent
from app.schemas.content import SiteContentBundle
from app.services.default_content import DEFAULT_SITE_CONTENT
from app.services.media import collect_media_urls, remove_media_urls

CONTENT_KEY = "main"


async def get_site_content(session: AsyncSession) -> SiteContentBundle:
    record = await session.get(SiteContent, CONTENT_KEY)
    if record is None:
        return DEFAULT_SITE_CONTENT.model_copy(deep=True)
    return SiteContentBundle.model_validate(record.payload)


async def save_site_content(session: AsyncSession, content: SiteContentBundle) -> SiteContentBundle:
    record = await session.get(SiteContent, CONTENT_KEY)
    payload = content.model_dump(mode="json")
    previous_urls = collect_media_urls(record.payload) if record is not None else set()
    if record is None:
        session.add(SiteContent(key=CONTENT_KEY, payload=payload))
    else:
        record.payload = payload
    await session.commit()
    obsolete_urls = previous_urls - collect_media_urls(payload)
    if obsolete_urls:
        await asyncio.to_thread(remove_media_urls, Path(settings.media_directory), obsolete_urls)
    return content
