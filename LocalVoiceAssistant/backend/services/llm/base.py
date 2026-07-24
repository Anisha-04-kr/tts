"""
Abstract Base Class interface for Large Language Model (LLM) services.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator, Optional

class BaseLLMService(ABC):
    """Abstract interface enforcing standardized lifecycle and text generation contracts for LLM providers."""

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize local LLM parameters or endpoint bindings."""
        ...

    @abstractmethod
    async def start(self) -> None:
        """Start LLM service execution loop."""
        ...

    @abstractmethod
    async def stop(self) -> None:
        """Stop LLM service gracefully."""
        ...

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Perform LLM provider health check."""
        ...

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str = "You are a local voice assistant.",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> Dict[str, Any]:
        """Generate text completion response."""
        ...

    @abstractmethod
    async def stream_tokens(
        self,
        prompt: str,
        system_prompt: str = "You are a local voice assistant.",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> AsyncGenerator[str, None]:
        """Stream generated text tokens incrementally."""
        ...
