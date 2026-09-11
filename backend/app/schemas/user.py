from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    student_id: str
    phone: str
    profile_photo: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=7, max_length=20)
    profile_photo: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    student_id: str
    phone: str
    profile_photo: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True
