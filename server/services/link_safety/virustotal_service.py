import requests
import time
import os

VT_API_KEY = os.getenv("VT_API_KEY")  
BASE_URL = "https://www.virustotal.com/api/v3"


def check_virustotal(url: str):
    headers = {"x-apikey": VT_API_KEY}

    try:
        # Step 1: Submit URL
        res = requests.post(
            f"{BASE_URL}/urls",
            headers=headers,
            data={"url": url},
        )
        res.raise_for_status()

        analysis_id = res.json()["data"]["id"]

        # Step 2: Fetch analysis result (small wait required)
        time.sleep(2)

        result = requests.get(
            f"{BASE_URL}/analyses/{analysis_id}",
            headers=headers,
        ).json()

        stats = result["data"]["attributes"]["stats"]

        return {
            "malicious": stats.get("malicious", 0),
            "suspicious": stats.get("suspicious", 0),
            "harmless": stats.get("harmless", 0),
        }

    except Exception as e:
        return {"error": str(e)}