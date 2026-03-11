from fastapi import APIRouter, Depends, UploadFile, File

from app.core.deps import get_current_admin
from app.models.user import User
from app.services.minio_service import upload_image

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/image")
async def upload(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin),
):
    url = await upload_image(file)
    # Return in Editor.js format
    return {"success": 1, "file": {"url": url}}
