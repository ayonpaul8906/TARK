# services/vision_service.py
# Image analysis — extracts text and scam signals from a screenshot/image.
# Uses call_llm_vision() which routes to GPT-4o (OpenAI) or Gemini vision.

from PIL import Image
from services.llm_provider import call_llm_vision


def analyze_image(image_path: str) -> str:
    image = Image.open(image_path)

    prompt = """
Extract all visible text from this image.

Then analyze if it is a scam message.

Return:
- Extracted text
- Scam indicators
"""
    return call_llm_vision(prompt, image)