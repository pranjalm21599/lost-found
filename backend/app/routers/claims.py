from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.item import Item
from ..models.claim import Claim
from ..models.user import User
from ..schemas.claim import ClaimCreate, ClaimStatusUpdate, ClaimResponse
from ..dependencies import get_current_user

router = APIRouter(tags=["Claims"])

@router.post("/api/items/{item_id}/claims", response_model=ClaimResponse)
def submit_claim(
    item_id: int,
    claim_data: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    if item.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot submit a claim on an item you reported.")

    # Check if user already submitted a pending claim for this item
    existing_claim = db.query(Claim).filter(
        Claim.item_id == item_id,
        Claim.claimant_id == current_user.id,
        Claim.status == "PENDING"
    ).first()
    if existing_claim:
        raise HTTPException(
            status_code=400,
            detail="You already have an active pending claim on this item."
        )

    claim = Claim(
        item_id=item.id,
        claimant_id=current_user.id,
        message=claim_data.message.strip(),
        status="PENDING"
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

@router.get("/api/items/{item_id}/claims", response_model=List[ClaimResponse])
def get_item_claims(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    # If owner: can view all claims on this item
    if item.user_id == current_user.id:
        return db.query(Claim).filter(Claim.item_id == item_id).all()

    # Otherwise: only claims submitted by current_user
    return db.query(Claim).filter(Claim.item_id == item_id, Claim.claimant_id == current_user.id).all()

@router.patch("/api/claims/{claim_id}", response_model=ClaimResponse)
def update_claim_status(
    claim_id: int,
    status_data: ClaimStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    item = db.query(Item).filter(Item.id == claim.item_id).first()
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Only the item reporter can accept or reject claims.")

    target_status = status_data.status.upper()
    if target_status not in ["ACCEPTED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status. Allowed: ACCEPTED, REJECTED.")

    claim.status = target_status
    if target_status == "ACCEPTED":
        item.status = "MATCHED"

    db.commit()
    db.refresh(claim)
    return claim
