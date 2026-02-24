import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client.auralis_db

async def enrich():
    print("Starting manual enrichment...")
    doctors = [
        {
            "name": "Dr. Sarah Connor",
            "email": "sarah.c@auralis.com",
            "role": "Chief Surgeon",
            "specialty": "Cardiology",
            "department": "ER",
            "bio": "Experienced cardiologist specializing in emergency trauma and cardiac surgery.",
            "experience": "18 Years",
            "education": "Harvard Medical School",
            "achievements": ["Innovator of the Year 2023", "Chief of Surgery 2021-Present", "Board Certified in Cardiothoracic Surgery"],
            "clinical_stats": {"surgeries": "4,200+", "patient_success": "99.2%", "consultations": "12k+"},
            "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        },
        {
            "name": "Dr. James Carter",
            "email": "james.c@auralis.com",
            "role": "Consultant",
            "specialty": "Internal Medicine",
            "department": "General Ward",
            "bio": "Expert in diagnostic medicine and long-term patient rehabilitation strategies.",
            "experience": "12 Years",
            "education": "Johns Hopkins University",
            "achievements": ["Excellence in Patient Care 2022", "Published Researcher in Diagnostic AI"],
            "clinical_stats": {"surgeries": "N/A", "patient_success": "98.5%", "consultations": "15k+"},
            "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
        }
    ]
    
    for doc in doctors:
        res = await db.users.update_one({"email": doc["email"]}, {"$set": doc})
        print(f"Updated {doc['email']}: {res.matched_count} matched, {res.modified_count} modified")

if __name__ == "__main__":
    asyncio.run(enrich())
