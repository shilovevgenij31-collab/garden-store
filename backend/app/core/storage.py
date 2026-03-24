import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException
from .config import settings


class LocalStorage:
    """Local file storage. Replace with S3Storage/SupabaseStorage via STORAGE_BACKEND."""

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save_file(self, file: UploadFile) -> str:
        content_type = file.content_type or ""
        if content_type not in settings.ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Недопустимый тип файла: {content_type}. "
                       f"Разрешены: {', '.join(settings.ALLOWED_MIME_TYPES)}"
            )

        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Файл слишком большой. Максимум: {settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB"
            )

        ext = (Path(file.filename or "image.jpg").suffix or ".jpg").lower()
        allowed_ext = {".jpg", ".jpeg", ".png", ".webp"}
        if ext not in allowed_ext:
            raise HTTPException(
                status_code=400,
                detail=f"Недопустимое расширение файла: {ext}. "
                       f"Разрешены: {', '.join(sorted(allowed_ext))}"
            )
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = self.upload_dir / filename

        with open(filepath, "wb") as f:
            f.write(content)

        return f"/uploads/{filename}"

    async def delete_file(self, url: str) -> None:
        if url.startswith("/uploads/"):
            filepath = self.upload_dir / url.split("/uploads/")[-1]
            if filepath.exists():
                filepath.unlink()


storage = LocalStorage()
