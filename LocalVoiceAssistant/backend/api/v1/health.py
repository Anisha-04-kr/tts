"""
FastAPI router for GET /api/v1/health endpoint.
"""

from fastapi import APIRouter
from backend.core.health_monitor import health_monitor
from backend.schemas.requests_responses import HealthResponse
from backend.logger import log_event

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """
    Returns system-wide health status across all backend components and services.
    """
    log_event("api", "Received GET /api/v1/health request")
    health_data = await health_monitor.check_health()
    return HealthResponse(
        status=health_data["status"],
        timestamp=health_data["timestamp"],
        services=health_data["services"]
    )
