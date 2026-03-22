# report_service.py
import os
import re
from datetime import datetime, timezone
from html import escape
from urllib.parse import quote, urlencode

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

OUTPUT_DIR = "generated_reports"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CYBER_DOST_EMAIL = "cyberdost@mha.gov.in"


def normalize_report_payload(data: dict) -> dict:
    """Accept /analyze JSON shape or frontend AnalysisResult (camelCase)."""
    if not data:
        return {}
    ana = data.get("analysis")
    if isinstance(ana, dict) and ("osint" in ana or "policy" in ana):
        bc = data.get("blockchain") or {}
        return {
            "input_text": data.get("input_text", "") or "",
            "analysis": {
                "osint": ana.get("osint", "") or "",
                "psychology": ana.get("psychology", "") or "",
                "policy": ana.get("policy", "") or "",
            },
            "verdict": data.get("verdict", "") or "",
            "hash": data.get("hash", "") or "",
            "blockchain": {
                "stored": bool(bc.get("stored", False)),
                "tx_id": (bc.get("tx_id") or "") or "",
            },
        }
    return {
        "input_text": (data.get("inputText") or data.get("input_text") or "") or "",
        "analysis": {
            "osint": (data.get("osint", "") or ""),
            "psychology": (data.get("psychology", "") or ""),
            "policy": (data.get("policy", "") or ""),
        },
        "verdict": (data.get("verdict", "") or ""),
        "hash": (data.get("hash", "") or ""),
        "blockchain": {
            "stored": bool(data.get("blockchainStored", False)),
            "tx_id": (data.get("txId") or "") or "",
        },
    }


def _short_hash(h: str) -> str:
    if not h:
        return "N/A"
    return h[:12] + "…" if len(h) > 12 else h


def _extract_scam_type(verdict: str) -> str:
    m = re.search(r"Scam Type:\s*([^\n]+)", verdict, re.I)
    return (m.group(1).strip() if m else "Suspected cyber incident")[:120]


def build_official_subject_body(data: dict) -> tuple[str, str]:
    d = normalize_report_payload(data)
    analysis = d.get("analysis", {})
    bc = d.get("blockchain", {})

    case_ref = _short_hash(d.get("hash", ""))
    scam = _extract_scam_type(d.get("verdict", ""))
    utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")

    subject = f"Cyber Crime Complaint — {scam} — Ref {case_ref}"

    # 🔥 PROFESSIONAL + STRUCTURED BODY
    body = f"""Dear Sir/Madam,

I wish to formally report a suspected cyber fraud incident for your review and necessary action.

--- INCIDENT SUMMARY ---
• Type of Incident: {scam}
• Reference ID: {case_ref}
• Reported On (UTC): {utc}

--- DESCRIPTION OF INCIDENT ---
The following message/content was received and is suspected to be fraudulent:
{d.get("input_text", "").strip()[:400]}

--- ANALYSIS SUMMARY (TARK SYSTEM) ---
• Threat Assessment:
{d.get("verdict", "").splitlines()[0]}

• Key Risk Indicators:
- Social engineering / phishing indicators detected
- Request for sensitive information or action
- Pattern matches with known fraud activity

--- TECHNICAL EVIDENCE ---
• Blockchain Record: {"Yes" if bc.get("stored") else "No"}
• Transaction Reference: {bc.get("tx_id") or "N/A"}
• Case Hash: {case_ref}

A detailed technical report containing full analysis, OSINT intelligence, and behavioural indicators has been generated and is attached separately.

--- REQUEST FOR ACTION ---
I kindly request the Cyber Crime Cell to review this matter, take appropriate action, and advise on further steps if required.

Thank you for your time and consideration.

Yours faithfully,
Concerned Citizen
"""

    return subject, body


def _truncate_for_link(subject: str, body: str, max_url_len: int = 2000) -> tuple[str, str]:
    """Browsers may truncate long mailto/Gmail URLs; shorten body until URL fits."""
    suffix = "\n\n[... truncated for email link length limits; full text is in the TARK PDF ...]"
    s, b = subject, body
    for _ in range(60):
        trial = _gmail_compose_url_raw(s, b)
        if len(trial) <= max_url_len:
            return s, b
        if len(b) > len(suffix) + 300:
            b = b[: max(len(b) - 400, 300)].rstrip() + suffix
        elif len(s) > 60:
            s = s[:60].rstrip() + "…"
        else:
            b = (b[:200] + suffix) if len(b) > 200 else b + suffix
    return s, b[:200] + suffix


