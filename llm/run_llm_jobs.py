from scraper.db import get_connection
from llm.generators import (
    generate_company_summary,
    generate_score_explanation,
)


def run_llm_jobs(limit=50):
    conn = get_connection()
    cur = conn.cursor()

    # ---- Fetch latest snapshot + scores ----
    cur.execute("""
        SELECT
          c.id,
          c.name,
          cs.batch,
          cs.stage,
          cs.location,
          cs.tags,
          cs.description,
          s.momentum_score,
          s.stability_score
        FROM companies c
        JOIN company_scores s ON s.company_id = c.id
        JOIN LATERAL (
          SELECT *
          FROM company_snapshots
          WHERE company_id = c.id
          ORDER BY scraped_at DESC
          LIMIT 1
        ) cs ON true
        LIMIT %s
    """, (limit,))

    rows = cur.fetchall()

    for row in rows:
        (
            company_id,
            name,
            batch,
            stage,
            location,
            tags,
            description,
            momentum,
            stability,
        ) = row

        try:
            summary = generate_company_summary({
                "name": name,
                "batch": batch,
                "stage": stage,
                "location": location,
                "tags": tags,
                "description": description,
            })

            cur.execute("""
                INSERT INTO company_llm_insights
                (company_id, insight_type, content, model_name)
                VALUES (%s, 'SUMMARY', %s, %s)
            """, (company_id, summary, "placeholder-llm"))

            explanation = generate_score_explanation({
                "momentum_score": momentum,
                "stability_score": stability,
                "change_count": 0,
            })

            cur.execute("""
                INSERT INTO company_llm_insights
                (company_id, insight_type, content, model_name)
                VALUES (%s, 'SCORE_EXPLANATION', %s, %s)
            """, (company_id, explanation, "placeholder-llm"))

        except Exception as e:
            print(f"LLM skipped for company {company_id}: {e}")

    conn.commit()
    cur.close()
    conn.close()


if __name__ == "__main__":
    run_llm_jobs()
