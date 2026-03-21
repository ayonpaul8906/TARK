from services.vectordb.rag_service import ingest_documents

if __name__ == "__main__":
    count = ingest_documents()
    print(f"Uploaded {count} chunks successfully")