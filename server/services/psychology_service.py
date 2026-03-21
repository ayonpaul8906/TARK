# services/psychology_service.py
# Psychological / behavioural manipulation analysis via the active LLM provider.

from services.llm_provider import call_llm


def analyze_psychology(text: str) -> str:
    prompt = f"""
You are a behavioral analyst specializing in scam detection.

Analyze the message for psychological manipulation techniques.

Detect:
- Urgency (time pressure)
- Authority pressure (police, govt, officials)
- Fear tactics (threats, penalties)
- Reward traps (lottery, prize)
- Emotional triggers

Return in structured format:
- Techniques detected
- Explanation
- Manipulation severity (LOW/MEDIUM/HIGH)

Message:
{text}
"""
    return call_llm(prompt)