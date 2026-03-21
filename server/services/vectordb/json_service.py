import os
import json


def load_json(folder_path="rag_docs"):
    data = []

    for file in os.listdir(folder_path):
        if file.endswith(".json"):
            file_path = os.path.join(folder_path, file)

            with open(file_path, "r", encoding="utf-8") as f:
                json_data = json.load(f)

                # If it's a list of objects
                if isinstance(json_data, list):
                    data.extend(json_data)
                else:
                    data.append(json_data)

    return data


def chunk_json(data, chunk_size=500, overlap=100):
    """
    Converts structured JSON into meaningful chunks.
    """

    chunks = []

    for item in data:
        # Combine structured fields into one text
        text = ""

        if isinstance(item, dict):
            title = item.get("title", "")
            category = item.get("category", "")
            content = item.get("content", "")

            text = f"Title: {title}\nCategory: {category}\nContent: {content}"

        else:
            text = str(item)

        text = text.replace("\n", " ").strip()

        # Apply same chunking logic
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap

    return chunks