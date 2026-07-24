"""
FastAPI router for GET /api/v1/status endpoint.
"""

from fastapi import APIRouter
from backend.config.settings import settings
from backend.config.runtime import runtime_state
from backend.core.gpu_manager import gpu_manager
from backend.schemas.requests_responses import StatusResponse
from backend.logger import log_event

router = APIRouter(prefix="/status", tags=["Status"])

@router.get("", response_model=StatusResponse)
async def get_status() -> StatusResponse:
    """
    Returns comprehensive system status, uptime, GPU configuration, active models, and service states.
    """
    log_event("api", "Received GET /api/v1/status request")
    snapshot = runtime_state.snapshot()
    gpu_data = gpu_manager.get_status_dict()

    return StatusResponse(
        status="ok",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        uptime_seconds=snapshot["uptime_seconds"],
        gpu=gpu_data,
        active_models=snapshot["active_models"],
        services=snapshot["services_status"]
    )
