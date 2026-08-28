import io
from pathlib import Path

from PIL import Image

from app.services.media import process_uploaded_image, remove_media_urls


def test_image_is_converted_to_responsive_webp_variants(tmp_path: Path) -> None:
    source = Image.new("RGB", (2000, 1200), "#7a1218")
    buffer = io.BytesIO()
    source.save(buffer, format="JPEG", quality=95)

    result = process_uploaded_image(buffer.getvalue(), tmp_path, "safe_asset_123456")

    assert result.url == "/media/safe_asset_123456/1920.webp"
    for width in (640, 1280, 1920):
        destination = tmp_path / "safe_asset_123456" / f"{width}.webp"
        assert destination.exists()
        with Image.open(destination) as variant:
            assert variant.format == "WEBP"
            assert variant.width <= width
            assert variant.height <= 1200
            assert variant.getexif() == {}

    remove_media_urls(tmp_path, {result.url})
    assert not (tmp_path / "safe_asset_123456").exists()
