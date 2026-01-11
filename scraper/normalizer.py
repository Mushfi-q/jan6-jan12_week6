def normalize_snapshot(data):
    return {
        "profile_url": data["profile_url"],
        "name": data["name"] or "Unknown",
        "domain": data["domain"],
        "batch": data["batch"] or "Unknown",
        "stage": data["stage"] or "Unknown",
        "description": data["description"] or "",
        "location": data["location"] or "Unknown",
        "tags": data["tags"] or [],
        "employee_range": data["employee_range"] or "Unknown",
    }
