from __future__ import annotations

import io
import re
import shutil
import time
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

MEDIA_WIDTHS = (640, 1280, 1920)
MAX_IMAGE_PIXELS = 40_000_000
MIN_IMAGE_SIDE = 240
WEBP_QUALITY = 82
_MANAGED_MEDIA_RE = re.compile(r"^/media/(?P<asset>[A-Za-z0-9_-]{12,80})/(?:640|1280|1920)\.webp$")
_LEGACY_MEDIA_RE = re.compile(r"^/media/(?P<file>[A-Za-z0-9_-]{12,100}\.(?:jpe?g|png|webp))$")

Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS


class InvalidImageError(ValueError):
    pass


@dataclass(frozen=True)
class ProcessedMedia:
    url: str
    width: int
    height: int
    original_bytes: int
    optimized_bytes: int


def _prepare_rgb(image: Image.Image) -> Image.Image:
    oriented = ImageOps.exif_transpose(image)
    if oriented.mode in {"RGBA", "LA"} or "transparency" in oriented.info:
        rgba = oriented.convert("RGBA")
        background = Image.new("RGB", rgba.size, (9, 9, 9))
        background.paste(rgba, mask=rgba.getchannel("A"))
        return background
    return oriented.convert("RGB")


def process_uploaded_image(content: bytes, media_directory: Path, asset_id: str) -> ProcessedMedia:
    try:
        with Image.open(io.BytesIO(content)) as source:
            if source.width * source.height > MAX_IMAGE_PIXELS:
                raise InvalidImageError("Image resolution is too large")
            source.load()
            if getattr(source, "is_animated", False):
                raise InvalidImageError("Animated images are not supported")
            image = _prepare_rgb(source)
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as error:
        raise InvalidImageError("Invalid or unsafe image") from error

    width, height = image.size
    if min(width, height) < MIN_IMAGE_SIDE:
        raise InvalidImageError(f"Image sides must be at least {MIN_IMAGE_SIDE}px")
    media_directory.mkdir(parents=True, exist_ok=True)
    asset_directory = (media_directory / asset_id).resolve()
    if media_directory.resolve() not in asset_directory.parents:
        raise InvalidImageError("Invalid media path")
    asset_directory.mkdir(parents=False, exist_ok=False)

    optimized_bytes = 0
    try:
        for target_width in MEDIA_WIDTHS:
            output_width = min(target_width, width)
            output_height = max(1, round(height * output_width / width))
            variant = image.copy()
            if variant.size != (output_width, output_height):
                variant.thumbnail((output_width, output_height), Image.Resampling.LANCZOS, reducing_gap=3.0)
            destination = asset_directory / f"{target_width}.webp"
            variant.save(
                destination,
                format="WEBP",
                quality=WEBP_QUALITY,
                method=6,
                optimize=True,
                exif=b"",
            )
            optimized_bytes = max(optimized_bytes, destination.stat().st_size)
    except Exception:
        shutil.rmtree(asset_directory, ignore_errors=True)
        raise
    finally:
        image.close()

    return ProcessedMedia(
        url=f"/media/{asset_id}/1920.webp",
        width=width,
        height=height,
        original_bytes=len(content),
        optimized_bytes=optimized_bytes,
    )


def collect_media_urls(payload: dict[str, object]) -> set[str]:
    urls: set[str] = set()
    hero = payload.get("hero")
    if isinstance(hero, dict):
        image_url = hero.get("image_url")
        if isinstance(image_url, str) and image_url.startswith("/media/"):
            urls.add(image_url)
    portfolio = payload.get("portfolio")
    if isinstance(portfolio, list):
        for item in portfolio:
            if isinstance(item, dict):
                image_url = item.get("image_url")
                if isinstance(image_url, str) and image_url.startswith("/media/"):
                    urls.add(image_url)
    return urls


def remove_media_urls(media_directory: Path, urls: set[str]) -> None:
    root = media_directory.resolve()
    for url in urls:
        managed_match = _MANAGED_MEDIA_RE.fullmatch(url)
        if managed_match:
            asset_directory = (root / managed_match.group("asset")).resolve()
            if root in asset_directory.parents:
                shutil.rmtree(asset_directory, ignore_errors=True)
            continue
        legacy_match = _LEGACY_MEDIA_RE.fullmatch(url)
        if legacy_match:
            legacy_file = (root / legacy_match.group("file")).resolve()
            if legacy_file.parent == root:
                legacy_file.unlink(missing_ok=True)


def remove_stale_unreferenced_media(
    media_directory: Path,
    referenced_urls: set[str],
    *,
    grace_seconds: int = 86_400,
) -> None:
    root = media_directory.resolve()
    if not root.exists():
        return
    referenced_assets = {
        match.group("asset")
        for url in referenced_urls
        if (match := _MANAGED_MEDIA_RE.fullmatch(url)) is not None
    }
    cutoff = time.time() - grace_seconds
    for item in root.iterdir():
        if item.is_dir() and item.name not in referenced_assets and item.stat().st_mtime < cutoff:
            shutil.rmtree(item, ignore_errors=True)
