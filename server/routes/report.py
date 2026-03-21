from flask import Blueprint, request, jsonify, send_file
from services.report.report_service import generate_pdf, generate_gmail_link

report_bp = Blueprint("report", __name__)

@report_bp.route("/report-generate", methods=["POST"])
def report_generate():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    pdf_path = generate_pdf(data)
    gmail_link = generate_gmail_link(data)

    return jsonify({
        "pdf_download": f"/download-report",
        "gmail_link": gmail_link
    })


@report_bp.route("/download-report", methods=["GET"])
def download_report():
    return send_file("generated_reports/scam_report.pdf", as_attachment=True)