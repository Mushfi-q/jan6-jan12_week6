def normalize_snapshot(raw):
    return {
        "profile_url": raw["profile_url"],
        "name": raw["name"],
        "domain": raw["domain"],
        "batch": raw["batch"],
        "stage": raw["stage"],
        "description": raw["description"],
        "location": raw["location"],
        "employee_range": raw["employee_range"],
        "tags": raw["tags"],
    }
