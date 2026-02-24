import asyncio
import motor.motor_asyncio
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["sha256_crypt", "bcrypt"], deprecated="auto")
MONGO_URI = "mongodb://localhost:27017/auralis_db"

async def reset_users():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    
    # Force reset admin
    admin_email = "admin@auralis.com"
    admin_pwd = pwd_context.hash("admin123")
    await db.admin.update_one(
        {"email": admin_email},
        {"$set": {
            "name": "System Administrator",
            "password": admin_pwd,
            "role": "Admin",
            "gender": "Other",
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    print(f"Force reset Admin: {admin_email} with password 'admin123'")

    # Force reset doctor
    doc_email = "sarah.c@auralis.com"
    doc_pwd = pwd_context.hash("password123")
    await db.doctors.update_one(
        {"email": doc_email},
        {"$set": {
            "name": "Dr. Sarah Connor",
            "password": doc_pwd,
            "role": "Doctor",
            "specialty": "Cardiology",
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    print(f"Force reset Doctor: {doc_email} with password 'password123'")

if __name__ == "__main__":
    asyncio.run(reset_users())
