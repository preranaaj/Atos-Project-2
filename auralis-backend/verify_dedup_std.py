import urllib.request
import json

def verify_deduplication():
    try:
        with urllib.request.urlopen("http://127.0.0.1:5000/patients") as response:
            data = json.loads(response.read().decode())
            ids = [p['id'] for p in data]
            unique_ids = set(ids)
            print(f"Total Patients: {len(ids)}")
            print(f"Unique IDs: {len(unique_ids)}")
            if len(ids) == len(unique_ids):
                print("SUCCESS: No duplicates found.")
            else:
                print("FAILURE: Duplicates found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_deduplication()
