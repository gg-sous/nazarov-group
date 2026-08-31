"""Force the saved Ulyanovykh 59a map to the centered close view."""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260831_0007"
down_revision: str | None = "20260831_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

CENTERED_MAP_URL = (
    "https://makemap.2gis.ru/widget?data="
    "eJxFjktug0AQRO9S2Y4swDbgOYCjeOVFlK-8IEw7GXmgUdNOghF3jzwoSS-rSq_fCBZHQu6WuCEVTz3s6wgdOoLFlio"
    "9C8GgE-5INPYj1Gu49vfNNn9-2n26kxvelg9fMHDU1-I79dzCAgY1BxZY3CRZmR4zGFzuWkffsGnye5PB-ywwRPz8fc"
    "--1Uhgcb6tNMqt80VSLtOiMOvVosyKTVYcJgPvYPNVMh0Mmqrbc-9nhRGhUti_rUG4xv8UXJgb2HQzGfS1cAiPH0ThJ"
    "aYqZ5p-ACDqW6Q"
)


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE site_content
            SET payload = jsonb_set(
                payload,
                '{contacts,map_url}',
                to_jsonb(CAST(:map_url AS text)),
                true
            )
            WHERE key = 'main'
              AND lower(payload #>> '{contacts,address}') LIKE '%ульяновых%59а%'
            """
        ).bindparams(map_url=CENTERED_MAP_URL)
    )


def downgrade() -> None:
    pass
