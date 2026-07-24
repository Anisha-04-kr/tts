"""
FastAPI router for Text-to-Speech endpoints (/api/v1/tts).
"""

import base64
from typing import Dict, Any, List
from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse, StreamingResponse
from backend.core.service_manager import service_manager
from backend.registry.model_registry import model_registry
from backend.models.domain import ModelType
from backend.schemas.requests_responses import TTSRequest, TTSResponse, TTSHealthResponse
from backend.logger import log_event

router = APIRouter(prefix="/tts", tags=["Text-To-Speech"])

def _get_tts_service():
    """Helper to retrieve active TTS service instance."""
    srv = service_manager.get_service("tts")
    if not srv:
        from backend.services.tts.fishspeech import FishSpeechTTSService
        srv = FishSpeechTTSService()
    return srv

@router.post("/synthesize")
async def synthesize_speech(req: TTSRequest, request: Request):
    """
    Synthesizes text into speech. Returns binary audio/wav by default, or JSON if requested.
    """
    log_event("api", f"Received POST /api/v1/tts/synthesize (text length: {len(req.text)}, speaker: '{req.speaker}')")
    
    tts_service = _get_tts_service()
    res = await tts_service.synthesize(
        text=req.text,
        speaker=req.speaker or "default",
        speed=req.speed or 1.0,
        pitch=req.pitch or 0.0,
        sample_rate=req.sample_rate or 24000,
        output_format=req.output_format or "wav"
    )

    # Handle offline status from vLLM-Omni or model unready
    if res.get("status") == "offline" or res.get("offline"):
        log_event("api", "TTS Synthesis request failed: Fish Speech server is unavailable.", level="warning")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "offline",
                "message": "Fish Speech server is unavailable."
            }
        )

    audio_bytes = res.get("audio_bytes", b"")

    # Determine response format (JSON vs direct binary audio/wav)
    accept_header = request.headers.get("accept", "")
    wants_json = req.return_json or "application/json" in accept_header

    if wants_json:
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return TTSResponse(
            audio_base64=audio_b64,
            format=res.get("format", "wav"),
            sample_rate=res.get("sample_rate", 24000),
            duration_seconds=res.get("duration_seconds", 0.0),
            synthesis_time_ms=res.get("synthesis_time_ms", 0.0),
            model_used=res.get("model_used", "fish-speech-s2-pro"),
            provider_used=res.get("provider_used", "vllm-omni"),
            metadata=res.get("metadata", {})
        )

    # Return direct binary audio/wav content by default
    return Response(
        content=audio_bytes,
        media_type=f"audio/{res.get('format', 'wav')}",
        headers={
            "X-Synthesis-Time-MS": str(res.get("synthesis_time_ms", 0.0)),
            "X-Audio-Duration-Sec": str(res.get("duration_seconds", 0.0)),
            "X-Sample-Rate": str(res.get("sample_rate", 24000)),
            "X-Model-Used": str(res.get("model_used", "fish-speech-s2-pro"))
        }
    )

@router.get("/health", response_model=TTSHealthResponse)
async def tts_health() -> TTSHealthResponse:
    """
    Dedicated TTS diagnostic verifying Fish Speech model status, vLLM-Omni connectivity, and GPU resources.
    """
    log_event("api", "Received GET /api/v1/tts/health request")
    tts_service = _get_tts_service()
    health_data = await tts_service.health_check()
    return TTSHealthResponse(**health_data)

@router.get("/models")
async def list_tts_models() -> List[Dict[str, Any]]:
    """
    Lists all registered TTS models in the local Model Registry.
    """
    log_event("api", "Received GET /api/v1/tts/models request")
    return model_registry.list_models(service_type="tts")

@router.post("/restart")
async def restart_tts_service() -> Dict[str, Any]:
    """
    Restarts the TTS service layer and re-establishes local vLLM-Omni bindings.
    """
    log_event("api", "Received POST /api/v1/tts/restart request")
    tts_service = _get_tts_service()
    await tts_service.restart_service()
    return {
        "status": "restarted",
        "message": "Fish Speech TTS service restarted successfully."
    }

@router.post("/stop")
async def stop_tts_service() -> Dict[str, Any]:
    """
    Gracefully stops the active TTS service.
    """
    log_event("api", "Received POST /api/v1/tts/stop request")
    tts_service = _get_tts_service()
    await tts_service.stop()
    return {
        "status": "stopped",
        "message": "Fish Speech TTS service stopped."
    }
