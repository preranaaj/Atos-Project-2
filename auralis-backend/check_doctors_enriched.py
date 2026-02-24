from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import json

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

async def check_doctors():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    doctors = await db.users.find({}, {"password": 0}).to_list(length=10)
    for doc in doctors:
        doc["_id"] = str(doc["_id"])
    print(json.dumps(doctors, indent=2))

if __name__ == "__main__":
    asyncio.run(check_doctors())
