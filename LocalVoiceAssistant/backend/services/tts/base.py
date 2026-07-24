"""
Abstract Base Class interface for Text-to-Speech (TTS) services.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator, Optional

class BaseTTSService(ABC):
    """Abstract interface enforcing standardized lifecycle and speech synthesis contracts for TTS providers."""

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize local TTS model weights or server bindings."""
        ...

    @abstractmethod
    async def start(self) -> None:
        """Start TTS service."""
        ...

    @abstractmethod
    async def stop(self) -> None:
        """Stop TTS service gracefully."""
        ...

    @abstractmethod
    async def restart_service(self) -> None:
        """Restart TTS service and rebind client connections."""
        ...

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Perform detailed TTS provider health diagnostic."""
        ...

    @abstractmethod
    async def synthesize(
        self,
        text: str,
        speaker: str = "default",
        speed: float = 1.0,
        pitch: float = 0.0,
        sample_rate: int = 24000,
        output_format: str = "wav"
    ) -> Dict[str, Any]:
        """Synthesize input text string into audio bytes or metadata."""
        ...

    @abstractmethod
    async def stream_audio(
        self,
        text: str,
        speaker: str = "default",
        speed: float = 1.0,
        pitch: float = 0.0,
        sample_rate: int = 24000
    ) -> AsyncGenerator[bytes, None]:
        """Stream synthesized audio bytes incrementally."""
        ...
