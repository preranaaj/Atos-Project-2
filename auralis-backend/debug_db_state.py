import motor.motor_asyncio
import asyncio
from passlib.context import CryptContext

async def check():
    pwd_context = CryptContext(schemes=["sha256_crypt", "bcrypt"], deprecated="auto")
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.auralis_db
    admin = await db.admin.find_one({"email": "admin@auralis.com"})
    if admin:
        print(f"Admin found: {admin['email']}")
        is_valid = pwd_context.verify("admin123", admin["password"])
        print(f"Password 'admin123' valid: {is_valid}")
        print(f"Stored Hash: {admin['password'][:20]}...")
    else:
        print("Admin not found")

if __name__ == "__main__":
    asyncio.run(check())
