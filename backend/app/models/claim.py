from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True)
    claimant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False, index=True) # PENDING, ACCEPTED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    item = relationship("Item", back_populates="claims")
    claimant = relationship("User", back_populates="claims")

    __table_args__ = (
        Index("idx_claims_item_claimant", "item_id", "claimant_id"),
    )
