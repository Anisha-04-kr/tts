"""
Master API aggregator router mounting all v1 sub-routers under /api/v1.
"""

from fastapi import APIRouter
from backend.api.v1.health import router as health_router
from backend.api.v1.status import router as status_router
from backend.api.v1.config import router as config_router
from backend.api.v1.tts import router as tts_router
from backend.api.v1.llm import router as llm_router
from backend.api.v1.asr import router as asr_router
from backend.api.v1.models import router as models_router
from backend.api.v1.settings import router as settings_router
from backend.api.v1.audio import router as audio_router
from backend.api.v1.websocket import router as ws_router
from backend.api.v1.conversation import router as conversation_router
from backend.api.v1.logs import router as logs_router
from backend.api.v1.medical import router as medical_router

# Version 1 Master API Router
v1_router = APIRouter(prefix="/v1")
v1_router.include_router(health_router)
v1_router.include_router(status_router)
v1_router.include_router(config_router)
v1_router.include_router(tts_router)
v1_router.include_router(llm_router)
v1_router.include_router(asr_router)
v1_router.include_router(models_router)
v1_router.include_router(settings_router)
v1_router.include_router(audio_router)
v1_router.include_router(ws_router)
v1_router.include_router(conversation_router)
v1_router.include_router(logs_router)
v1_router.include_router(medical_router)

# Master API Router mounted under /api
api_router = APIRouter(prefix="/api")
api_router.include_router(v1_router)
