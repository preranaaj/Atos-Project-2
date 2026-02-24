import asyncio
import motor.motor_asyncio

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

async def inspect():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    print("--- User Hashes ---")
    async for u in db.users.find():
        pwd = u.get("password", "")
        print(f"Name: {u.get('name')}, Email: {u.get('email')}, Hash Prefix: {pwd[:10]}...")
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect())
