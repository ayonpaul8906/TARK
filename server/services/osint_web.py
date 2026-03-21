from serpapi import GoogleSearch
from config import SERP_API_KEY


def search_google(pattern):
    params = {
        "engine": "google",
        "q": pattern + " scam fraud warning",
        "api_key": SERP_API_KEY,
        "num": 10
    }

    search = GoogleSearch(params)
    results = search.get_dict()

    snippets = []

    if "organic_results" in results:
        for res in results["organic_results"]:
            title = res.get("title", "")
            snippet = res.get("snippet", "")
            snippets.append(f"{title} - {snippet}")

    return snippets