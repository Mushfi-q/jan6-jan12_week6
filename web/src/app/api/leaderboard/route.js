import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  // ---- Top momentum ----
  const momentum = await pool.query(`
    SELECT
      c.id,
      c.name,
      s.momentum_score
    FROM company_scores s
    JOIN companies c ON c.id = s.company_id
    ORDER BY s.momentum_score DESC
    LIMIT 10
  `);

  // ---- Most stable ----
  const stable = await pool.query(`
    SELECT
      c.id,
      c.name,
      s.stability_score
    FROM company_scores s
    JOIN companies c ON c.id = s.company_id
    ORDER BY s.stability_score DESC
    LIMIT 10
  `);

  // ---- Recently changed ----
  const recent = await pool.query(`
    SELECT DISTINCT
      c.id,
      c.name,
      cc.detected_at
    FROM company_changes cc
    JOIN companies c ON c.id = cc.company_id
    ORDER BY cc.detected_at DESC
    LIMIT 10
  `);

  return NextResponse.json({
    top_momentum: momentum.rows,
    most_stable: stable.rows,
    recently_changed: recent.rows,
  });
}
