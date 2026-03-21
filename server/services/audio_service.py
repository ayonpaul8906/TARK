# services/audio_service.py
# Audio analysis — transcribes via Whisper, then structures with the active LLM.

import whisper
from services.llm_provider import call_llm

# Whisper is always local — independent of LLM provider
_whisper_model = None

def _get_whisper():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model("base")
    return _whisper_model


def transcribe_audio(path: str) -> str:
    result = _get_whisper().transcribe(path)
    return result["text"]


def split_speakers(text: str) -> str:
    prompt = f"""
Split this conversation into:

[SCAMMER]
[USER]

{text}
"""
    return call_llm(prompt)


def process_audio(path: str) -> str:
    transcript = transcribe_audio(path)
    structured  = split_speakers(transcript)
    return structured