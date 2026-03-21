from flask import Blueprint, request, jsonify
from services.link_safety.link_safety_service import analyze_links

link_safety_bp = Blueprint("link_safety", __name__)

@link_safety_bp.route("/link-safety-check", methods=["POST"])
def link_safety_check():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    result = analyze_links(data["text"])
    return jsonify(result)