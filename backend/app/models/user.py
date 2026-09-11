from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    student_id = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=False)
    profile_photo = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="claimant", cascade="all, delete-orphan")
