import asyncio
import motor.motor_asyncio

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

async def inspect_all():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    for col_name in ["users", "admin", "doctors", "patients"]:
        print(f"--- {col_name} ---")
        async for u in db[col_name].find():
            pwd = u.get("password")
            if pwd:
                print(f"Name: {u.get('name')}, Email: {u.get('email')}, Hash Prefix: {pwd[:10]}...")
            else:
                print(f"Name: {u.get('name')}, Email: {u.get('email')}, No Password")
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect_all())
