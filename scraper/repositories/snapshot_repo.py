from datetime import datetime

def get_latest_snapshot(conn, company_id):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT *
            FROM company_snapshots
            WHERE company_id = %s
            ORDER BY scraped_at DESC
            LIMIT 1
            """,
            (company_id,)
        )
        return cur.fetchone()


def insert_snapshot(conn, company_id, snapshot, snapshot_hash):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO company_snapshots
            (
                company_id, batch, stage, description,
                location, tags, employee_range,
                scraped_at, snapshot_hash
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                company_id,
                snapshot["batch"],
                snapshot["stage"],
                snapshot["description"],
                snapshot["location"],
                snapshot["tags"],
                snapshot["employee_range"],
                datetime.utcnow(),
                snapshot_hash
            )
        )
