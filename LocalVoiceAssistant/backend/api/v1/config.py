"""
FastAPI router for GET /api/v1/config endpoint.
"""

from fastapi import APIRouter
from backend.config.settings import settings
from backend.schemas.requests_responses import ConfigResponse
from backend.logger import log_event

router = APIRouter(prefix="/config", tags=["Configuration"])

@router.get("", response_model=ConfigResponse)
async def get_config() -> ConfigResponse:
    """
    Returns system static configuration settings.
    """
    log_event("api", "Received GET /api/v1/config request")
    return ConfigResponse(
        project_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        host=settings.HOST,
        port=settings.PORT,
        environment=settings.ENVIRONMENT,
        debug=settings.DEBUG,
        directories={
            "root": str(settings.ROOT_DIR),
            "models": str(settings.MODELS_DIR),
            "logs": str(settings.LOGS_DIR),
            "temp": str(settings.TEMP_DIR)
        },
        audio_settings={
            "sample_rate": settings.DEFAULT_SAMPLE_RATE,
            "channels": settings.DEFAULT_CHANNELS,
            "chunk_size": settings.DEFAULT_CHUNK_SIZE,
            "input_device_index": settings.DEFAULT_INPUT_DEVICE_INDEX,
            "output_device_index": settings.DEFAULT_OUTPUT_DEVICE_INDEX
        },
        gpu_settings={
            "enable_gpu": settings.ENABLE_GPU,
            "cuda_visible_devices": settings.CUDA_VISIBLE_DEVICES,
            "compute_type": settings.DEFAULT_COMPUTE_TYPE,
            "max_vram_gb": settings.MAX_VRAM_GB
        },
        model_defaults={
            "asr": settings.DEFAULT_ASR_MODEL,
            "llm": settings.DEFAULT_LLM_MODEL,
            "tts": settings.DEFAULT_TTS_MODEL
        }
    )
