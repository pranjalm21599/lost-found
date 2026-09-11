from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(20), nullable=False, index=True) # LOST, FOUND
    item_name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    event_date = Column(String(50), nullable=False, index=True) # YYYY-MM-DD
    event_time = Column(String(50), nullable=True)
    location = Column(String(100), nullable=False, index=True)
    current_location = Column(Text, nullable=True) # where found item is currently kept
    additional_details = Column(Text, nullable=True)
    contact_phone = Column(String(50), nullable=False)
    contact_email = Column(String(255), nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False, index=True) # ACTIVE, MATCHED, RETURNED, CLOSED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="items")
    files = relationship("ItemFile", back_populates="item", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="item", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_items_type_status", "item_type", "status"),
        Index("idx_items_category_location", "category", "location"),
    )
