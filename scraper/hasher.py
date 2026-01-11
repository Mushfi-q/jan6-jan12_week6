import hashlib
import json

def compute_snapshot_hash(snapshot):
    relevant = {
        "batch": snapshot["batch"],
        "stage": snapshot["stage"],
        "description": snapshot["description"],
        "location": snapshot["location"],
        "tags": sorted(snapshot["tags"]),
        "employee_range": snapshot["employee_range"],
    }

    payload = json.dumps(relevant, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()
