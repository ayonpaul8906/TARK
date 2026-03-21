from config import GOOGLE_API_KEY

# Core Services
from services.osint_service import run_osint
from services.psychology_service import analyze_psychology
from services.judge_service import generate_verdict

from services.report_service import generate_report, generate_hash
from services.algorand.algorand_service import store_hash_on_chain
from services.vectordb.rag_service import analyze_policy


# -----------------------------
# MAIN PIPELINE
# -----------------------------
def run_full_pipeline(text: str):
    """
    Runs the complete scam detection pipeline
    """

    # -----------------------------
    # Step 1: OSINT Analysis
    # -----------------------------
    osint_result = run_osint(text)

    # -----------------------------
    # Step 2: Psychological Analysis
    # -----------------------------
    psych_result = analyze_psychology(text)

    # -----------------------------
    # Step 3: Policy Check (RAG)
    # -----------------------------
    policy_result = analyze_policy(text)

    # Combine OSINT + Policy for stronger reasoning
    combined_intel = {
    "osint": osint_result,
    "policy": policy_result
}

    # -----------------------------
    # Step 4: Final Verdict (Judge)
    # -----------------------------
    verdict = generate_verdict(
    f"""
        OSINT:
        {osint_result}

        POLICY:
        {policy_result}
        """,
            psych_result,
            text
        )

    # -----------------------------
    # Step 5: Generate Report
    # -----------------------------
    report = generate_report(
    text,
    {
        "osint": osint_result,
        "policy": policy_result
    },
    psych_result,
    verdict
)

    # -----------------------------
    # Step 6: Generate Hash
    # -----------------------------
    report_hash = generate_hash(report)

    # -----------------------------
    # Step 7: Store on Algorand (only if HIGH risk)
    # -----------------------------
    tx_id = None
    if "HIGH" in verdict.upper():
        try:
            tx_id = store_hash_on_chain(report_hash)
        except Exception as e:
            print(f"[Algorand Error]: {e}")

    # -----------------------------
    # Final Response
    # -----------------------------
    return {
    "input_text": text,

    "analysis": {
        "osint": osint_result,
        "psychology": psych_result,
        "policy": policy_result
    },

    "verdict": verdict,

    "blockchain": {
        "stored": tx_id is not None,
        "tx_id": tx_id
    },

    "hash": report_hash
}