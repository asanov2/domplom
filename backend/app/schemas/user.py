import uuid
from datetime import datetime, date

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    phone: str | None = None
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    phone: str | None
    name: str | None
    avatar: str | None
    birthday: date | None
    gender: str | None
    show_stats: bool
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    avatar: str | None = None
    birthday: date | None = None
    gender: str | None = None
    show_stats: bool | None = None


class UserPublicResponse(BaseModel):
    id: uuid.UUID
    name: str | None
    avatar: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
