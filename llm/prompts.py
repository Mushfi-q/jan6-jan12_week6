def company_summary_prompt(data: dict) -> str:
    return f"""
You are given structured startup data.

Rules:
- Do NOT invent facts
- Use ONLY provided data
- If something is missing, say "not specified"

Data:
Name: {data.get("name")}
Batch: {data.get("batch")}
Stage: {data.get("stage")}
Location: {data.get("location")}
Tags: {", ".join(data.get("tags", []))}
Description: {data.get("description")}

Task:
Write a concise 3–4 sentence company summary.
"""


def score_explanation_prompt(data: dict) -> str:
    return f"""
You are given analytics scores for a startup.

Data:
Momentum score: {data.get("momentum_score")}
Stability score: {data.get("stability_score")}
Recent changes: {data.get("change_count")}

Task:
Explain in simple terms what these scores indicate.
"""
