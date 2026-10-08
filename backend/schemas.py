"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# --- Auth ---

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Notices ---

CATEGORIES = ("Exam", "Event", "Holiday", "General")
PRIORITIES = ("Normal", "Urgent")

class NoticeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1)
    category: str = Field("General", pattern="^(Exam|Event|Holiday|General)$")
    priority: str = Field("Normal", pattern="^(Normal|Urgent)$")
    is_pinned: bool = False
    expires_at: Optional[datetime] = None

class NoticeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    body: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, pattern="^(Exam|Event|Holiday|General)$")
    priority: Optional[str] = Field(None, pattern="^(Normal|Urgent)$")
    is_pinned: Optional[bool] = None
    expires_at: Optional[datetime] = None

class NoticeOut(BaseModel):
    id: int
    title: str
    body: str
    category: str
    priority: str
    is_pinned: bool
    created_at: datetime
    expires_at: Optional[datetime]

    model_config = {"from_attributes": True}
