# services/judge_service.py
# Final verdict agent — synthesises OSINT + psychology into a calibrated ruling.

from services.llm_provider import call_llm


def generate_verdict(osint_data: str, psych_data: str, original_text: str) -> str:
    prompt = f"""
You are a senior cybercrime analyst.

Your job is to assess scam likelihood with CALIBRATED confidence — not overconfidence.

Rules for confidence scoring:
- NEVER give 100% confidence
- HIGH confidence = 75–90%
- MEDIUM confidence = 50–74%
- LOW confidence = 20–49%
- If evidence is partial or heuristic → reduce confidence
- Only increase confidence when multiple independent signals agree (OSINT + psychology + clear scam pattern)

Inputs:

OSINT Findings:
{osint_data}

Psychological Analysis:
{psych_data}

Message:
{original_text}

Return STRICTLY in this format:

Threat Level: LOW / MEDIUM / HIGH
Scam Type: (if identifiable)
Confidence: (number between 20-90%)
Reasoning: short explanation (1-2 lines)

Important:
- Be slightly conservative
- Avoid exaggeration
- Real-world analysts are rarely 100% certain
"""
    return call_llm(prompt)