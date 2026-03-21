import hashlib
import json
from datetime import datetime

def generate_report(text, osint_data, psych_data, verdict):

    report = {
        "text": text,
        "osint": osint_data,
        "psychology": psych_data,
        "verdict": verdict,
        "timestamp": datetime.utcnow().isoformat()
    }

    return report

def generate_hash(report):

    report_string = json.dumps(report, sort_keys=True)
    
    hash_object = hashlib.sha256(report_string.encode())
    report_hash = hash_object.hexdigest()

    return report_hash