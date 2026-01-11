from datetime import datetime

def detect_and_store_changes(conn, company_id, old, new):
    changes = []

    if old["stage"] != new["stage"]:
        changes.append(("STAGE_CHANGE", old["stage"], new["stage"]))

    if old["location"] != new["location"]:
        changes.append(("LOCATION_CHANGE", old["location"], new["location"]))

    if set(old["tags"]) != set(new["tags"]):
        changes.append(("TAG_CHANGE", str(old["tags"]), str(new["tags"])))

    if old["description"] != new["description"]:
        changes.append(("DESCRIPTION_CHANGE", old["description"], new["description"]))

    with conn.cursor() as cur:
        for ctype, old_val, new_val in changes:
            cur.execute(
                """
                INSERT INTO company_changes
                (company_id, change_type, old_value, new_value, detected_at)
                VALUES (%s,%s,%s,%s,%s)
                """,
                (company_id, ctype, old_val, new_val, datetime.utcnow())
            )
