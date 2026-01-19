import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limit = Number(searchParams.get("limit") || 20);
  const offset = Number(searchParams.get("offset") || 0);

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const result = await pool.query(`
  SELECT
    c.id,
    c.name,
    cs.batch,
    cs.stage,
    cs.location,
    cs.description,
    s.momentum_score,
    s.stability_score
  FROM companies c

  -- Latest snapshot per company
  JOIN LATERAL (
    SELECT *
    FROM company_snapshots
    WHERE company_id = c.id
    ORDER BY scraped_at DESC
    LIMIT 1
  ) cs ON true

  -- Scores
  LEFT JOIN company_scores s ON s.company_id = c.id

  WHERE
    to_tsvector('english',
      c.name || ' ' ||
      COALESCE(cs.description, '') || ' ' ||
      COALESCE(cs.tags::text, '')
    )
    @@ plainto_tsquery('english', $1)

  ORDER BY s.momentum_score DESC NULLS LAST
  LIMIT 50
`, [q]);


  return NextResponse.json(result.rows);
}
