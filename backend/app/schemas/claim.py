from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .user import UserResponse

class ClaimCreate(BaseModel):
    message: str = Field(..., min_length=10)

class ClaimStatusUpdate(BaseModel):
    status: str # ACCEPTED or REJECTED

class ClaimResponse(BaseModel):
    id: int
    item_id: int
    claimant_id: int
    message: str
    status: str
    created_at: datetime
    updated_at: datetime
    claimant: Optional[UserResponse] = None

    class Config:
        from_attributes = True
