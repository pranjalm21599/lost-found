import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.item import Item
from ..models.item_file import ItemFile
from ..models.user import User
from ..schemas.item import ItemFileResponse
from ..services.file_service import save_upload_file
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/items", tags=["Files"])

@router.post("/{item_id}/files", response_model=ItemFileResponse)
async def upload_item_file(
    item_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only upload files to your own reports.")

    file_info = await save_upload_file(file)

    item_file = ItemFile(
        item_id=item.id,
        file_name=file_info["file_name"],
        file_path=file_info["file_path"],
        file_type=file_info["file_type"],
        file_size=file_info["file_size"]
    )
    db.add(item_file)
    db.commit()
    db.refresh(item_file)
    return item_file

@router.delete("/{item_id}/files/{file_id}")
def delete_item_file(
    item_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only delete files from your own reports.")

    item_file = db.query(ItemFile).filter(ItemFile.id == file_id, ItemFile.item_id == item_id).first()
    if not item_file:
        raise HTTPException(status_code=404, detail="File record not found.")

    # Remove file from disk
    try:
        full_path = os.path.join(os.getcwd(), item_file.file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
    except OSError:
        pass

    db.delete(item_file)
    db.commit()
    return {"message": "File deleted successfully."}
