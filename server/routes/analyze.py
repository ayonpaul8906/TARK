from flask import Blueprint, request, jsonify
from services.agent_service import run_full_pipeline
from services.vision_service import analyze_image
from services.audio_service import process_audio

import os

analyze_route = Blueprint("analyze", __name__)

@analyze_route.route("/analyze", methods=["POST"])
def analyze():
    try:
        text = None

        # -----------------------------
        # 1. TEXT INPUT (JSON)
        # -----------------------------
        data = request.get_json(silent=True)
        if data and "text" in data:
            text = data.get("text")

        # -----------------------------
        # 2. FILE INPUT (IMAGE/AUDIO)
        # -----------------------------
        elif request.files:
            file = list(request.files.values())[0]

            os.makedirs("temp", exist_ok=True)
            file_path = os.path.join("temp", file.filename)
            file.save(file_path)

            if file.mimetype.startswith("image"):
                print("🖼 Processing image...")
                text = analyze_image(file_path)

            elif file.mimetype.startswith("audio"):
                print("🎧 Processing audio...")
                text = process_audio(file_path)

        # -----------------------------
        # 3. VALIDATION
        # -----------------------------
        if not text or not str(text).strip():
            return jsonify({
                "error": "No valid input provided (text/image/audio)",
                "debug": {
                    "content_type": request.content_type,
                    "files": list(request.files.keys()),
                    "json": data
                }
            }), 400

        print("📥 Extracted Text:", text)

        # -----------------------------
        # 4. RUN PIPELINE
        # -----------------------------
        result = run_full_pipeline(text)

        print("📤 Pipeline Result:", result)

        # -----------------------------
        # 5. SAFE EXTRACTION
        # -----------------------------
        analysis = result.get("analysis", {})

        osint = analysis.get("osint") or "No OSINT intelligence found"
        psychology = analysis.get("psychology") or "No psychological analysis"
        policy = analysis.get("policy") or "No policy violations"

        # -----------------------------
        # 6. FINAL RESPONSE (MATCH FRONTEND)
        # -----------------------------
        return jsonify({
            "input_text": text,

            "analysis": {
                "osint": osint,
                "psychology": psychology,
                "policy": policy
            },

            "verdict": result.get("verdict", ""),

            "hash": result.get("hash", ""),

            "blockchain": {
                "stored": result.get("blockchain", {}).get("stored", False),
                "tx_id": result.get("blockchain", {}).get("tx_id", "")
            }
        })

    except Exception as e:
        print("❌ ERROR in /analyze:", str(e))
        return jsonify({
            "error": str(e)
        }), 500