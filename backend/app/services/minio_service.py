import uuid
from io import BytesIO

from minio import Minio
from fastapi import UploadFile

from app.core.config import settings

minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ROOT_USER,
    secret_key=settings.MINIO_ROOT_PASSWORD,
    secure=False,
)


def ensure_bucket():
    if not minio_client.bucket_exists(settings.MINIO_BUCKET):
        minio_client.make_bucket(settings.MINIO_BUCKET)
        # Set bucket policy to allow public read
        import json
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": "*"},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{settings.MINIO_BUCKET}/*"],
                }
            ],
        }
        minio_client.set_bucket_policy(settings.MINIO_BUCKET, json.dumps(policy))


async def upload_image(file: UploadFile) -> str:
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    content = await file.read()
    content_type = file.content_type or "image/jpeg"

    minio_client.put_object(
        settings.MINIO_BUCKET,
        filename,
        BytesIO(content),
        length=len(content),
        content_type=content_type,
    )

    return f"http://{settings.MINIO_EXTERNAL_ENDPOINT}/{settings.MINIO_BUCKET}/{filename}"
