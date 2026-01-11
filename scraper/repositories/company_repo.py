from datetime import datetime

def get_company_by_yc_id(conn, yc_company_id):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM companies WHERE yc_company_id = %s",
            (yc_company_id,)
        )
        row = cur.fetchone()
        if row:
            return dict(zip([d[0] for d in cur.description], row))
        return None


def insert_company(conn, yc_company_id, name, domain):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO companies (yc_company_id, name, domain)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (yc_company_id, name, domain)
        )
        return cur.fetchone()[0]


def update_company_seen(conn, company_id):
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE companies SET last_seen_at = %s WHERE id = %s",
            (datetime.utcnow(), company_id)
        )
