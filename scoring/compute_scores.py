from collections import defaultdict
from datetime import datetime

from scraper.db import get_connection
from scoring.momentum import compute_momentum
from scoring.stability import compute_stability


def compute_all_scores():
    conn = get_connection()
    cur = conn.cursor()  

    # ---- Fetch recent changes ----
    cur.execute("""
        SELECT company_id, change_type, detected_at
        FROM company_changes
        WHERE detected_at >= NOW() - INTERVAL '6 months'
    """)
    change_rows = cur.fetchall()

    changes_by_company = defaultdict(list)
    last_change = {}

    for cid, ctype, dt in change_rows:
        changes_by_company[cid].append(ctype)
        last_change[cid] = max(last_change.get(cid, dt), dt)

    # ---- Fetch company ages ----
    cur.execute("""
        SELECT id,
               EXTRACT(DAY FROM (NOW() - COALESCE(first_seen_at, NOW())))
        FROM companies
    """)
    age_rows = cur.fetchall()

    print(f"Companies to score: {len(age_rows)}")

    # ---- Fetch last snapshot times (ONE QUERY) ----
    cur.execute("""
        SELECT company_id, MAX(scraped_at)
        FROM company_snapshots
        GROUP BY company_id
    """)
    snapshot_times = dict(cur.fetchall())

    # ---- Compute + insert scores ----
    for company_id, age_days in age_rows:
        changes = changes_by_company.get(company_id, [])
        last_change_at = last_change.get(company_id) or snapshot_times.get(company_id)

        momentum = compute_momentum(changes, last_change_at)
        stability = compute_stability(age_days, len(changes), last_change_at)

        cur.execute("""
            INSERT INTO company_scores
              (company_id, momentum_score, stability_score, last_computed_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (company_id) DO UPDATE
            SET
              momentum_score = EXCLUDED.momentum_score,
              stability_score = EXCLUDED.stability_score,
              last_computed_at = EXCLUDED.last_computed_at
        """, (
            company_id,
            momentum,
            stability,
            datetime.utcnow()
        ))

    conn.commit()
    cur.close()
    conn.close()


if __name__ == "__main__":
    compute_all_scores()
