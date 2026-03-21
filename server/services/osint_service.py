# services/osint_service.py
# OSINT agent — extracts scam pattern and cross-references with internet search.

from services.osint_web import search_google
from services.llm_provider import call_llm


# -----------------------------
# 1. EXTRACT SCAM PATTERN
# -----------------------------
def extract_pattern(text: str) -> str:
    prompt = f"""
Extract the core scam pattern.

Remove specific details.
Keep intent + structure.

Message:
{text}

Return one short line.
"""
    return call_llm(prompt).strip()


# -----------------------------
# 2. ANALYZE INTERNET MATCH
# -----------------------------
def analyze_osint_pattern(text: str) -> dict:
    pattern = extract_pattern(text)
    results = search_google(pattern)
    match_count = len(results)

    # Scoring logic
    if match_count >= 8:
        percentage = 95
    elif match_count >= 5:
        percentage = 85
    elif match_count >= 3:
        percentage = 70
    elif match_count >= 1:
        percentage = 50
    else:
        percentage = 20

    return {
        "pattern": pattern,
        "matches": results,
        "match_count": match_count,
        "similarity": percentage,
    }


# -----------------------------
# MAIN OSINT
# -----------------------------
def run_osint(text: str) -> str:
    data = analyze_osint_pattern(text)

    return f"""
OSINT Pattern Intelligence:

Detected Pattern:
{data['pattern']}

Internet Presence Score:
{data['similarity']}%

Matches Found:
{data['match_count']}

Top Evidence:
{data['matches'][:3] if data['matches'] else "No major reports found"}
"""


def refine_with_ai(pattern: str, results) -> str:
    prompt = f"""
Given this scam pattern:
{pattern}

And search results:
{results}

Are these actually scam-related?

Return:
- relevance score (0–90)
- short reasoning
"""
    return call_llm(prompt)