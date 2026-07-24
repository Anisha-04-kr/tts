"""
FastAPI router for Audio Hardware endpoints (/api/v1/audio).
"""

from typing import List, Dict, Any
from fastapi import APIRouter
from backend.services.audio.service import AudioService
from backend.logger import log_event

router = APIRouter(prefix="/audio", tags=["Audio Subsystem"])
_audio_service = AudioService()

@router.get("/devices")
async def list_audio_devices() -> List[Dict[str, Any]]:
    """
    Enumerates host WASAPI / DirectSound audio hardware devices.
    """
    log_event("api", "Received GET /api/v1/audio/devices request")
    return _audio_service.list_devices()
