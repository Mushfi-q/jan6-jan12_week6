from scraper.db import get_connection


def build_search_index():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE companies c
SET search_vector =
  setweight(to_tsvector('english', c.name), 'A') ||
  setweight(
    to_tsvector(
      'english',
      COALESCE(cs.description, '')
    ),
    'B'
  ) ||
  setweight(
    to_tsvector(
      'english',
      COALESCE(
        CASE
          WHEN jsonb_typeof(cs.tags) = 'array' THEN
            (
              SELECT string_agg(value, ' ')
              FROM jsonb_array_elements_text(cs.tags)
            )
          ELSE ''
        END,
        ''
      )
    ),
    'B'
  )
FROM (
  SELECT DISTINCT ON (company_id)
    company_id,
    description,
    tags
  FROM company_snapshots
  ORDER BY company_id, scraped_at DESC
) cs
WHERE cs.company_id = c.id;

    """)

    conn.commit()
    cur.close()
    conn.close()

    print("Search index built successfully")


if __name__ == "__main__":
    build_search_index()
