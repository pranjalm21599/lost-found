from pydantic import BaseModel, EmailStr, Field

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    student_id: str = Field(..., min_length=2, max_length=50)
    phone: str = Field(..., min_length=7, max_length=20)
    password: str = Field(..., min_length=6)
    confirm_password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

from .user import UserResponse
TokenResponse.model_rebuild()
