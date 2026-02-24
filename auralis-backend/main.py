from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
import pandas as pd
import numpy as np
import os
import motor.motor_asyncio
from passlib.context import CryptContext
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Auralis Health Systems API")

# Security
pwd_context = CryptContext(schemes=["sha256_crypt", "bcrypt", "pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    try:
        # Passlib has some issues on newer Python versions with bcrypt detection
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError as e:
        # If bcrypt 72-byte error occurs, try a direct check if it looks like a bcrypt hash
        if "72 bytes" in str(e) and hashed_password.startswith("$2"):
            import bcrypt
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        print(f"Password verification error: {e}")
        return False
    except Exception as e:
        print(f"Auth verification exception: {e}")
        return False

@app.get("/")
async def root():
    return {"message": "Auralis Health Systems API is online", "docs": "/docs", "health": "/health"}

@app.get("/health")
async def health_check():
    return {"status": "connected", "database": "stable", "timestamp": datetime.utcnow()}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import certifi

# Configuration
DATA_PATH = os.path.join("..", "Patient Vital Signs and Event Tracking", "dummy_obs.csv")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/auralis_db")

# Database Init
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
db = client.auralis_db

# Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    gender: str
    role: Optional[str] = "Patient"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    specialty: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    achievements: Optional[List[str]] = None
    clinical_stats: Optional[Dict[str, str]] = None
    image: Optional[str] = None
    gender: Optional[str] = None

class VitalsCreate(BaseModel):
    hr: int
    sbp: int
    dbp: int
    rr: Optional[int] = 18
    temp: float
    spo2: int
    weight: Optional[float] = None
    height: Optional[float] = None
    note: Optional[str] = ""

class DiagnosisCreate(BaseModel):
    patient_id: str
    symptoms: str
    diagnosis: str
    prescription: str
    notes: Optional[str] = ""
    follow_up_plan: Optional[str] = ""

class BillCreate(BaseModel):
    patient_id: str
    service_name: str
    unit_cost: float
    quantity: int
    total_cost: float
    service_date: str
    status: Optional[str] = "Unpaid"

class AppointmentBase(BaseModel):
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    service: str
    date: str
    time: str
    notes: Optional[str] = ""
    status: Optional[str] = "Pending"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    cancellation_reason: Optional[str] = None

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    condition: str
    status: str
    ward: str
    risk: Optional[str] = "Low"
    blood_type: Optional[str] = "O+"
    ml_risk_score: Optional[float] = 0.15
    phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    medical_history: Optional[str] = "None reported"

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    condition: Optional[str] = None
    status: Optional[str] = None
    ward: Optional[str] = None
    risk: Optional[str] = None
    blood_type: Optional[str] = None
    ml_risk_score: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None

class ReviewCreate(BaseModel):
    doctor_id: str
    patient_id: str
    patient_name: str
    rating: int
    comment: str

class ReviewResponse(ReviewCreate):
    id: str
    created_at: datetime

# Load CSV data
try:
    df = pd.read_csv(DATA_PATH)
    df['hadm_id'] = df['hadm_id'].astype(str)
    df['charttime'] = pd.to_datetime(df['charttime'])
    df = df.sort_values(['hadm_id', 'charttime'])
except Exception as e:
    print(f"Error loading data: {e}")
    df = pd.DataFrame()

# Auth Endpoints
@app.on_event("startup")
async def startup_db_client():
    print("Application starting up... verifying system roles in separate collections")
    try:
        hashed_pwd = pwd_context.hash("password123")
        admin_pwd = pwd_context.hash("admin123")
        
        # Seed Administrations
        admin_doc = {
            "name": "System Administrator",
            "email": "admin@auralis.com",
            "password": admin_pwd,
            "role": "Admin",
            "gender": "Other",
            "created_at": datetime.utcnow()
        }
        if not await db.admin.find_one({"email": admin_doc["email"]}):
            await db.admin.insert_one(admin_doc)
            print("Seeded Admin: admin@auralis.com")

        # Seed Doctors
        doctors_to_seed = [
            {
                "name": "Dr. Sarah Connor",
                "email": "sarah.c@auralis.com",
                "password": hashed_pwd,
                "role": "Doctor",
                "specialty": "Cardiology",
                "department": "ER",
                "gender": "Female",
                "bio": "Experienced cardiologist specializing in emergency trauma and cardiac surgery.",
                "experience": "18 Years",
                "education": "Harvard Medical School",
                "achievements": ["Innovator of the Year 2023", "Chief of Surgery 2021-Present", "Board Certified in Cardiothoracic Surgery"],
                "clinical_stats": {"surgeries": "4,200+", "patient_success": "99.2%", "consultations": "12k+"},
                "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                "created_at": datetime.utcnow()
            },
            {
                "name": "General Doctor",
                "email": "doctor@auralis.com",
                "password": hashed_pwd,
                "role": "Doctor",
                "specialty": "Internal Medicine",
                "department": "General Ward",
                "gender": "Other",
                "created_at": datetime.utcnow()
            }
        ]
        
        for doc in doctors_to_seed:
            if not await db.doctors.find_one({"email": doc["email"]}):
                await db.doctors.insert_one(doc)
                print(f"Seeded Doctor: {doc['email']}")
        
    except Exception as e:
        print(f"Startup user seeding error: {e}")

    # Deduplication and Uniqueness Enforcement
    print("Enforcing clinical record integrity...")
    try:
        await db.patients.create_index("id", unique=True, sparse=True)
        print("Unique index on 'id' confirmed.")
    except Exception as e:
        print(f"Index creation failed, attempting cleanup: {e}")
        pipeline = [
            {"$match": {"id": {"$ne": None}}},
            {"$group": {"_id": "$id", "ids": {"$push": "$_id"}, "count": {"$sum": 1}}},
            {"$match": {"count": {"$gt": 1}}}
        ]
        duplicates_cursor = db.patients.aggregate(pipeline)
        async for doc in duplicates_cursor:
            to_delete = doc["ids"][1:]
            await db.patients.delete_many({"_id": {"$in": to_delete}})
            
        try:
            await db.patients.create_index("id", unique=True, sparse=True)
            print("Unique index enforced after cleanup.")
        except Exception as final_e:
            print(f"Final index enforcement failed: {final_e}")

    print("Checking for legacy patient migration...")
    try:
        if not df.empty:
            unique_patients = df.groupby('hadm_id').first().reset_index()
            migrated_count = 0
            for _, row in unique_patients.iterrows():
                hid = str(row['hadm_id'])
                try:
                    existing = await db.patients.find_one({"id": hid})
                    if not existing:
                        patient_doc = {
                            "id": hid,
                            "name": f"Patient {hid}",
                            "age": int(row['age']),
                            "gender": row['sex'],
                            "condition": "Clinical Monitoring",
                            "status": "Stable",
                            "ward": "General Ward",
                            "risk": "Low",
                            "blood_type": "O+",
                            "ml_risk_score": 0.15,
                            "created_at": datetime.utcnow(),
                            "lastCheck": str(datetime.utcnow())
                        }
                        await db.patients.insert_one(patient_doc)
                        migrated_count += 1
                except Exception:
                    pass
            if migrated_count > 0:
                print(f"Successfully migrated {migrated_count} legacy patients.")
    except Exception as e:
        print(f"Patient migration error: {e}")

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    # Check all collections for duplicate email
    if await db.admin.find_one({"email": user.email}) or \
       await db.doctors.find_one({"email": user.email}) or \
       await db.patients.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow()
    
    if user.role == "Admin":
        target_col = db.admin
    elif user.role == "Doctor":
        target_col = db.doctors
    else:
        target_col = db.patients
        # For patients, we might need extra fields like age, condition
        user_dict.setdefault("age", 0)
        user_dict.setdefault("condition", "General Checkup")
        user_dict.setdefault("status", "Stable")
        user_dict.setdefault("ward", "OPD")
        user_dict.setdefault("risk", "Low")
        user_dict.setdefault("lastCheck", str(datetime.utcnow()))

    result = await target_col.insert_one(user_dict)
    
    return {
        "id": str(result.inserted_id),
        "name": user.name,
        "email": user.email,
        "role": user.role
    }

@app.post("/auth/login")
async def login(user_data: UserLogin):
    print(f"DEBUG: Login attempt for email: {user_data.email}")
    user = None
    # Priority search: check 'users' first as it's the primary auth source, 
    # then fallback to specific collections if needed.
    search_email = user_data.email.lower()
    for col_name in ["users", "admin", "doctors", "patients"]:
        col = db[col_name]
        found_user = await col.find_one({"email": search_email})
        if found_user:
            print(f"DEBUG: Found user in collection: {col_name}")
            if "password" in found_user:
                user = found_user
                break
            else:
                print(f"DEBUG: User in {col_name} has no password field")
        
    if not user:
        print(f"DEBUG: User {search_email} not found in any collection")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(user_data.password, user["password"]):
        print(f"DEBUG: Password verification failed for {search_email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    print(f"DEBUG: Login successful for {search_email}")
    return {
        "id": str(user["_id"]) if "_id" in user else user.get("id"),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "Patient")
    }

@app.get("/doctors")
async def get_doctors():
    doctors_cursor = db.doctors.find({}, {"password": 0})
    doctors = []
    async for doc in doctors_cursor:
        doc["id"] = str(doc["_id"])
        if "_id" in doc: del doc["_id"]
        doctors.append(doc)
    return doctors

@app.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    from bson import ObjectId
    try:
        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)}, {"password": 0})
    except:
        doctor = None
        
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    doctor["id"] = str(doctor["_id"])
    del doctor["_id"]
    return doctor

