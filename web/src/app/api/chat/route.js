import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req) {
  console.log("CHAT API HIT");

  const { question, companyId } = await req.json();

  console.log("QUESTION:", question);
  console.log("COMPANY ID:", companyId);

  if (!question) {
    return NextResponse.json({ error: "Question required" }, { status: 400 });
  }

  if (!companyId) {
    return NextResponse.json({
      answer: "Please ask a company-specific question from a company page."
    });
  }

  let context = "";

  try {
    // ---- Fetch company context ----
    const data = await pool.query(`
      SELECT
        c.name,
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
    `, [companyId]);

    if (data.rows.length === 0) {
      return NextResponse.json({
        answer: "No data found for this company."
      });
    }

    const row = data.rows[0];

    // ---- Normalize tags safely (JSONB / array / string) ----
    let tagsText = "";

    if (Array.isArray(row.tags)) {
      tagsText = row.tags.join(", ");
    } else if (row.tags && typeof row.tags === "object") {
      tagsText = Object.values(row.tags).join(", ");
    } else if (typeof row.tags === "string") {
      tagsText = row.tags;
    } else {
      tagsText = "";
    }

    const changes = await pool.query(`
      SELECT change_type, old_value, new_value, detected_at
      FROM company_changes
      WHERE company_id = $1
      ORDER BY detected_at DESC
      LIMIT 5
    `, [companyId]);


    context = `
    Company: ${row.name}
    Batch: ${row.batch}
    Stage: ${row.stage}
    Location: ${row.location}
    Tags: ${tagsText}

    Description:
    ${row.description}

    Scores:
    Momentum: ${row.momentum_score}
    Stability: ${row.stability_score}

    Recent Changes:
    ${changes.rows.map(
      c => `- ${c.change_type}: ${c.old_value} → ${c.new_value}`
    ).join("\n")}
    `;

    console.log("CONTEXT LENGTH:", context.length);

    // ---- Guard against weak context ----
    if (!context || context.length < 200) {
      return NextResponse.json({
        answer: "Not enough data available to answer this question."
      });
    }

  } catch (err) {
    console.error("DB / CONTEXT ERROR:", err);
    return NextResponse.json({
      answer: "Failed to load company data."
    });
  }

  // ---- Call local LLM ----
  try {
    const answer = await callPythonLLM(question, context);
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("LLM ERROR:", err);
    return NextResponse.json({
      answer: "LLM failed to generate a response."
    });
  }
}



// Helper: call Python LLM script

function callPythonLLM(question, context) {
  return new Promise((resolve, reject) => {

    
    const process = spawn("python", [
  "-m",
  "llm.chatbot",
  question,
  context
], {
  cwd: "C:/Users/mhqpe/Desktop/Internship(CourtClicks)/week5/yc_intelligence_v2"
});

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", data => {
      output += data.toString();
    });

    process.stderr.on("data", data => {
      errorOutput += data.toString();
    });

    process.on("close", () => {
      if (errorOutput) {
        console.error("PYTHON STDERR:", errorOutput);
      }
      resolve(output.trim());
    });

    process.on("error", reject);
  });
}
