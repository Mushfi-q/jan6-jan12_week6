import sys
from llm.client import LLMClient

# ---- Read inputs ----
question = sys.argv[1]
context = sys.argv[2]

print("CHATBOT INVOKED", file=sys.stderr)
print("QUESTION:", question, file=sys.stderr)
print("CONTEXT CHARS:", len(context), file=sys.stderr)

try:
    client = LLMClient()

    prompt = f"""
You are an intelligence assistant analyzing YC company data.

Context:
{context}

Question:
{question}

Answer clearly and concisely based ONLY on the context above.
"""

    answer = client.generate(prompt)

    #  THIS IS CRITICAL — SEND ANSWER TO STDOUT
    print(answer)

except Exception as e:
    print("LLM ERROR:", str(e), file=sys.stderr)
    print("Sorry, I could not generate an answer.")
