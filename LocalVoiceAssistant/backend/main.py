"""
Main FastAPI Application Entrypoint for Local AI Voice Assistant backend.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config.settings import settings
from backend.core.service_manager import service_manager
from backend.services.asr.whisper import WhisperASRService
from backend.services.llm.lmstudio import LMStudioLLMService
from backend.services.tts.fishspeech import FishSpeechTTSService
from backend.services.audio.service import AudioService
from backend.api.router import api_router
from backend.api.v1.health import router as health_router
from backend.api.v1.status import router as status_router
from backend.api.v1.config import router as config_router
from backend.logger import logger, log_event

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan Context Manager handling application startup and shutdown events gracefully.
    """
    log_event("lifecycle", "==================================================")
    log_event("lifecycle", f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    log_event("lifecycle", f"Host: {settings.HOST}:{settings.PORT} (Local-Only)")
    log_event("lifecycle", "==================================================")

    # Register default AI services with ServiceManager
    service_manager.register_service("asr", WhisperASRService(model_name=settings.DEFAULT_ASR_MODEL))
    service_manager.register_service("llm", LMStudioLLMService(model_name=settings.DEFAULT_LLM_MODEL))
    service_manager.register_service("tts", FishSpeechTTSService(model_name=settings.DEFAULT_TTS_MODEL))
    service_manager.register_service("audio", AudioService())

    # Start all registered services
    await service_manager.start_all()
    log_event("lifecycle", "Application initialization complete. Backend server ready.")

    yield

    # Shutdown Phase
    log_event("lifecycle", "Initiating backend application shutdown...")
    await service_manager.stop_all()
    log_event("lifecycle", "Backend shutdown sequence finished cleanly.")

# Create FastAPI Instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Local-only production-ready backend architecture for AI Voice Assistant on Windows.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Policy restricted strictly to localhost origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Master API Router (/api/v1/...)
app.include_router(api_router)

# Top-level direct endpoint aliases (/health, /status, /config)
app.include_router(health_router, prefix="")
app.include_router(status_router, prefix="")
app.include_router(config_router, prefix="")

@app.get("/")
async def root():
    """Root endpoint confirming backend is online."""
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"http://{settings.HOST}:{settings.PORT}/docs",
        "health": f"http://{settings.HOST}:{settings.PORT}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
