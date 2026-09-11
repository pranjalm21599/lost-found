import os
import uuid
import aiofiles
from fastapi import HTTPException, UploadFile
from ..config import settings

ALLOWED_MIME_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "application/pdf": ".pdf",
}

def validate_file(file: UploadFile, content_length: int = 0):
    # Check mime type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unable to upload this file. Please upload PNG, JPG, JPEG or PDF files under 10 MB."
        )

async def save_upload_file(file: UploadFile) -> dict:
    validate_file(file)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    extension = ALLOWED_MIME_TYPES.get(file.content_type, os.path.splitext(file.filename)[1].lower())
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    target_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    total_size = 0
    async with aiofiles.open(target_path, "wb") as out_file:
        while content := await file.read(1024 * 64): # 64KB chunks
            total_size += len(content)
            if total_size > settings.MAX_FILE_SIZE_BYTES:
                # remove file if oversized
                try:
                    os.remove(target_path)
                except OSError:
                    pass
                raise HTTPException(
                    status_code=400,
                    detail="File too large. Maximum size is 10 MB per file."
                )
            await out_file.write(content)

    return {
        "file_name": file.filename,
        "file_path": f"uploads/items/{unique_filename}",
        "file_type": file.content_type,
        "file_size": total_size
    }
