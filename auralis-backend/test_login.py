import requests

url = "http://127.0.0.1:5000/auth/login"
data = {"email": "sarah.c@auralis.com", "password": "password123"}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
