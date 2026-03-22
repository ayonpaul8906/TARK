import os
from dotenv import load_dotenv

load_dotenv()

# ── LLM keys (provider selected automatically in llm_provider.py) ─────────────
GOOGLE_API_KEY  = os.getenv("GOOGLE_API_KEY", "")
OPENAI_API_KEY  = os.getenv("OPENAI_API_KEY", "")

# Legacy alias kept for any code that still imports MODEL_NAME
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# ── Other services ────────────────────────────────────────────────────────────
SERP_API_KEY    = os.getenv("SERP_API_KEY", "")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_ENV    = os.getenv("PINECONE_ENV", "us-east-1")
PINECONE_INDEX  = os.getenv("PINECONE_INDEX", "tark-policy-index")