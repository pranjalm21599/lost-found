from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from ..schemas.user import UserResponse
from ..services.auth_service import get_password_hash, verify_password, create_access_token
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirm password do not match."
        )

    # Check email unique
    existing_email = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this university email already exists."
        )

    # Check student_id unique
    existing_sid = db.query(User).filter(User.student_id == req.student_id.strip()).first()
    if existing_sid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this Student ID already exists."
        )

    # Create user
    user = User(
        full_name=req.full_name.strip(),
        email=req.email.lower().strip(),
        student_id=req.student_id.strip(),
        phone=req.phone.strip(),
        password_hash=get_password_hash(req.password),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate JWT
    token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact campus admin."
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
