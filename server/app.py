from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.analyze import analyze_route
from routes.stream import stream_route
from routes.link_safety import link_safety_bp
from routes.report import report_bp



# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS (allow your frontend)
CORS(app, origins=["http://localhost:5174", "http://localhost:5173"])

# Optional: fix Google login popup warning
@app.after_request
def apply_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

@app.route("/")
def home():
    return jsonify({"message": "Healthy API from TARK!"})


# Register routes
app.register_blueprint(analyze_route)
app.register_blueprint(stream_route)
app.register_blueprint(link_safety_bp)
app.register_blueprint(report_bp)

if __name__ == "__main__":
    app.run(port=5000, debug=True)