"""
Qwen ASR service implementation wrapping local Qwen Audio/ASR engine.
"""

from typing import Dict, Any, AsyncGenerator, Optional
from backend.services.asr.base import BaseASRService
from backend.clients.asr_client import ASRClient
from backend.logger import logger, log_event

class QwenASRService(BaseASRService):
    """Local Qwen ASR Service implementation."""

    def __init__(self, model_name: str = "qwen-asr-1.5b-local") -> None:
        self.model_name = model_name
        self.client = ASRClient()
        self.is_active = False
        log_event("qwen_asr", f"Instantiated QwenASRService (model: {self.model_name})")

    async def initialize(self) -> None:
        """Prepares local Qwen ASR engine resources."""
        log_event("qwen_asr", f"Initializing Qwen ASR model '{self.model_name}'...")
        self.is_active = True

    async def start(self) -> None:
        """Starts Qwen ASR service."""
        log_event("qwen_asr", "Qwen ASR Service started.")

    async def stop(self) -> None:
        """Stops Qwen ASR service."""
        log_event("qwen_asr", "Qwen ASR Service stopped.")
        self.is_active = False

    async def health_check(self) -> Dict[str, Any]:
        """Performs Qwen ASR health check."""
        return {
            "service_name": "Qwen ASR",
            "provider": "qwen_asr",
            "model": self.model_name,
            "status": "healthy" if self.is_active else "stopped",
            "is_active": self.is_active
        }

    async def transcribe(self, audio_bytes: bytes, language: Optional[str] = "en") -> Dict[str, Any]:
        """Transcribes audio using Qwen ASR engine."""
        log_event("qwen_asr", f"Transcribing audio ({len(audio_bytes)} bytes) using Qwen ASR...")
        return await self.client.transcribe_audio(audio_bytes, provider="qwen_asr")

    async def stream_transcribe(self, audio_stream: AsyncGenerator[bytes, None]) -> AsyncGenerator[str, None]:
        """Streams real-time transcription via Qwen ASR."""
        log_event("qwen_asr", "Initiating Qwen streaming transcription...")
        async for token in self.client.stream_transcribe(audio_stream):
            yield token
