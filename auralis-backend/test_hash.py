from passlib.context import CryptContext
import sys

try:
    print("Initializing pwd_context...")
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    print("Hashing 'password123'...")
    h = pwd_context.hash("password123")
    print(f"Hash successful: {h[:20]}...")
    
    print("Verifying...")
    match = pwd_context.verify("password123", h)
    print(f"Match: {match}")
    sys.exit(0)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
