"""
FastAPI router for Model Registry endpoints (/api/v1/models).
"""

from typing import List, Optional
from fastapi import APIRouter, Query
from backend.registry.model_registry import model_registry
from backend.models.domain import ModelMetadata, ModelType
from backend.schemas.requests_responses import ModelSwitchRequest
from backend.logger import log_event

router = APIRouter(prefix="/models", tags=["Model Registry"])

@router.get("", response_model=List[ModelMetadata])
async def list_models(type: Optional[str] = Query(None, description="Optional filter by model type (asr, llm, tts)")) -> List[ModelMetadata]:
    """
    Returns list of discovered and registered local AI models.
    """
    log_event("api", f"Received GET /api/v1/models request (type filter: {type})")
    model_type_enum = ModelType(type.lower()) if type else None
    return model_registry.list_models(model_type=model_type_enum)

@router.post("/switch", response_model=ModelMetadata)
async def switch_model(req: ModelSwitchRequest) -> ModelMetadata:
    """
    Switches the active model for target service type (asr, llm, or tts).
    """
    log_event("api", f"Received POST /api/v1/models/switch (service: {req.service_type}, model: {req.model_name})")
    updated_model = model_registry.set_active_model(
        service_type=req.service_type,
        model_id=req.model_name,
        provider=req.provider
    )
    return updated_model
