import motor.motor_asyncio
import asyncio

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

async def verify_migration():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    
    print("Checking patients in MongoDB...")
    count = await db.patients.count_documents({})
    print(f"Total patients: {count}")
    
    legacy_patient = await db.patients.find_one({"id": "0"})
    if legacy_patient:
        print("Legacy Patient 0 found in MongoDB!")
        print(f"Details: {legacy_patient}")
    else:
        print("Legacy Patient 0 NOT found in MongoDB.")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(verify_migration())
