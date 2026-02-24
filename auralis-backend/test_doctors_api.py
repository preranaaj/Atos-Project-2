import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_get_doctors():
    try:
        print(f"Testing GET {BASE_URL}/doctors...")
        response = requests.get(f"{BASE_URL}/doctors")
        if response.status_code == 200:
            doctors = response.json()
            print(f"SUCCESS: Received {len(doctors)} doctors.")
            print(json.dumps(doctors, indent=2))
        else:
            print(f"FAILURE: Status code {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_get_doctors()
