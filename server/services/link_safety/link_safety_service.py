from services.link_safety.url_utils import extract_urls, get_domain
from services.link_safety.virustotal_service import check_virustotal


# 🔥 Intelligence Layer (for zero-day detection)
def intelligent_flags(domain: str, url: str):
    flags = []

    suspicious_terms = ["login", "verify", "account", "secure", "update", "bank"]

    # Detect sensitive-action intent
    if any(term in url.lower() for term in suspicious_terms):
        flags.append("Requests sensitive user action")

    # Detect brand impersonation
    known_brands = ["amazon", "google", "paytm", "sbi", "bank", "flipkart"]

    for brand in known_brands:
        if brand in domain and not domain.endswith(f"{brand}.com"):
            flags.append(f"Possible impersonation of {brand}")

    return flags


# 🔍 Main Analysis Function
def analyze_links(text: str):
    urls = extract_urls(text)
    results = []

    for url in urls:
        domain = get_domain(url)

        vt_result = check_virustotal(url)

        flags = []
        is_safe = True
        confidence = 0

        # 🔥 VirusTotal Layer
        if "error" not in vt_result:
            malicious = vt_result.get("malicious", 0)
            suspicious = vt_result.get("suspicious", 0)
            harmless = vt_result.get("harmless", 0)

            total = malicious + suspicious + harmless

            if malicious > 0:
                is_safe = False
                flags.append(f"{malicious} security engines flagged this URL as malicious")

            elif suspicious > 0:
                is_safe = False
                flags.append(f"{suspicious} engines marked this URL as suspicious")

            else:
                flags.append("No engines flagged this URL as malicious")

            # Confidence Score
            if total > 0:
                confidence = round(((malicious + suspicious) / total) * 100)

        else:
            is_safe = False
            flags.append("VirusTotal lookup failed")

        # 🔥 Intelligence Layer (VERY IMPORTANT — FIX)
        intel_flags = intelligent_flags(domain, url)

        if intel_flags:
            is_safe = False
            flags.extend(intel_flags)

        results.append({
            "url": url,
            "domain": domain,
            "is_safe": is_safe,
            "confidence": confidence,
            "flags": flags,
            "virustotal": vt_result
        })

    overall_safe = all(r["is_safe"] for r in results) if results else True

    return {
        "is_safe": overall_safe,
        "domain_info": results
    }