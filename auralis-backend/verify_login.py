import asyncio
import motor.motor_asyncio
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["sha256_crypt", "bcrypt"], deprecated="auto")
MONGO_URI = "mongodb://localhost:27017/auralis_db"

async def verify():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.auralis_db
    
    email = "admin@auralis.com"
    password = "admin123"
    
    print(f"Targeting Email: {email}")
    
    for col_name in ["users", "admin", "doctors", "patients"]:
        col = db[col_name]
        user = await col.find_one({"email": email})
        if user:
            print(f"Found user in collection '{col_name}'")
            if "password" in user:
                stored_hash = user["password"]
                is_valid = pwd_context.verify(password, stored_hash)
                print(f"Stored Hash: {stored_hash}")
                print(f"Password Verify Result: {is_valid}")
                
                # Check what scheme was used
                try:
                    scheme = pwd_context.identify(stored_hash)
                    print(f"Detected Scheme: {scheme}")
                except:
                    print("Could not identify scheme")
            else:
                print("User has no password field!")
        else:
            print(f"User NOT found in collection '{col_name}'")

if __name__ == "__main__":
    asyncio.run(verify())
