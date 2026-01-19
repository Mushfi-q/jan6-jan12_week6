import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const runs = await pool.query(`
    SELECT
      id,
      started_at,
      ended_at,
      total_companies,
      new_companies,
      updated_companies,
      unchanged_companies,
      failed_companies,
      avg_time_per_company_ms
    FROM scrape_runs
    ORDER BY started_at DESC
    LIMIT 20
  `);

  return NextResponse.json(runs.rows);
}
