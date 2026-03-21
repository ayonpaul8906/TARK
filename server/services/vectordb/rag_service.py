from services.vectordb.pinecone_service import upsert_vectors, query_vectors
# from services.vectordb.pdf_service import load_pdfs, chunk_text
from services.vectordb.json_service import load_json, chunk_json
from google.api_core.exceptions import ResourceExhausted
import uuid
import time 

import google.generativeai as genai
from config import MODEL_NAME, GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)
model_llm = genai.GenerativeModel(MODEL_NAME)

# -----------------------------
# 1. FIXED EMBEDDING FUNCTION
# -----------------------------
def get_embeddings_batch(text_list):
    """Takes a LIST of strings and gets embeddings for all of them in one API call."""
    response = genai.embed_content(
        model="models/gemini-embedding-001", # Added models/ prefix
        content=text_list,                   # Accepts a list of strings
        output_dimensionality=768,           # FOR PINECONE MATCH
        task_type="RETRIEVAL_DOCUMENT"
    )
    return response["embedding"]


# -----------------------------
# 2. FIXED INGESTION (WITH BATCHING & LOGS)
# -----------------------------
def ingest_documents():
    print("1. Loading JSON documents...")
    texts = load_json()
    print(f"--> Loaded {len(texts)} records.")

    vectors = []

    # Convert ALL JSON → chunks once
    all_chunks = chunk_json(texts)
    print(f"--> Total chunks created: {len(all_chunks)}")

    batch_size = 50

    for j in range(0, len(all_chunks), batch_size):
        chunk_batch = all_chunks[j : j + batch_size]
        print(f"--> Embedding chunks {j} to {j + len(chunk_batch)}...")

        success = False
        retries = 0
        max_retries = 5

        while not success and retries < max_retries:
            try:
                embeddings_batch = get_embeddings_batch(chunk_batch)

                for idx, embedding in enumerate(embeddings_batch):
                    vectors.append({
                        "id": str(uuid.uuid4()),
                        "values": embedding,
                        "metadata": {
                            "text": chunk_batch[idx]
                        }
                    })

                success = True
                print("   ✅ Batch success. Sleeping 20s...")
                time.sleep(20)

            except ResourceExhausted:
                retries += 1
                print(f"   ⚠️ Rate limit. Waiting 60s... ({retries})")
                time.sleep(60)

            except Exception as e:
                print(f"   ❌ Error: {e}")
                break

    # Pinecone upsert
    print(f"\n3. Upserting {len(vectors)} vectors...")

    pinecone_batch_size = 100

    for i in range(0, len(vectors), pinecone_batch_size):
        v_batch = vectors[i : i + pinecone_batch_size]
        print(f"--> Upserting {i} to {i + len(v_batch)}")
        upsert_vectors(v_batch)

    print("\n✅ Ingestion Complete!")
    return len(vectors)



def query_rag(text):

    query_embedding = genai.embed_content(
        # Query and document embeddings must come from the same model family.
        model="models/gemini-embedding-001",
        content=text,
        output_dimensionality=768,
        task_type="RETRIEVAL_QUERY"
    )["embedding"]

    results = query_vectors(query_embedding)

    context_chunks = []
    for match in results.get("matches", []):
        metadata = match.get("metadata", {}) if isinstance(match, dict) else {}
        text_chunk = metadata.get("text")
        if text_chunk:
            context_chunks.append(text_chunk)

    context = "\n".join(context_chunks)

    return context


def analyze_policy(text):

    context = query_rag(text)

    prompt = f"""
You are a legal cybersecurity expert.

Use the official rules below to evaluate the message.

Rules:
{context}

Message:
{text}

Return STRICTLY:

Verdict: (Valid / Scam)
Violation: (rule broken or NONE)
Explanation: (short reasoning)
"""

    response = model_llm.generate_content(prompt)

    return response.text