def _gmail_compose_url_raw(subject: str, body: str) -> str:
    """Gmail web compose: ordered params; `to` must be present for recipient."""
    params = [
        ("view", "cm"),
        ("fs", "1"),
        ("tf", "cm"),
        ("source", "mailto"),
        ("to", CYBER_DOST_EMAIL),
        ("su", subject),
        ("body", body),
    ]
    query = urlencode(params, quote_via=quote)
    return f"https://mail.google.com/mail/u/0/?{query}"


def _outlook_compose_url_raw(subject: str, body: str) -> str:
    params = [
        ("to", CYBER_DOST_EMAIL),
        ("subject", subject),
        ("body", body),
    ]
    query = urlencode(params, quote_via=quote)
    return f"https://outlook.live.com/mail/0/deeplink/compose?{query}"


def generate_pdf(data: dict):
    file_path = os.path.join(OUTPUT_DIR, "scam_report.pdf")

    d = normalize_report_payload(data)
    analysis = d.get("analysis", {})
    blockchain = d.get("blockchain", {})

    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()

    def P(text: str, style_key: str = "Normal") -> Paragraph:
        return Paragraph(escape(text or ""), styles[style_key])

    content = []

    content.append(P("Formal Cyber Incident Report", "Title"))
    content.append(P("TARK automated analysis — confidential working document", "Italic"))
    content.append(Spacer(1, 14))

    content.append(P("Document control", "Heading2"))
    content.append(P(f"Case reference: {d.get('hash', 'N/A')}"))
    content.append(P(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"))
    content.append(Spacer(1, 12))

    content.append(P("Executive summary", "Heading2"))
    content.append(P(
        "This report summarises findings from the TARK investigation pipeline "
        "(policy review, behavioural assessment, and OSINT) for the material described below. "
        "It is intended to support a formal submission to competent authorities."
    ))
    content.append(Spacer(1, 10))

    content.append(P("Assessment", "Heading2"))
    content.append(P(d.get("verdict", "N/A")))
    content.append(Spacer(1, 10))

    content.append(P("Reported content", "Heading2"))
    content.append(P(d.get("input_text", "")))
    content.append(Spacer(1, 10))

    content.append(P("Policy and compliance analysis", "Heading2"))
    content.append(P(analysis.get("policy", "")))
    content.append(Spacer(1, 10))

    content.append(P("Behavioural and psychological indicators", "Heading2"))
    content.append(P(analysis.get("psychology", "")))
    content.append(Spacer(1, 10))

    content.append(P("OSINT intelligence", "Heading2"))
    content.append(P(analysis.get("osint", "")))
    content.append(Spacer(1, 10))

    content.append(P("Blockchain attestation", "Heading2"))
    content.append(P(f"Record stored: {blockchain.get('stored')}"))
    content.append(P(f"Transaction or record ID: {blockchain.get('tx_id') or 'N/A'}"))
    content.append(Spacer(1, 12))

    content.append(P(
        "This document was generated by the TARK cyber threat analysis system. "
        "Recipients should verify facts independently where required.",
        "Italic",
    ))

    doc.build(content)

    return file_path


def generate_gmail_link(data: dict) -> str:
    subject, body = build_official_subject_body(data)
    subject, body = _truncate_for_link(subject, body)
    return _gmail_compose_url_raw(subject, body)


def generate_outlook_web_link(data: dict) -> str:
    subject, body = build_official_subject_body(data)
    subject, body = _truncate_for_link(subject, body)
    return _outlook_compose_url_raw(subject, body)


def build_mailto_uri(data: dict) -> str:
    """RFC 6068 mailto with subject/body query keys (not Gmail's `su`)."""
    subject, body = build_official_subject_body(data)
    subject, body = _truncate_for_link(subject, body)
    query = urlencode(
        {"subject": subject, "body": body},
        quote_via=quote,
    )
    return f"mailto:{CYBER_DOST_EMAIL}?{query}"
