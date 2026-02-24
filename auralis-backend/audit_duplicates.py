import motor.motor_asyncio
import asyncio
from bson import ObjectId

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

async def audit_duplicates():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    
    print("Fetching all patients...")
    cursor = db.patients.find({})
    patients = await cursor.to_list(length=1000)
    
    id_map = {}
    duplicates = []
    
    for p in patients:
        pid = p.get("id") or str(p["_id"])
        if pid in id_map:
            duplicates.append(pid)
            id_map[pid].append(p)
        else:
            id_map[pid] = [p]
            
    print(f"Total documents: {len(patients)}")
    print(f"Unique IDs: {len(id_map)}")
    
    if duplicates:
        print("\nDUPLICATES FOUND:")
        for pid in set(duplicates):
            docs = id_map[pid]
            print(f"\nID: {pid} ({len(docs)} documents)")
            for d in docs:
                print(f"  - _id: {d['_id']}, Name: {d.get('name')}, Status: {d.get('status')}, LastCheck: {d.get('lastCheck')}")
    else:
        print("\nNo duplicate IDs found.")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(audit_duplicates())
