from pinecone import Pinecone
import os
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX"))


def upsert_vectors(vectors):
    index.upsert(vectors=vectors)


def query_vectors(vector, top_k=3):
    return index.query(vector=vector, top_k=top_k, include_metadata=True)