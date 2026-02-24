from pymongo import MongoClient
from passlib.context import CryptContext
import datetime

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def seed_data():
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client.auralis_db
    
    print("Hashing password...")
    hashed_pwd = pwd_context.hash("password123")
    
    # Doctors data
    doctors = [
        {
            "name": "Dr. Sarah Connor",
            "email": "sarah.c@auralis.com",
            "password": hashed_pwd,
            "role": "Chief Surgeon",
            "specialty": "Cardiology",
            "department": "ER",
            "bio": "Experienced cardiologist specializing in emergency trauma.",
            "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            "created_at": datetime.datetime.utcnow()
        },
        {
            "name": "Dr. James Carter",
            "email": "james.c@auralis.com",
            "password": hashed_pwd,
            "role": "Consultant",
            "specialty": "Internal Medicine",
            "department": "General Ward",
            "bio": "Expert in diagnostic medicine and patient rehabilitation.",
            "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
            "created_at": datetime.datetime.utcnow()
        }
    ]
    
    print("Cleaning existing users...")
    emails = [d["email"] for d in doctors]
    db.users.delete_many({"email": {"$in": emails}})
    
    print(f"Inserting {len(doctors)} users...")
    db.users.insert_many(doctors)
    
    # Verify
    count = db.users.count_documents({"email": "sarah.c@auralis.com"})
    print(f"Verification: Sarah Connor count = {count}")
    
    client.close()
    print("Seeding complete.")

if __name__ == "__main__":
    try:
        seed_data()
    except Exception as e:
        print(f"Fatal Error: {e}")
