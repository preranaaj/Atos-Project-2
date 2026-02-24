import asyncio
import motor.motor_asyncio
from bson import ObjectId

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

async def check_structure():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    
    print("--- DOCTORS COLLECTION ---")
    async for doc in db.doctors.find():
        print(f"ID: {doc.get('_id')}, Name: {doc.get('name')}, Email: {doc.get('email')}")
        
    print("\n--- USERS COLLECTION ---")
    async for user in db.users.find():
        print(f"ID: {user.get('_id')}, Name: {user.get('name')}, Email: {user.get('email')}, Role: {user.get('role')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_structure())
