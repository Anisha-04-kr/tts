"""
vLLM service implementation wrapping local vLLM high-throughput engine.
"""

from typing import Dict, Any, AsyncGenerator
from backend.services.llm.base import BaseLLMService
from backend.clients.llm_client import LLMClient
from backend.config.settings import settings
from backend.logger import logger, log_event

class VLLMLLMService(BaseLLMService):
    """Local vLLM Service implementation."""

    def __init__(self, model_name: str = "vllm-mistral-7b-local") -> None:
        self.model_name = model_name
        self.client = LLMClient(endpoint=settings.LOCAL_VLLM_ENDPOINT)
        self.is_active = False
        log_event("vllm_llm", f"Instantiated VLLMLLMService (model: {self.model_name})")

    async def initialize(self) -> None:
        """Prepares vLLM engine binding."""
        log_event("vllm_llm", f"Initializing vLLM service for model '{self.model_name}'...")
        self.is_active = True

    async def start(self) -> None:
        """Starts vLLM service."""
        log_event("vllm_llm", "vLLM Service started.")

    async def stop(self) -> None:
        """Stops vLLM service."""
        log_event("vllm_llm", "vLLM Service stopped.")
        self.is_active = False

    async def health_check(self) -> Dict[str, Any]:
        """Performs vLLM health check."""
        return {
            "service_name": "vLLM LLM",
            "provider": "vllm",
            "model": self.model_name,
            "status": "healthy" if self.is_active else "stopped",
            "is_active": self.is_active
        }

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "You are a local voice assistant.",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> Dict[str, Any]:
        """Generates completion via vLLM client."""
        log_event("vllm_llm", f"Generating response via vLLM for prompt: '{prompt[:30]}...'")
        return await self.client.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            model=self.model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            provider="vllm"
        )

    async def stream_tokens(
        self,
        prompt: str,
        system_prompt: str = "You are a local voice assistant.",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> AsyncGenerator[str, None]:
        """Streams generated tokens via vLLM client."""
        log_event("vllm_llm", f"Streaming tokens via vLLM for prompt: '{prompt[:30]}...'")
        async for token in self.client.stream_tokens(
            prompt=prompt,
            system_prompt=system_prompt,
            model=self.model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            provider="vllm"
        ):
            yield token
