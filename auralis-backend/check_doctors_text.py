from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

async def check_doctors():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    doctors = await db.users.find({}, {"password": 0}).to_list(length=10)
    for doc in doctors:
        print(f"Name: {doc['name']}")
        print(f"Role: {doc.get('role')}")
        print(f"Specialty: {doc.get('specialty')}")
        print(f"Experience: {doc.get('experience')}")
        print(f"Achievements: {doc.get('achievements')}")
        print("-" * 20)

if __name__ == "__main__":
    asyncio.run(check_doctors())
