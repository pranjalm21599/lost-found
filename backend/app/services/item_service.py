from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from ..models.item import Item
from ..schemas.item import ItemCreate, ItemUpdate
from ..models.user import User

def create_item(db: Session, item_data: ItemCreate, user: User, item_type: str) -> Item:
    item = Item(
        user_id=user.id,
        item_type=item_type.upper(),
        item_name=item_data.item_name,
        category=item_data.category,
        description=item_data.description,
        event_date=item_data.event_date,
        event_time=item_data.event_time,
        location=item_data.location,
        current_location=item_data.current_location,
        additional_details=item_data.additional_details,
        contact_phone=item_data.contact_phone,
        contact_email=item_data.contact_email,
        status="ACTIVE"
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def get_items_filtered(
    db: Session,
    q: Optional[str] = None,
    item_type: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    page: int = 1,
    limit: int = 12
) -> Tuple[List[Item], int]:
    query = db.query(Item)

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Item.item_name.ilike(search_term),
                Item.description.ilike(search_term),
                Item.location.ilike(search_term),
                Item.category.ilike(search_term)
            )
        )

    if item_type and item_type.upper() in ["LOST", "FOUND"]:
        query = query.filter(Item.item_type == item_type.upper())

    if category and category != "All":
        query = query.filter(Item.category == category)

    if location and location != "All":
        query = query.filter(Item.location == location)

    if status and status != "All":
        query = query.filter(Item.status == status.upper())

    if date_from:
        query = query.filter(Item.event_date >= date_from)

    if date_to:
        query = query.filter(Item.event_date <= date_to)

    total = query.count()
    items = query.order_by(desc(Item.created_at)).offset((page - 1) * limit).limit(limit).all()
    return items, total
