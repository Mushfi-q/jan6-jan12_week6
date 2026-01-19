from transformers import pipeline

class LLMClient:
    def __init__(self):
        self.generator = pipeline(
            "text2text-generation",
            model="google/flan-t5-base",
            device=-1  # CPU
        )
        self.enabled = True

    def generate(self, prompt: str) -> str:
        outputs = self.generator(
            prompt,
            max_new_tokens=150,
            do_sample=False
        )
        return outputs[0]["generated_text"].strip()
