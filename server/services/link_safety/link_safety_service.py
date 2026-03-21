import requests
from services.link_safety.url_utils import extract_urls, get_domain

# Optional: add your API keys here
GOOGLE_SAFE_BROWSING_API_KEY = None  # add later if needed

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "update", "secure", "bank", "otp", "account"
]

def basic_heuristics(domain: str, url: str):
    risk_flags = []

    if "@" in url:
        risk_flags.append("URL contains '@' (possible masking)")

    if "-" in domain:
        risk_flags.append("Hyphenated domain (common in phishing)")

    if any(word in url.lower() for word in SUSPICIOUS_KEYWORDS):
        risk_flags.append("Contains sensitive keywords")

    if len(domain) > 30:
        risk_flags.append("Unusually long domain")

    return risk_flags


def check_google_safe_browsing(url: str):
    if not GOOGLE_SAFE_BROWSING_API_KEY:
        return None

    endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_SAFE_BROWSING_API_KEY}"

    payload = {
        "client": {"clientId": "tark", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }

    try:
        res = requests.post(endpoint, json=payload)
        return res.json()
    except:
        return None


def analyze_links(text: str):
    urls = extract_urls(text)

    results = []

    for url in urls:
        domain = get_domain(url)
        flags = basic_heuristics(domain, url)

        google_result = check_google_safe_browsing(url)

        is_safe = True

        if flags:
            is_safe = False

        if google_result and "matches" in google_result:
            is_safe = False
            flags.append("Flagged by Google Safe Browsing")

        results.append({
            "url": url,
            "domain": domain,
            "is_safe": is_safe,
            "flags": flags
        })

    overall_safe = all(r["is_safe"] for r in results) if results else True

    return {
        "is_safe": overall_safe,
        "domain_info": results
    }