# services/llm_service.py
# Generic text analysis via the active LLM provider.

from services.llm_provider import call_llm


def analyze_text(text: str) -> str:
    prompt = f"""
You are a cybersecurity investigator.

Analyze the following message and determine if it may be a scam.

Return:
1. Scam likelihood
2. Possible scam type
3. Key suspicious signals

Message:
{text}
"""
    return call_llm(prompt)