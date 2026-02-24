import asyncio
import motor.motor_asyncio
import re

MONGO_URI = "mongodb+srv://lakshmiyv26:K33sbBE1XmRrEK4r@cluster0.8ecar.mongodb.net/auralis_db?retryWrites=true&w=majority"

# A diverse list of realistic patient names
REAL_NAMES_MALE = [
    "James Harrington", "Michael Chen", "Robert Patel", "William Torres",
    "David Nguyen", "Carlos Fernandez", "Ethan Wright", "Samuel Kim",
    "Daniel Okafor", "Benjamin Kapoor", "Christopher Mehta", "Jonathan Lee",
    "Alexander Russo", "Matthew Diaz", "Nicholas Sharma", "Thomas Rivera",
    "Andrew Sullivan", "Joshua Nakamura", "Ryan Adebayo", "Kevin Park",
    "Marcus Johnson", "Patrick O'Brien", "Stefan Müller", "Anthony Reyes",
    "Gregory Wallace", "Brian Mitchell", "Eric Hansen", "Harold Brooks",
    "Donald Fleming", "Raymond Castillo",
]

REAL_NAMES_FEMALE = [
    "Emily Watson", "Sarah Johnson", "Jessica Patel", "Olivia Chen",
    "Sophia Martinez", "Isabella Kim", "Ava Thompson", "Mia Rodriguez",
    "Charlotte Nguyen", "Amelia Kapoor", "Harper Singh", "Evelyn Torres",
    "Abigail Williams", "Elizabeth Davis", "Sofia Hernandez", "Victoria Brown",
    "Grace Lee", "Chloe Walker", "Natalie Anderson", "Lily Okafor",
    "Hannah Russo", "Zoe Campbell", "Samantha Murphy", "Audrey Cooper",
    "Claire Bennett", "Nadia Sharma", "Rosa Moreno", "Monica Patel",
    "Patricia Reed", "Diane Foster",
]

GENDER_NEUTRAL = REAL_NAMES_MALE + REAL_NAMES_FEMALE

async def rename_patients():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db

    # Fetch all patients
    patients = await db.patients.find().to_list(length=500)
    print(f"Total patients found: {len(patients)}")

    male_idx = 0
    female_idx = 0
    generic_idx = 0
    updated = 0

    for patient in patients:
        name = patient.get("name", "")
        gender = patient.get("gender", "").upper()

        # Check if name looks generic (e.g. "patient1", "Patient 2", "patient_1", etc.)
        is_generic = bool(re.match(r'^patient[\s_\-]?\d*$', name.strip(), re.IGNORECASE))

        if is_generic:
            if gender == "M":
                new_name = REAL_NAMES_MALE[male_idx % len(REAL_NAMES_MALE)]
                male_idx += 1
            elif gender == "F":
                new_name = REAL_NAMES_FEMALE[female_idx % len(REAL_NAMES_FEMALE)]
                female_idx += 1
            else:
                new_name = GENDER_NEUTRAL[generic_idx % len(GENDER_NEUTRAL)]
                generic_idx += 1

            await db.patients.update_one(
                {"_id": patient["_id"]},
                {"$set": {"name": new_name}}
            )
            print(f"  Updated: '{name}' -> '{new_name}' (gender={gender})")
            updated += 1

    print(f"\nDone! {updated} patient records renamed out of {len(patients)} total.")
    client.close()

if __name__ == "__main__":
    asyncio.run(rename_patients())
