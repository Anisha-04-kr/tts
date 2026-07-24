"""
FastAPI router for LLM endpoints (/api/v1/llm).
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from backend.core.service_manager import service_manager
from backend.schemas.requests_responses import LLMRequest, LLMResponse
from backend.logger import log_event

router = APIRouter(prefix="/llm", tags=["Language Model"])

@router.post("/generate", response_model=LLMResponse)
async def generate_text(req: LLMRequest) -> LLMResponse:
    """
    Generates text response from prompt using active local LLM engine.
    """
    log_event("api", f"Received POST /api/v1/llm/generate prompt: '{req.prompt[:30]}...'")

    llm_service = service_manager.get_service("llm")
    if not llm_service:
        from backend.services.llm.lmstudio import LMStudioLLMService
        llm_service = LMStudioLLMService()

    res = await llm_service.generate(
        prompt=req.prompt,
        system_prompt=req.system_prompt or "You are a local voice assistant.",
        temperature=req.temperature or 0.7,
        max_tokens=req.max_tokens or 256
    )
    return LLMResponse(**res)

@router.post("/stream")
async def stream_tokens(req: LLMRequest):
    """
    Streams text completion tokens incrementally using Server-Sent Events (SSE) stream format.
    """
    log_event("api", f"Received POST /api/v1/llm/stream prompt: '{req.prompt[:30]}...'")

    llm_service = service_manager.get_service("llm")
    if not llm_service:
        from backend.services.llm.lmstudio import LMStudioLLMService
        llm_service = LMStudioLLMService()

    async def token_generator():
        async for token in llm_service.stream_tokens(
            prompt=req.prompt,
            system_prompt=req.system_prompt or "You are a local voice assistant.",
            temperature=req.temperature or 0.7,
            max_tokens=req.max_tokens or 256
        ):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")
