"""
LM Studio LLM service implementation wrapping local LM Studio inference engine.
"""

from typing import Dict, Any, AsyncGenerator
from backend.services.llm.base import BaseLLMService
from backend.clients.llm_client import LLMClient
from backend.logger import logger, log_event

class LMStudioLLMService(BaseLLMService):
    """Local LM Studio LLM Service implementation."""

    def __init__(self, model_name: str = "llama3-8b-local") -> None:
        self.model_name = model_name
        self.client = LLMClient()
        self.is_active = False
        log_event("lmstudio_llm", f"Instantiated LMStudioLLMService (model: {self.model_name})")

    async def initialize(self) -> None:
        """Prepares LM Studio client binding."""
        log_event("lmstudio_llm", f"Initializing LM Studio service for model '{self.model_name}'...")
        self.is_active = True

    async def start(self) -> None:
        """Starts LM Studio service."""
        log_event("lmstudio_llm", "LM Studio LLM Service started.")

    async def stop(self) -> None:
        """Stops LM Studio service."""
        log_event("lmstudio_llm", "LM Studio LLM Service stopped.")
        self.is_active = False

    async def health_check(self) -> Dict[str, Any]:
        """Performs LM Studio health check."""
        return {
            "service_name": "LM Studio LLM",
            "provider": "lmstudio",
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
        """Generates completion via LM Studio client."""
        log_event("lmstudio_llm", f"Generating LLM response for prompt: '{prompt[:30]}...'")
        return await self.client.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            model=self.model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            provider="lmstudio"
        )

    async def stream_tokens(
        self,
        prompt: str,
        system_prompt: str = "You are a local voice assistant.",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> AsyncGenerator[str, None]:
        """Streams generated tokens via LM Studio client."""
        log_event("lmstudio_llm", f"Streaming LLM tokens for prompt: '{prompt[:30]}...'")
        async for token in self.client.stream_tokens(
            prompt=prompt,
            system_prompt=system_prompt,
            model=self.model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            provider="lmstudio"
        ):
            yield token
