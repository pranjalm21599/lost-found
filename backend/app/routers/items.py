from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
import math
from ..database import get_db
from ..models.item import Item
from ..models.user import User
from ..schemas.item import (
    ItemCreate,
    ItemUpdate,
    ItemResponse,
    ItemListResponse,
    ItemMatchResponse
)
from ..services.item_service import create_item, get_items_filtered
from ..services.matching_service import find_matches_for_item
from ..dependencies import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/items", tags=["Items"])

@router.post("/lost", response_model=ItemResponse)
def report_lost_item(
    item_data: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = create_item(db=db, item_data=item_data, user=current_user, item_type="LOST")
    return item

@router.post("/found", response_model=ItemResponse)
def report_found_item(
    item_data: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = create_item(db=db, item_data=item_data, user=current_user, item_type="FOUND")
    return item

@router.get("/my-reports", response_model=List[ItemResponse])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(Item).filter(Item.user_id == current_user.id).order_by(desc(Item.created_at)).all()
    return items

@router.get("", response_model=ItemListResponse)
def list_items(
    q: Optional[str] = Query(None),
    item_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    items, total = get_items_filtered(
        db=db,
        q=q,
        item_type=item_type,
        category=category,
        location=location,
        status=status,
        date_from=date_from,
        date_to=date_to,
        page=page,
        limit=limit
    )

    # Privacy: Phone and direct contact hidden on list cards
    response_items = []
    for item in items:
        # Create shallow copy or model representation with masked contact if in search list
        item_dict = {
            "id": item.id,
            "user_id": item.user_id,
            "item_type": item.item_type,
            "item_name": item.item_name,
            "category": item.category,
            "description": item.description,
            "event_date": item.event_date,
            "event_time": item.event_time,
            "location": item.location,
            "current_location": item.current_location,
            "additional_details": item.additional_details,
            "contact_phone": None, # masked on list/search
            "contact_email": None,
            "status": item.status,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
            "files": item.files,
            "user": None
        }
        response_items.append(item_dict)

    total_pages = max(1, math.ceil(total / limit))
    return {
        "items": response_items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/{item_id}", response_model=ItemResponse)
def get_item_detail(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    # Only authenticated users can view contact information on item details
    contact_phone = item.contact_phone if current_user else None
    contact_email = item.contact_email if current_user else None

    return {
        "id": item.id,
        "user_id": item.user_id,
        "item_type": item.item_type,
        "item_name": item.item_name,
        "category": item.category,
        "description": item.description,
        "event_date": item.event_date,
        "event_time": item.event_time,
        "location": item.location,
        "current_location": item.current_location,
        "additional_details": item.additional_details,
        "contact_phone": contact_phone,
        "contact_email": contact_email,
        "status": item.status,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
        "files": item.files,
        "user": item.user
    }

@router.put("/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    update_data: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    # Backend verification of ownership!
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only edit your own reports.")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    # Backend verification of ownership!
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only delete your own reports.")

    db.delete(item)
    db.commit()
    return {"message": "Report deleted successfully."}

@router.patch("/{item_id}/returned", response_model=ItemResponse)
def mark_item_returned(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Only the report creator can mark this item returned.")

    item.status = "RETURNED"
    db.commit()
    db.refresh(item)
    return item

@router.get("/{item_id}/matches", response_model=List[ItemMatchResponse])
def get_item_matches(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    # Compare against opposite item_type candidates
    opposite_type = "FOUND" if item.item_type == "LOST" else "LOST"
    candidate_pool = db.query(Item).filter(Item.item_type == opposite_type).all()

    matches = find_matches_for_item(item, candidate_pool)
    return matches
