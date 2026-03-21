import re
from urllib.parse import urlparse

URL_REGEX = r'(https?://[^\s]+)'

def extract_urls(text: str):
    return re.findall(URL_REGEX, text or "")

def get_domain(url: str):
    try:
        parsed = urlparse(url)
        return parsed.netloc.lower()
    except:
        return None