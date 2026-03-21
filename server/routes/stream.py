from flask import Blueprint, Response, request
import json
import time

from services.osint_service import run_osint
from services.psychology_service import analyze_psychology
from services.judge_service import generate_verdict

stream_route = Blueprint("stream", __name__)

def event_stream(text):

    # Step 1 — OSINT
    yield f"data: {json.dumps({'step': 'OSINT', 'message': 'Scanning entities...'})}\n\n"
    time.sleep(1)

    osint_result = run_osint(text)

    yield f"data: {json.dumps({'step': 'OSINT_RESULT', 'data': osint_result})}\n\n"

    # Step 2 — Psychology
    yield f"data: {json.dumps({'step': 'PSYCHO', 'message': 'Analyzing manipulation...'})}\n\n"
    time.sleep(1)

    psych_result = analyze_psychology(text)

    yield f"data: {json.dumps({'step': 'PSYCHO_RESULT', 'data': psych_result})}\n\n"

    # Step 3 — Judge
    yield f"data: {json.dumps({'step': 'JUDGE', 'message': 'Generating verdict...'})}\n\n"
    time.sleep(1)

    verdict = generate_verdict(osint_result, psych_result, text)

    yield f"data: {json.dumps({'step': 'FINAL', 'data': verdict})}\n\n"


@stream_route.route("/stream", methods=["POST"])
def stream():

    data = request.json
    text = data.get("text")

    return Response(
        event_stream(text),
        mimetype="text/event-stream"
    )