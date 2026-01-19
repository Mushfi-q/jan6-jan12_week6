import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  // ---- Fastest growing tags ----
  const tags = await pool.query(`
    SELECT
      tag,
      COUNT(*) AS count
    FROM (
      SELECT
        cs.company_id,
        jsonb_array_elements_text(cs.tags) AS tag
      FROM company_snapshots cs
      WHERE cs.tags IS NOT NULL
        AND jsonb_typeof(cs.tags) = 'array'
        AND cs.scraped_at = (
          SELECT MAX(cs2.scraped_at)
          FROM company_snapshots cs2
          WHERE cs2.company_id = cs.company_id
        )
    ) t
    GROUP BY tag
    ORDER BY count DESC
    LIMIT 10
  `);

  // ---- Top locations (latest snapshot only) ----
  const locations = await pool.query(`
    SELECT
      location,
      COUNT(*) AS count
    FROM company_snapshots cs
    WHERE cs.location IS NOT NULL
      AND cs.location != 'Unknown'
      AND cs.scraped_at = (
        SELECT MAX(cs2.scraped_at)
        FROM company_snapshots cs2
        WHERE cs2.company_id = cs.company_id
      )
    GROUP BY location
    ORDER BY count DESC
    LIMIT 10
  `);

  // ---- Stage transitions ----
  const stages = await pool.query(`
    SELECT
      change_type,
      COUNT(*) AS count
    FROM company_changes
    WHERE change_type = 'STAGE_CHANGE'
    GROUP BY change_type
  `);

  return NextResponse.json({
    fastest_growing_tags: tags.rows,
    top_locations: locations.rows,
    stage_transitions: stages.rows,
  });
}
