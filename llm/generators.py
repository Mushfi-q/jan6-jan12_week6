from llm.client import LLMClient
from llm.prompts import (
    company_summary_prompt,
    score_explanation_prompt,
)

client = LLMClient()


def generate_company_summary(company_data):
    prompt = company_summary_prompt(company_data)
    return client.generate(prompt)


def generate_score_explanation(score_data):
    prompt = score_explanation_prompt(score_data)
    return client.generate(prompt)
