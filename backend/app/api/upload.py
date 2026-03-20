from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_admin, get_current_user
from app.db.session import get_db
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


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    url = await upload_image(file)
    current_user.avatar = url
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return {"url": url, "user": {"id": str(current_user.id), "avatar": current_user.avatar}}
