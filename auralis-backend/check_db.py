import asyncio
import motor.motor_asyncio
from passlib.context import CryptContext

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def check_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    
    print("--- Database Users ---")
    async for user in db.users.find():
        print(f"Name: {user.get('name')}, Email: {user.get('email')}, Role: {user.get('role')}")
        
    sarah = await db.users.find_one({"email": "sarah.c@auralis.com"})
    if sarah:
        print("\nSarah Connor found.")
        # Verify password
        try:
            is_valid = pwd_context.verify("password123", sarah["password"])
            print(f"Password 'password123' verification: {is_valid}")
        except Exception as e:
            print(f"Error verifying password: {e}")
    else:
        print("\nSarah Connor NOT found in DB.")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_db())
