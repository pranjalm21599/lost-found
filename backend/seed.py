"""
Development seed data script for Campus Lost & Found.
Populates PostgreSQL with demo users and realistic campus items.
"""
from backend.app.database import SessionLocal, engine, Base
from backend.app.models.user import User
from backend.app.models.item import Item
from backend.app.models.claim import Claim
from backend.app.services.auth_service import get_password_hash
from datetime import datetime

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if users exist
        existing_user = db.query(User).filter(User.email == "alex.chen@university.edu").first()
        if not existing_user:
            print("Seeding demo users...")
            user1 = User(
                full_name="Alex Chen",
                email="alex.chen@university.edu",
                student_id="STU-2024-8891",
                phone="+1 (555) 234-5678",
                password_hash=get_password_hash("Password123!"),
                is_active=True
            )
            user2 = User(
                full_name="Sarah Jenkins",
                email="sarah.j@university.edu",
                student_id="STU-2023-4102",
                phone="+1 (555) 876-5432",
                password_hash=get_password_hash("Password123!"),
                is_active=True
            )
            db.add_all([user1, user2])
            db.commit()
            db.refresh(user1)
            db.refresh(user2)
        else:
            user1 = existing_user
            user2 = db.query(User).filter(User.email == "sarah.j@university.edu").first()

        # Seed items if table empty
        if db.query(Item).count() == 0:
            print("Seeding demo lost and found items...")
            demo_items = [
                # LOST ITEMS
                Item(
                    user_id=user1.id,
                    item_type="LOST",
                    item_name="Black Leather Wallet",
                    category="Wallet",
                    description="Black bifold leather wallet containing student card, transit pass, and loyalty cards. Lost near 2nd floor quiet study area.",
                    event_date="2026-09-10",
                    event_time="14:30",
                    location="Library",
                    current_location=None,
                    additional_details="Has a small scratch on the front right corner.",
                    contact_phone="+1 (555) 234-5678",
                    contact_email="alex.chen@university.edu",
                    status="ACTIVE"
                ),
                Item(
                    user_id=user1.id,
                    item_type="LOST",
                    item_name="University Student ID Card",
                    category="ID Card",
                    description="Cardholder with blue lanyard and student ID for Alex Chen. Needed for dorm access.",
                    event_date="2026-09-11",
                    event_time="10:15",
                    location="Food Court",
                    current_location=None,
                    additional_details="Blue lanyard with university crest.",
                    contact_phone="+1 (555) 234-5678",
                    contact_email="alex.chen@university.edu",
                    status="ACTIVE"
                ),
                Item(
                    user_id=user2.id,
                    item_type="LOST",
                    item_name="Sony Bluetooth Headphones",
                    category="Headphones",
                    description="Matte black Sony WH-1000XM4 noise cancelling over-ear headphones in grey zippered protective case.",
                    event_date="2026-09-09",
                    event_time="16:00",
                    location="Sports Complex",
                    current_location=None,
                    additional_details="Case has a small silver carabiner attached.",
                    contact_phone="+1 (555) 876-5432",
                    contact_email="sarah.j@university.edu",
                    status="ACTIVE"
                ),

                # FOUND ITEMS
                Item(
                    user_id=user2.id,
                    item_type="FOUND",
                    item_name="Dark Leather Bifold Wallet",
                    category="Wallet",
                    description="Found dark brown/black leather wallet left behind on study desk near science journals section.",
                    event_date="2026-09-10",
                    event_time="15:10",
                    location="Library",
                    current_location="Handed to Library Front Desk lost & found bin",
                    additional_details="Owner can identify cards inside to retrieve.",
                    contact_phone="+1 (555) 876-5432",
                    contact_email="sarah.j@university.edu",
                    status="ACTIVE"
                ),
                Item(
                    user_id=user1.id,
                    item_type="FOUND",
                    item_name="Hydro Flask Blue Water Bottle",
                    category="Other",
                    description="32oz Pacific Blue wide-mouth Hydro Flask with stickers (NASA, React logo, mountain silhouette).",
                    event_date="2026-09-11",
                    event_time="11:45",
                    location="Classroom",
                    current_location="Classroom Hall B, podium shelf",
                    additional_details="Slight dent on bottom rim.",
                    contact_phone="+1 (555) 234-5678",
                    contact_email="alex.chen@university.edu",
                    status="ACTIVE"
                ),
                Item(
                    user_id=user2.id,
                    item_type="FOUND",
                    item_name="Texas Instruments Scientific Calculator",
                    category="Electronics",
                    description="TI-84 Plus CE Graphing Calculator in black casing with slide cover.",
                    event_date="2026-09-08",
                    event_time="13:00",
                    location="Laboratory",
                    current_location="Engineering Lab 304, Instructor bench",
                    additional_details="Initials 'M.T.' faintly etched on the back cover.",
                    contact_phone="+1 (555) 876-5432",
                    contact_email="sarah.j@university.edu",
                    status="ACTIVE"
                ),
                Item(
                    user_id=user1.id,
                    item_type="FOUND",
                    item_name="Black North Face Backpack",
                    category="Bag",
                    description="Black North Face Borealis backpack containing notebook and USB-C charger found near outdoor benches.",
                    event_date="2026-09-07",
                    event_time="17:30",
                    location="Administrative Block",
                    current_location="Campus Security Office, Admin Ground Floor",
                    additional_details="Held securely at security office badge desk.",
                    contact_phone="+1 (555) 234-5678",
                    contact_email="alex.chen@university.edu",
                    status="ACTIVE"
                )
            ]
            db.add_all(demo_items)
            db.commit()
            print("Successfully seeded demo items!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
