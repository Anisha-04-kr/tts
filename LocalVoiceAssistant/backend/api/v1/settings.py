"""
FastAPI router for runtime settings endpoints (/api/v1/settings).
"""

from typing import Dict, Any
from fastapi import APIRouter
from backend.config.settings import settings
from backend.schemas.requests_responses import SettingsUpdateRequest
from backend.logger import log_event

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
async def get_settings() -> Dict[str, Any]:
    """
    Returns configurable application settings.
    """
    log_event("api", "Received GET /api/v1/settings request")
    return {
        "log_level": settings.LOG_LEVEL,
        "default_sample_rate": settings.DEFAULT_SAMPLE_RATE,
        "enable_gpu": settings.ENABLE_GPU,
        "max_vram_gb": settings.MAX_VRAM_GB,
        "host": settings.HOST,
        "port": settings.PORT
    }

@router.post("")
async def update_settings(req: SettingsUpdateRequest) -> Dict[str, Any]:
    """
    Updates runtime application parameters.
    """
    log_event("api", f"Received POST /api/v1/settings request: {req.model_dump(exclude_none=True)}")
    if req.log_level:
        settings.LOG_LEVEL = req.log_level.upper()
    if req.default_sample_rate:
        settings.DEFAULT_SAMPLE_RATE = req.default_sample_rate
    if req.enable_gpu is not None:
        settings.ENABLE_GPU = req.enable_gpu

    return {
        "status": "updated",
        "settings": {
            "log_level": settings.LOG_LEVEL,
            "default_sample_rate": settings.DEFAULT_SAMPLE_RATE,
            "enable_gpu": settings.ENABLE_GPU
        }
    }
