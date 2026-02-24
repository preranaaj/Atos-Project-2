import asyncio
import motor.motor_asyncio
from bson import ObjectId

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

async def cleanup_doctors():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    
    # 1. Clean up doctors collection
    # We want to keep one document per email
    print("--- Cleaning Doctors Collection ---")
    emails = await db.doctors.distinct("email")
    for email in emails:
        docs = await db.doctors.find({"email": email}).to_list(length=100)
        if len(docs) > 1:
            print(f"Found {len(docs)} duplicates for {email}. Keeping the first one: {docs[0]['_id']}")
            ids_to_delete = [d["_id"] for d in docs[1:]]
            res = await db.doctors.delete_many({"_id": {"$in": ids_to_delete}})
            print(f"Deleted {res.deleted_count} duplicates.")

    # 2. Synchronize doctors with users
    print("\n--- Synchronizing Users with Doctors ---")
    async for user in db.users.find({"role": "Doctor"}):
        email = user["email"]
        doc = await db.doctors.find_one({"email": email})
        if doc:
            print(f"Syncing user {email} -> doctor {doc['_id']}")
            # Update user with the doctor's ObjectId string if needed, 
            # but mainly we need to ensure they match.
            # Usually we want the frontend to use the same ID.
            # Let's update the user's name if they differ? 
            pass
        else:
            print(f"Doctor profile missing for user {email}. Creating one...")
            new_doc = {
                "name": user["name"],
                "email": user["email"],
                "role": "Doctor",
                "specialty": "General Practitioner",
                "gender": user.get("gender", "Male"),
                "created_at": user.get("created_at")
            }
            await db.doctors.insert_one(new_doc)
            
    # 3. Handle patients
    print("\n--- Synchronizing Users with Patients ---")
    async for user in db.users.find({"role": "Patient"}):
        email = user["email"]
        pat = await db.patients.find_one({"email": email})
        if not pat:
            print(f"Patient record missing for user {email}. Creating one...")
            new_pat = {
                "name": user["name"],
                "email": user["email"],
                "age": 0,
                "gender": user.get("gender", "Male"),
                "condition": "General Checkup",
                "status": "Stable",
                "ward": "OPD",
                "risk": "Low",
                "created_at": user.get("created_at")
            }
            await db.patients.insert_one(new_pat)

    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_doctors())
