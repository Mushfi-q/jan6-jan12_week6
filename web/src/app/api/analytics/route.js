import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const batches = await pool.query(`
    SELECT batch, COUNT(*) 
    FROM company_snapshots
    GROUP BY batch
    ORDER BY COUNT(*) DESC
    LIMIT 10
  `);

  const tags = await pool.query(`
    SELECT tag, COUNT(*) 
    FROM (
      SELECT jsonb_array_elements_text(tags) AS tag
      FROM company_snapshots
      WHERE jsonb_typeof(tags) = 'array'
    ) t
    GROUP BY tag
    ORDER BY COUNT(*) DESC
    LIMIT 10
  `);

  return NextResponse.json({
    top_batches: batches.rows,
    top_tags: tags.rows,
  });
}
