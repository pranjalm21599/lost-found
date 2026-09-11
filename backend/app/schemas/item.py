from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .user import UserResponse

class ItemFileResponse(BaseModel):
    id: int
    item_id: int
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True

class ItemCreate(BaseModel):
    item_name: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=5)
    event_date: str # YYYY-MM-DD
    event_time: Optional[str] = None
    location: str
    current_location: Optional[str] = None
    additional_details: Optional[str] = None
    contact_phone: str
    contact_email: str

class ItemUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None
    current_location: Optional[str] = None
    additional_details: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    status: Optional[str] = None

class ItemResponse(BaseModel):
    id: int
    user_id: int
    item_type: str
    item_name: str
    category: str
    description: str
    event_date: str
    event_time: Optional[str] = None
    location: str
    current_location: Optional[str] = None
    additional_details: Optional[str] = None
    contact_phone: Optional[str] = None # conditionally returned or only to authenticated
    contact_email: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    files: List[ItemFileResponse] = []
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ItemListResponse(BaseModel):
    items: List[ItemResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class MatchReason(BaseModel):
    label: str
    matched: bool

class ItemMatchResponse(BaseModel):
    item: ItemResponse
    score: int
    reasons: List[str]
