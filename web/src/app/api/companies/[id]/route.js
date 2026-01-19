import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  
  const params = await context.params;
  const companyId = Number(params.id);

  if (!companyId || isNaN(companyId)) {
    return NextResponse.json(
      { error: "Invalid company id" },
      { status: 400 }
    );
  }

  const company = await pool.query(
    `
    SELECT
      c.id,
      c.name,
      c.domain,
      cs.batch,
      cs.stage,
      cs.location,
      cs.description,
      cs.tags,
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
    WHERE c.id = $1
    `,
    [companyId]
  );

  if (company.rows.length === 0) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404 }
    );
  }

  const llm = await pool.query(
    `
    SELECT content
    FROM company_llm_insights
    WHERE company_id = $1
      AND insight_type = 'SUMMARY'
    ORDER BY generated_at DESC
    LIMIT 1
    `,
    [companyId]
  );

  return NextResponse.json({
    ...company.rows[0],
    llm_summary: llm.rows[0]?.content || null,
  });
}
