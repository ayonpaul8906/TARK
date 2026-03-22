import uuid
import time
import re

from services.vectordb.pinecone_service import upsert_vectors, query_vectors
from services.vectordb.json_service import load_json, chunk_json

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

from config import MODEL_NAME, GOOGLE_API_KEY

# -----------------------------
# CONFIG
# -----------------------------
genai.configure(api_key=GOOGLE_API_KEY)
model_llm = genai.GenerativeModel(MODEL_NAME)

EMBED_MODEL = "models/gemini-embedding-001"

# -----------------------------
# HARDCODED POLICY FALLBACK
# -----------------------------
POLICY_MAP = {
    "KYC Scam": {
        "title": "RBI KYC Guidelines",
        "category": "Banking Regulation",
        "violation": "Phishing / Credential Theft"
    },
    "OTP Scam": {
        "title": "CERT-In Advisory",
        "category": "Cyber Security",
        "violation": "Sensitive Information Theft"
    },
    "Phishing": {
        "title": "IT Act 2000 & CERT-In Guidelines",
        "category": "Cyber Law",
        "violation": "Impersonation & Data Theft"
    }
}


# -----------------------------
# EMBEDDINGS
# -----------------------------
def get_embeddings_batch(text_list):
    response = genai.embed_content(
        model=EMBED_MODEL,
        content=text_list,
        output_dimensionality=768,
        task_type="RETRIEVAL_DOCUMENT"
    )
    return response["embedding"]


# -----------------------------
# INGESTION (WITH METADATA)
# -----------------------------
def ingest_documents():
    print("Loading dataset...")
    texts = load_json()

    chunks = chunk_json(texts)  # must return structured dicts
    vectors = []

    batch_size = 50

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]

        try:
            embeddings = get_embeddings_batch([c["text"] for c in batch])

            for j, emb in enumerate(embeddings):
                chunk = batch[j]

                vectors.append({
                    "id": str(uuid.uuid4()),
                    "values": emb,
                    "metadata": {
                        "text": chunk["text"],
                        "source_title": chunk.get("title", "Unknown Source"),
                        "source_category": chunk.get("category", "General"),
                        "violation_type": chunk.get("violation", "Unknown")
                    }
                })

            time.sleep(20)

        except ResourceExhausted:
            print("Rate limited, retrying...")
            time.sleep(60)

    # Upload to Pinecone
    for i in range(0, len(vectors), 100):
        upsert_vectors(vectors[i:i + 100])

    print("Ingestion complete.")
    return len(vectors)


# -----------------------------
# RAG QUERY
# -----------------------------
def query_rag(text):
    query_embedding = genai.embed_content(
        model=EMBED_MODEL,
        content=text,
        output_dimensionality=768,
        task_type="RETRIEVAL_QUERY"
    )["embedding"]

    results = query_vectors(query_embedding, top_k=5)

    context_chunks = []
    top_label = None

    for i, match in enumerate(results.get("matches", []), start=1):
        metadata = match.get("metadata", {})

        if not top_label:
            top_label = metadata.get("violation_type")

        context_chunks.append(
            f"""--- Retrieved passage {i} ---
Source title: {metadata.get("source_title")}
Source category: {metadata.get("source_category")}
Violation type: {metadata.get("violation_type")}
Relevance score: {round(match.get("score", 0), 3)}

{metadata.get("text")}
"""
        )

    return context_chunks, top_label


# -----------------------------
# FALLBACK CONTEXT
# -----------------------------
def build_fallback_context(label):
    policy = POLICY_MAP.get(label or "Phishing")

    return f"""
--- Fallback Policy ---
Source title: {policy['title']}
Source category: {policy['category']}
Violation type: {policy['violation']}
"""


# -----------------------------
# MAIN ANALYSIS
# -----------------------------
def analyze_policy(text):

    context_chunks, detected_label = query_rag(text)

    # 🔥 HYBRID CONTEXT
    if context_chunks:
        context = "\n\n".join(context_chunks)

        # Add fallback ALSO (hybrid boost)
        context += "\n\n" + build_fallback_context(detected_label)

    else:
        context = build_fallback_context(detected_label)

    # -----------------------------
    # PROMPT
    # -----------------------------
    prompt = f"""
You are a cybersecurity policy analyst.

CONTEXT:
{context}

USER MESSAGE:
{text}

RULES:
- If scam → MUST include violation
- Use source titles from context
- If no strong match → use fallback policy

FORMAT:

Verdict: Valid OR Scam
Violation: (must not be NONE if scam)
Explanation: 2-4 sentences
"""

    response = model_llm.generate_content(prompt)
    output = response.text or ""

    return fix_output(output)


# -----------------------------
# OUTPUT FIXER
# -----------------------------
def fix_output(text):
    if not text:
        return text

    verdict_scam = bool(re.search(r"Verdict:\s*Scam", text, re.I))
    violation_none = bool(re.search(r"Violation:\s*NONE", text, re.I))

    if verdict_scam and violation_none:
        return re.sub(
            r"Violation:\s*NONE",
            "Violation: Phishing / Social Engineering (fallback applied)",
            text
        )

    return text