@app.post("/doctors/{doctor_id}/reviews", status_code=status.HTTP_201_CREATED)
async def add_review(doctor_id: str, review: ReviewCreate):
    review_dict = review.model_dump()
    review_dict["created_at"] = datetime.utcnow()
    result = await db.reviews.insert_one(review_dict)
    return {"message": "Review sumbitted", "id": str(result.inserted_id)}

@app.get("/doctors/{doctor_id}/reviews")
async def get_reviews(doctor_id: str):
    reviews = []
    async for r in db.reviews.find({"doctor_id": doctor_id}).sort("created_at", -1):
        r["id"] = str(r["_id"])
        del r["_id"]
        reviews.append(r)
    return reviews

@app.post("/patients", status_code=status.HTTP_201_CREATED)
async def admit_patient(patient: PatientCreate):
    patient_dict = patient.model_dump()
    patient_dict["created_at"] = datetime.utcnow()
    patient_dict["lastCheck"] = str(datetime.utcnow())
    
    result = await db.patients.insert_one(patient_dict)
    patient_dict["id"] = str(result.inserted_id)
    del patient_dict["_id"]
    return patient_dict

@app.put("/patients/{patient_id}")
async def update_patient(patient_id: str, patient_update: PatientUpdate):
    update_data = {k: v for k, v in patient_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_data["updated_at"] = datetime.utcnow()
    
    from bson import ObjectId
    try:
        obj_id = ObjectId(patient_id)
        result = await db.patients.update_one({"_id": obj_id}, {"$set": update_data})
        if result.matched_count == 0:
            result = await db.patients.update_one({"id": patient_id}, {"$set": update_data})
    except Exception:
        result = await db.patients.update_one({"id": patient_id}, {"$set": update_data})
        
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
            
    return {"message": "Patient updated successfully"}

@app.get("/patients")
async def get_patients():
    patient_list = []
    async for patient in db.patients.find():
        pid = patient.get("id") or str(patient["_id"])
        patient_list.append({
            "id": pid,
            "name": patient["name"],
            "age": patient["age"],
            "gender": patient.get("gender", "U"),
            "condition": patient.get("condition", "N/A"),
            "status": patient.get("status", "Stable"),
            "ward": patient.get("ward", "Observation"),
            "lastVisit": patient.get("lastCheck", "Recently"),
            "risk": patient.get("risk", "Low"),
            "phone": patient.get("phone", "+1-000-000-0000"),
            "email": patient.get("email", "patient@auralis.com"),
            "address": patient.get("address", "Auralis Medical Center"),
            "medical_history": patient.get("medical_history", "None reported")
        })
    return patient_list

@app.get("/patients/{patient_id}")
async def get_patient(patient_id: str):
    patient = await db.patients.find_one({"id": patient_id})
    if not patient:
        try:
            from bson import ObjectId
            patient = await db.patients.find_one({"_id": ObjectId(patient_id)})
        except:
            pass
    
    if patient:
        patient["id"] = patient.get("id") or str(patient["_id"])
        if "_id" in patient: del patient["_id"]
        return patient

    if not df.empty:
        patient_df = df[df['hadm_id'] == patient_id]
        if not patient_df.empty:
            row = patient_df.iloc[0]
            latest = patient_df.iloc[-1]
            is_critical = (latest['SBP'] > 160) or (latest['SPO2'] < 90) or (latest['HR'] > 120)
            return {
                "id": str(row['hadm_id']),
                "name": f"Patient {row['hadm_id']}",
                "age": int(row['age']),
                "gender": row['sex'],
                "condition": "Clinical Monitoring",
                "status": "Critical" if is_critical else "Stable",
                "ward": "ICU" if is_critical else "General Ward",
                "lastVisit": str(latest['charttime']),
                "risk": "High" if is_critical else "Low",
                "blood_type": "A+",
                "ml_risk_score": 0.85 if is_critical else 0.12
            }
    raise HTTPException(status_code=404, detail="Patient not found")

@app.post("/patients/{patient_id}/vitals")
async def add_vitals(patient_id: str, vitals: VitalsCreate):
    vitals_dict = vitals.model_dump()
    vitals_dict["patient_id"] = patient_id
    vitals_dict["timestamp"] = datetime.utcnow()
    
    await db.vitals.insert_one(vitals_dict)
    
    # Also update patient's lastCheck
    from bson import ObjectId
    try:
        await db.patients.update_one({"_id": ObjectId(patient_id)}, {"$set": {"lastCheck": str(datetime.utcnow())}})
    except:
        await db.patients.update_one({"id": patient_id}, {"$set": {"lastCheck": str(datetime.utcnow())}})
        
    return {"message": "Vitals recorded successfully", "timestamp": vitals_dict["timestamp"]}

@app.get("/patients/{patient_id}/vitals")
async def get_patient_vitals(patient_id: str):
    # 1. Get from MongoDB
    db_vitals = []
    async for v in db.vitals.find({"patient_id": patient_id}).sort("timestamp", 1):
        db_vitals.append({
            "timestamp": v["timestamp"].isoformat(),
            "hr": v["hr"],
            "rr": v.get("rr", 18),
            "sbp": v["sbp"],
            "dbp": v.get("dbp", 80), # Default to 80 if missing
            "temp": v["temp"],
            "spo2": v["spo2"],
            "avpu": 0
        })

    # 2. Get from CSV
    patient_df = df[df['hadm_id'] == patient_id]
    csv_vitals = []
    if not patient_df.empty:
        for _, row in patient_df.iterrows():
            csv_vitals.append({
                "timestamp": str(row['charttime']),
                "hr": float(row['HR']),
                "rr": float(row['RR']),
                "sbp": float(row['SBP']),
                "dbp": 80.0, # Placeholder for legacy CSV data
                "temp": float(row['TEMP']),
                "spo2": float(row['SPO2']),
                "avpu": int(row['avpu'])
            })
    
    # 3. Simulated data if both empty
    if not db_vitals and not csv_vitals:
        history = []
        import random
        from datetime import timedelta
        now = datetime.now()
        for i in range(10):
            time_point = now - timedelta(hours=(10-i)*2)
            history.append({
                "timestamp": str(time_point),
                "hr": random.randint(70, 95),
                "rr": random.randint(14, 22),
                "sbp": random.randint(110, 140),
                "temp": round(random.uniform(97.5, 99.5), 1),
                "spo2": random.randint(94, 100),
                "avpu": 0
            })
        return history
        
    return csv_vitals + db_vitals

@app.get("/patients/{patient_id}/timeline")
async def get_patient_timeline(patient_id: str):
    patient_df = df[df['hadm_id'] == patient_id]
    if patient_df.empty:
        from datetime import timedelta
        now = datetime.now()
        return [
            {"time": str(now - timedelta(days=2)), "event": "Emergency Admission", "type": "initial", "provider": "EMS"},
            {"time": str(now - timedelta(days=1)), "event": "Attending Physician Review", "type": "consult", "provider": "Dr. Sarah Connor"},
            {"time": str(now), "event": "Current Monitoring", "type": "observation", "provider": "Clinical Team"}
        ]
    
    event_map = {0: "Admission", 1: "Routine Observation", 2: "Medication Review", 3: "Physician Consult", 4: "Specialist Review"}
    timeline = []
    for _, row in patient_df.iterrows():
        timeline.append({
            "time": str(row['charttime']),
            "event": event_map.get(row['prev_event'], "Monitoring"),
            "type": "vital_check",
            "provider": "Nursing Staff"
        })
    return timeline

@app.put("/doctors/{doctor_id}")
async def update_doctor_profile(doctor_id: str, doctor_data: DoctorUpdate):
    update_data = {k: v for k, v in doctor_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No clinical data provided for update")

    from bson import ObjectId
    user_to_sync = None
    
    # 1. Update Clinical Profile (Doctors Collection)
    try:
        if len(doctor_id) == 24: # Likely ObjectId
            query = {"_id": ObjectId(doctor_id)}
        else:
            query = {"id": doctor_id}
            
        current_doc = await db.doctors.find_one(query)
        if not current_doc:
            # Fallback to email if id doesn't match
            if "email" in update_data:
                current_doc = await db.doctors.find_one({"email": update_data["email"]})
                if current_doc:
                    query = {"_id": current_doc["_id"]}
        
        if not current_doc:
            raise HTTPException(status_code=404, detail="Clinical profile not found")
            
        # Capture email for user sync
        sync_email = current_doc.get("email")
        
        result = await db.doctors.update_one(query, {"$set": update_data})
    except Exception as e:
        print(f"Clinical update error: {e}")
        raise HTTPException(status_code=500, detail=f"Database synchronization failed: {str(e)}")

    # 2. Synchronize with Core User (Users Collection)
    # If name, email, or gender changed, we must update the auth record
    auth_updates = {}
    if "name" in update_data: auth_updates["name"] = update_data["name"]
    if "email" in update_data: auth_updates["email"] = update_data["email"]
    if "gender" in update_data: auth_updates["gender"] = update_data["gender"]
    
    if auth_updates and sync_email:
        try:
            await db.users.update_one({"email": sync_email}, {"$set": auth_updates})
            print(f"Synchronized auth record for {sync_email}")
        except Exception as e:
            print(f"Auth sync warning: {e}")

    return {"message": "Clinical profile synchronized successfully"}

@app.post("/patients/{patient_id}/diagnosis")
async def add_diagnosis(patient_id: str, diagnosis: DiagnosisCreate):
    diag_dict = diagnosis.model_dump()
    diag_dict["timestamp"] = datetime.utcnow()
    await db.diagnosis.insert_one(diag_dict)
    return {"message": "Diagnosis added successfully", "timestamp": diag_dict["timestamp"]}

@app.get("/patients/{patient_id}/diagnosis")
async def get_diagnosis(patient_id: str):
    diagnosis_list = []
    async for d in db.diagnosis.find({"patient_id": patient_id}).sort("timestamp", -1):
        d["id"] = str(d["_id"])
        del d["_id"]
        diagnosis_list.append(d)
    return diagnosis_list

@app.post("/patients/{patient_id}/bills")
async def add_bill(patient_id: str, bill: BillCreate):
    bill_dict = bill.model_dump()
    bill_dict["created_at"] = datetime.utcnow()
    await db.bills.insert_one(bill_dict)
    return {"message": "Bill generated successfully"}

@app.get("/patients/{patient_id}/bills")
async def get_bills(patient_id: str):
    bills_list = []
    async for b in db.bills.find({"patient_id": patient_id}).sort("created_at", -1):
        b["id"] = str(b["_id"])
        del b["_id"]
        bills_list.append(b)
    return bills_list

@app.delete("/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str):
    from bson import ObjectId
    try:
        obj_id = ObjectId(doctor_id)
        result = await db.doctors.delete_one({"_id": obj_id})
    except:
        result = await db.doctors.delete_one({"id": doctor_id})
    return {"message": "Doctor deleted successfully"}

@app.delete("/patients/{patient_id}")
async def delete_patient(patient_id: str):
    from bson import ObjectId
    try:
        obj_id = ObjectId(patient_id)
        result = await db.patients.delete_one({"_id": obj_id})
    except:
        result = await db.patients.delete_one({"id": patient_id})
    return {"message": "Patient deleted successfully"}

@app.get("/admin/users")
async def get_all_users():
    users = []
    # Collect from all management collections
    for collection in [db.admin, db.doctors, db.patients]:
        async for u in collection.find({}):
            u["id"] = str(u["_id"])
            if "_id" in u: del u["_id"]
            if "password" in u: del u["password"]
            users.append(u)
            
    # Also check legacy users collection if it exists
    async for u in db.users.find({}):
        u["id"] = str(u["_id"])
        if "_id" in u: del u["_id"]
        if "password" in u: del u["password"]
        users.append(u)
        
    return users

@app.get("/admin/stats")
async def get_admin_stats():
    patient_count = await db.patients.count_documents({})
    doctor_count = await db.doctors.count_documents({})
    appointment_count = await db.appointments.count_documents({})
    user_count = await db.admin.count_documents({}) + doctor_count + patient_count
    
    return {
        "patients": patient_count,
        "doctors": doctor_count,
        "appointments": appointment_count,
        "users": user_count,
        "uptime": "99.9%"
    }

@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: str):
    from bson import ObjectId
    try:
        oid = ObjectId(user_id)
    except:
        oid = None

    deleted = False
    for col in [db.admin, db.doctors, db.patients, db.users]:
        if oid:
            res = await col.delete_one({"_id": oid})
        else:
            res = await col.delete_one({"id": user_id})
            
        if res.deleted_count > 0:
            deleted = True
            break
            
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@app.post("/appointments", status_code=status.HTTP_201_CREATED)
async def book_appointment(appointment: AppointmentCreate):
    appointment_dict = appointment.model_dump()
    appointment_dict["created_at"] = datetime.utcnow()
    result = await db.appointments.insert_one(appointment_dict)
    appointment_dict["id"] = str(result.inserted_id)
    del appointment_dict["_id"]
    return appointment_dict

@app.get("/appointments")
async def get_appointments(user_id: Optional[str] = None, role: Optional[str] = None):
    query = {}
    if role == 'Patient' and user_id:
        query["patient_id"] = user_id
    elif role == 'Doctor' and user_id:
        query["doctor_id"] = user_id
        
    appointments = []
    async for apt in db.appointments.find(query).sort("date", 1):
        apt["id"] = str(apt["_id"])
        del apt["_id"]
        appointments.append(apt)
    return appointments

@app.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, update: AppointmentUpdate):
    from bson import ObjectId
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    result = await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    return {"message": "Appointment updated successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
