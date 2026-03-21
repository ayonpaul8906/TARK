# services/llm_provider.py
# ─────────────────────────────────────────────────────────────────────────────
# Unified LLM provider for TARK.
#
# Priority:
#   1. OPENAI_API_KEY present → use OpenAI (gpt-4o-mini by default)
#   2. GOOGLE_API_KEY present → use Gemini (gemini-2.5-flash-lite)
#   3. Neither                → raise a clear error at startup
#
# All services should import `call_llm` and `call_llm_vision` from here.
# ─────────────────────────────────────────────────────────────────────────────

import os
import pathlib
from dotenv import load_dotenv

# Resolve .env relative to this file: services/ -> server/ -> .env
_env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=False)  # override=False: don't clobber already-set vars

OPENAI_API_KEY  = os.getenv("OPENAI_API_KEY", "").strip()
GOOGLE_API_KEY  = os.getenv("GOOGLE_API_KEY", "").strip()


# ── Determine active provider ─────────────────────────────────────────────────
if OPENAI_API_KEY:
    ACTIVE_PROVIDER = "openai"
elif GOOGLE_API_KEY:
    ACTIVE_PROVIDER = "gemini"
else:
    raise EnvironmentError(
        "No LLM API key found. Set OPENAI_API_KEY or GOOGLE_API_KEY in server/.env"
    )

print(f"[LLM Provider] Active: {ACTIVE_PROVIDER.upper()}")

# ── Lazy-init clients (only import what we need) ───────────────────────────────
_openai_client  = None
_gemini_model   = None

def _get_openai():
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI

        # Auto-detect OpenRouter keys (sk-or-v1-*) or allow explicit override
        base_url = os.getenv("OPENAI_BASE_URL", "")
        if not base_url and OPENAI_API_KEY.startswith("sk-or-v1-"):
            base_url = "https://openrouter.ai/api/v1"

        kwargs = {"api_key": OPENAI_API_KEY}
        if base_url:
            kwargs["base_url"] = base_url
            print(f"[LLM Provider] OpenAI base_url → {base_url}")

        _openai_client = OpenAI(**kwargs)
    return _openai_client


def _get_gemini(model_name: str = "gemini-2.5-flash-lite"):
    """Return a GenerativeModel instance (cached per model name)."""
    import google.generativeai as genai
    genai.configure(api_key=GOOGLE_API_KEY)
    return genai.GenerativeModel(model_name)


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def call_llm(prompt: str, model: str | None = None) -> str:
    """
    Send a text prompt to the active LLM and return the response text.

    Args:
        prompt: The full prompt string.
        model:  Override the default model name (optional).
    """
    if ACTIVE_PROVIDER == "openai":
        client = _get_openai()
        model_name = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        response = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()

    else:  # gemini
        model_name = model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
        gem = _get_gemini(model_name)
        response = gem.generate_content(prompt)
        return response.text


def call_llm_vision(prompt: str, image) -> str:
    """
    Send a vision prompt (prompt + image) to the active provider.

    Args:
        prompt: Text part of the prompt.
        image:  For Gemini  → PIL.Image object.
                For OpenAI  → file path (str) or base64 data-URL (str).
    """
    if ACTIVE_PROVIDER == "openai":
        import base64, pathlib

        client = _get_openai()
        model_name = os.getenv("OPENAI_VISION_MODEL", "gpt-4o")

        # Accept PIL image or file path
        try:
            from PIL import Image as PILImage
            import io
            if isinstance(image, PILImage.Image):
                buf = io.BytesIO()
                image.save(buf, format="PNG")
                b64 = base64.b64encode(buf.getvalue()).decode()
                url = f"data:image/png;base64,{b64}"
            else:
                # Assume file path
                data = pathlib.Path(str(image)).read_bytes()
                b64 = base64.b64encode(data).decode()
                url = f"data:image/png;base64,{b64}"
        except Exception:
            # Fallback: treat image as a path string
            data = open(str(image), "rb").read()
            b64 = base64.b64encode(data).decode()
            url = f"data:image/png;base64,{b64}"

        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": url}},
                    ],
                }
            ],
            max_tokens=1024,
        )
        return response.choices[0].message.content.strip()

    else:  # gemini — native multi-modal
        gem = _get_gemini("gemini-2.5-flash-lite")
        response = gem.generate_content([prompt, image])
        return response.text
