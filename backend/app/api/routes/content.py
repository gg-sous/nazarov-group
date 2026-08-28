from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.schemas.content import SiteContentBundle
from app.services.content import get_site_content

router = APIRouter()


@router.get("", response_model=SiteContentBundle)
async def read_public_content(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> SiteContentBundle:
    content = await get_site_content(session)
    content.services = [service for service in content.services if service.is_active]
    return content
