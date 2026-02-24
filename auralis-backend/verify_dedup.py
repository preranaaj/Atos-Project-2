import requests

def verify_deduplication():
    try:
        response = requests.get("http://localhost:5000/patients")
        if response.status_code == 200:
            patients = response.json()
            ids = [p['id'] for p in patients]
            unique_ids = set(ids)
            print(f"Total Patients: {len(ids)}")
            print(f"Unique IDs: {len(unique_ids)}")
            if len(ids) == len(unique_ids):
                print("SUCCESS: No duplicates found.")
            else:
                print("FAILURE: Duplicates found.")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_deduplication()
