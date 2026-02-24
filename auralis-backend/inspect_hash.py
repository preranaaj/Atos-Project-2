import asyncio
import motor.motor_asyncio

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

async def inspect():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    user = await db.users.find_one({"email": "sarah.c@auralis.com"})
    if user:
        print(f"Hash in DB: {user['password']}")
    else:
        print("User not found.")
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect())
