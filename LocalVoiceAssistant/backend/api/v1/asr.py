"""
FastAPI router for ASR endpoints (/api/v1/asr).
"""

import base64
from fastapi import APIRouter
from backend.core.service_manager import service_manager
from backend.schemas.requests_responses import ASRRequest, ASRResponse
from backend.logger import log_event

router = APIRouter(prefix="/asr", tags=["Speech Recognition"])

@router.post("/transcribe", response_model=ASRResponse)
async def transcribe_audio(req: ASRRequest) -> ASRResponse:
    """
    Transcribes input audio payload into text string.
    """
    log_event("api", "Received POST /api/v1/asr/transcribe request")

    audio_bytes = b""
    if req.audio_base64:
        try:
            audio_bytes = base64.b64decode(req.audio_base64)
        except Exception:
            audio_bytes = b"invalid_mock_audio"

    asr_service = service_manager.get_service("asr")
    if not asr_service:
        from backend.services.asr.whisper import WhisperASRService
        asr_service = WhisperASRService()

    res = await asr_service.transcribe(audio_bytes=audio_bytes, language=req.language or "en")
    
    return ASRResponse(
        transcription=res.get("transcription", "Local mock transcription"),
        confidence=res.get("confidence", 0.99),
        language_detected=res.get("language", "en"),
        processing_time_ms=115.0,
        provider_used=res.get("provider_used", "whisper_mock")
    )
