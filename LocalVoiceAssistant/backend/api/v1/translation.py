"""
FastAPI router for Translation endpoints (/api/v1/translation).
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from deep_translator import GoogleTranslator
from backend.logger import log_event

router = APIRouter(prefix="/translation", tags=["Translation"])

LANGUAGE_CODE_MAP = {
    "en": "en",
    "en-us": "en",
    "english": "en",
    "english (us)": "en",
    "ta": "ta",
    "ta-in": "ta",
    "tamil": "ta",
    "tamil (regional)": "ta",
    "hi": "hi",
    "hi-in": "hi",
    "hindi": "hi",
    "hindi (regional)": "hi",
    "te": "te",
    "te-in": "te",
    "telugu": "te",
    "telugu (regional)": "te",
    "kn": "kn",
    "kn-in": "kn",
    "kannada": "kn",
    "kannada (regional)": "kn",
    "ml": "ml",
    "ml-in": "ml",
    "malayalam": "ml",
    "malayalam (regional)": "ml",
    "mr": "mr",
    "mr-in": "mr",
    "marathi": "mr",
    "marathi (regional)": "mr",
    "bn": "bn",
    "bn-in": "bn",
    "bengali": "bn",
    "bengali (regional)": "bn",
    "gu": "gu",
    "gu-in": "gu",
    "gujarati": "gu",
    "gujarati (regional)": "gu",
    "pa": "pa",
    "pa-in": "pa",
    "punjabi": "pa",
    "punjabi (regional)": "pa",
    "or": "or",
    "or-in": "or",
    "odia": "or",
    "odia (regional)": "or",
    "ur": "ur",
    "ur-in": "ur",
    "ur-pk": "ur",
    "urdu": "ur",
    "urdu (regional)": "ur",
    "as": "as",
    "as-in": "as",
    "assamese": "as",
    "assamese (regional)": "as",
    "es": "es",
    "es-es": "es",
    "spanish": "es",
    "spanish (medical)": "es",
    "fr": "fr",
    "fr-fr": "fr",
    "french": "fr",
    "french (clinical)": "fr",
    "de": "de",
    "de-de": "de",
    "german": "de",
    "zh": "zh-CN",
    "zh-cn": "zh-CN",
    "mandarin": "zh-CN",
    "chinese": "zh-CN",
    "ja": "ja",
    "ja-jp": "ja",
    "japanese": "ja",
    "ko": "ko",
    "ko-kr": "ko",
    "korean": "ko",
    "ar": "ar",
    "ar-sa": "ar",
    "arabic": "ar",
    "arabic (standard)": "ar",
    "ru": "ru",
    "ru-ru": "ru",
    "russian": "ru",
    "pt": "pt",
    "pt-pt": "pt",
    "portuguese": "pt",
    "it": "it",
    "it-it": "it",
    "italian": "it",
    "nl": "nl",
    "nl-nl": "nl",
    "dutch": "nl",
}


class TranslationRequest(BaseModel):
    text: str = Field(..., description="Source text to translate")
    source_language: Optional[str] = Field(default="auto", description="Source language name or code")
    target_language: str = Field(default="es", description="Target language name or code")

class TranslationResponse(BaseModel):
    status: str = Field(default="success")
    original_text: str
    translated_text: str
    source_language: str
    target_language: str

def normalize_lang_code(lang_str: str) -> str:
    if not lang_str:
        return "auto"
    cleaned = lang_str.lower().strip()
    if cleaned in LANGUAGE_CODE_MAP:
        return LANGUAGE_CODE_MAP[cleaned]
    # Extract primary language subtag (e.g. "ta-IN" -> "ta")
    primary = cleaned.split("-")[0].split("_")[0].split(" ")[0]
    if primary in LANGUAGE_CODE_MAP:
        return LANGUAGE_CODE_MAP[primary]
    # Check substring matches
    for key, code in LANGUAGE_CODE_MAP.items():
        if key in cleaned or cleaned in key:
            return code
    return primary if len(primary) == 2 else "auto"


@router.post("/translate", response_model=TranslationResponse)
async def translate_text(req: TranslationRequest):
    """
    Translates input text from source language to target language.
    Preserves medical terminology and format.
    """
    log_event("api", f"Received POST /api/v1/translation/translate request (src: {req.source_language}, tgt: {req.target_language})")

    if not req.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Input text cannot be empty.")

    source_code = normalize_lang_code(req.source_language or "auto")
    target_code = normalize_lang_code(req.target_language or "es")

    try:
        translator = GoogleTranslator(source=source_code, target=target_code)
        translated_result = translator.translate(req.text.strip())

        return TranslationResponse(
            status="success",
            original_text=req.text,
            translated_text=translated_result or req.text,
            source_language=source_code,
            target_language=target_code
        )
    except Exception as err:
        log_event("api", f"Translation service error: {err}", level="error")
        # Return clean original text as fallback if translation service is unavailable
        return TranslationResponse(
            status="fallback",
            original_text=req.text,
            translated_text=req.text,
            source_language=source_code,
            target_language=target_code
        )

