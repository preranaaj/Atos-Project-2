import asyncio
import motor.motor_asyncio
from passlib.context import CryptContext

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

async def seed_data():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    
    # Doctors data
    doctors = [
        {
            "name": "Dr. Sarah Connor",
            "email": "sarah.c@auralis.com",
            "password": pwd_context.hash("password123"),
            "role": "Chief Surgeon",
            "specialty": "Cardiology",
            "department": "ER",
            "bio": "Experienced cardiologist specializing in emergency trauma.",
            "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        },
        {
            "name": "Dr. James Carter",
            "email": "james.c@auralis.com",
            "password": pwd_context.hash("password123"),
            "role": "Consultant",
            "specialty": "Internal Medicine",
            "department": "General Ward",
            "bio": "Expert in diagnostic medicine and patient rehabilitation.",
            "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
        },
        {
            "name": "Dr. Elena Vance",
            "email": "elena.v@auralis.com",
            "password": pwd_context.hash("password123"),
            "role": "Specialist",
            "specialty": "Neurology",
            "department": "ICU",
            "bio": "Focuses on intensive care neurology and stroke recovery.",
            "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
        }
    ]
    
    # Re-seed doctor profiles
    await db.users.delete_many({"email": {"$in": [d["email"] for d in doctors]}})
    await db.users.insert_many(doctors)
    
    print(f"Successfully seeded {len(doctors)} doctor profiles.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
