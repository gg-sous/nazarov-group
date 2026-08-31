"""Place the map marker at Doctorcar and center the initial view."""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260831_0006"
down_revision: str | None = "20260831_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

OLD_MAP_URL = (
    "https://makemap.2gis.ru/widget?data="
    "eJw1j81ugzAQhN9le0WRMTZgHiBVesqh6q9yoPGmsWpYZJy2BPHu3Rh1T9bM7OznGShYDGjvkTqMwe"
    "EIzfsMcRoQGthiGy8BIYMh0IAhJp9tF_3Nf-y25evLw7f9stNH8fTDQYvjMbghOuo5wMKRPAV-3glZ5"
    "yfJynXXW_yFJhf_s2TwuQJMqX69vifXx9TAkK5vY4LT5UbUWhiTabWpZaVrdeB9Z6EplVgOGXTtsKf"
    "RrQgz-DZCk7JlrkWujDamrsoM_M1PdYUshKmkNEIoNq5EHeNVXMufIe-fz4j-LakxXHD5A1QQX1A"
)
OLDER_MAP_URL = (
    "https://makemap.2gis.ru/widget?data="
    "eJw1js1OxDAMhN_FXKuqaZs22wdYBKc9IH61h7IxEJHWUeoFStV3x5sKn6yZ8fhbgKLFiPYaaUCODifo"
    "XhbgOSB0sMeezxEhgxApYOTki-3YX_y7Yd88Pd5-2U87v1b33xK0OJ2iC-xolIAIJ_IUZb0qSqPeSlF"
    "-b0aLP9Cp4n_WDN43gDnVb98P5EZODQLpxp4TnG7ywujS1Jmuc1O2eneUc2eh041ZjxkMfTjQ5DaCB"
    "XzPYtV5W2lVtRn4i6x1vtOmbZTQEA3CoqREyMn7hw9E_5xUjmdc_wDRWVty"
)
NEW_MAP_URL = (
    "https://makemap.2gis.ru/widget?data="
    "eJxFjktug0AQRO9S2Y4swDbgOYCjeOVFlK-8IEw7GXmgUdNOghF3jzwoSS-rSq_fCBZHQu6WuCEVTz3s6wgdOoLFlio"
    "9C8GgE-5INPYj1Gu49vfNNn9-2n26kxvelg9fMHDU1-I79dzCAgY1BxZY3CRZmR4zGFzuWkffsGnye5PB-ywwRPz8fc"
    "--1Uhgcb6tNMqt80VSLtOiMOvVosyKTVYcJgPvYPNVMh0Mmqrbc-9nhRGhUti_rUG4xv8UXJgb2HQzGfS1cAiPH0ThJ"
    "aYqZ5p-ACDqW6Q"
)


def _replace_map_url(current_url: str, replacement_url: str) -> None:
    op.execute(
        sa.text(
            """
            UPDATE site_content
            SET payload = jsonb_set(
                payload,
                '{contacts,map_url}',
                to_jsonb(CAST(:replacement_url AS text)),
                true
            )
            WHERE key = 'main'
              AND payload #>> '{contacts,map_url}' = :current_url
            """
        ).bindparams(current_url=current_url, replacement_url=replacement_url)
    )


def upgrade() -> None:
    _replace_map_url(OLDER_MAP_URL, NEW_MAP_URL)
    _replace_map_url(OLD_MAP_URL, NEW_MAP_URL)


def downgrade() -> None:
    _replace_map_url(NEW_MAP_URL, OLD_MAP_URL)
