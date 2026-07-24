"""
Abstract Base Class interface for Automatic Speech Recognition (ASR) services.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator, Optional

class BaseASRService(ABC):
    """Abstract interface enforcing standardized lifecycle and transcription contracts for ASR providers."""

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize models, weights, or client connections."""
        ...

    @abstractmethod
    async def start(self) -> None:
        """Start ASR service processing loops."""
        ...

    @abstractmethod
    async def stop(self) -> None:
        """Stop ASR service gracefully."""
        ...

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Perform ASR provider health diagnostic."""
        ...

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, language: Optional[str] = "en") -> Dict[str, Any]:
        """Transcribe raw audio bytes into text."""
        ...

    @abstractmethod
    async def stream_transcribe(self, audio_stream: AsyncGenerator[bytes, None]) -> AsyncGenerator[str, None]:
        """Stream transcription text from input audio byte stream."""
        ...
