import asyncio
import motor.motor_asyncio
import os
import certifi
from passlib.context import CryptContext
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("ERROR: MONGO_URI not found in environment. Please check your .env file.")
    exit(1)

pwd_context = CryptContext(schemes=["sha256_crypt", "bcrypt", "pbkdf2_sha256"], deprecated="auto")

async def seed_database():
    print(f"Connecting to: {MONGO_URI}")
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client.auralis_db

    # 1. Seed Admin
    admin_pwd = pwd_context.hash("admin123")
    admin = {
        "name": "System Administrator",
        "email": "admin@auralis.com",
        "password": admin_pwd,
        "role": "Admin",
        "gender": "Other",
        "created_at": datetime.utcnow()
    }
    await db.admin.update_one({"email": admin["email"]}, {"$set": admin}, upsert=True)
    print("✅ Seeded Admin: admin@auralis.com")

    # 2. Seed Doctors
    doc_pwd = pwd_context.hash("password123")
    doctors = [
        {
            "name": "Dr. Sarah Connor",
            "email": "sarah.c@auralis.com",
            "password": doc_pwd,
            "role": "Doctor",
            "specialty": "Cardiology",
            "department": "ER",
            "gender": "Female",
            "bio": "Experienced cardiologist specializing in emergency trauma.",
            "created_at": datetime.utcnow()
        },
        {
            "name": "General Doctor",
            "email": "doctor@auralis.com",
            "password": doc_pwd,
            "role": "Doctor",
            "specialty": "Internal Medicine",
            "department": "General Ward",
            "gender": "Other",
            "created_at": datetime.utcnow()
        }
    ]
    for doc in doctors:
        await db.doctors.update_one({"email": doc["email"]}, {"$set": doc}, upsert=True)
    print(f"✅ Seeded {len(doctors)} Doctors")

    # 3. Seed Sample Patients
    patients = [
        {
            "id": "PAT-001",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "age": 45,
            "gender": "Male",
            "condition": "Hypertension",
            "status": "Stable",
            "ward": "Ward A",
            "risk": "Medium",
            "created_at": datetime.utcnow()
        },
        {
            "id": "PAT-002",
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "age": 32,
            "gender": "Female",
            "condition": "Post-Op Recovery",
            "status": "Recovering",
            "ward": "Ward B",
            "risk": "Low",
            "created_at": datetime.utcnow()
        }
    ]
    for patient in patients:
        await db.patients.update_one({"id": patient["id"]}, {"$set": patient}, upsert=True)
    print(f"✅ Seeded {len(patients)} Patients")

    print("\n🚀 Database Seeding Complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
