"""
CosyVoice TTS service implementation wrapping local CosyVoice 300M engine.
"""

from typing import Dict, Any, AsyncGenerator
from backend.services.tts.base import BaseTTSService
from backend.clients.tts_client import TTSClient
from backend.logger import logger, log_event

class CosyVoiceTTSService(BaseTTSService):
    """Local CosyVoice Multilingual TTS Service implementation."""

    def __init__(self, model_name: str = "cosyvoice-300m-local") -> None:
        self.model_name = model_name
        self.client = TTSClient()
        self.is_active = False
        log_event("cosyvoice_tts", f"Instantiated CosyVoiceTTSService (model: {self.model_name})")

    async def initialize(self) -> None:
        """Initializes CosyVoice engine."""
        log_event("cosyvoice_tts", f"Initializing CosyVoice model '{self.model_name}'...")
        self.is_active = True

    async def start(self) -> None:
        """Starts CosyVoice service."""
        log_event("cosyvoice_tts", "CosyVoice TTS Service started.")

    async def stop(self) -> None:
        """Stops CosyVoice service."""
        log_event("cosyvoice_tts", "CosyVoice TTS Service stopped.")
        self.is_active = False

    async def health_check(self) -> Dict[str, Any]:
        """Performs CosyVoice health check."""
        return {
            "service_name": "CosyVoice TTS",
            "provider": "cosyvoice",
            "model": self.model_name,
            "status": "healthy" if self.is_active else "stopped",
            "is_active": self.is_active
        }

    async def synthesize(
        self,
        text: str,
        voice: str = "default_female",
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Synthesizes text via CosyVoice client."""
        log_event("cosyvoice_tts", f"Synthesizing speech via CosyVoice for prompt: '{text[:30]}...'")
        return await self.client.synthesize_speech(
            text=text,
            voice=voice,
            speed=speed,
            provider="cosyvoice"
        )

    async def stream_audio(
        self,
        text: str,
        voice: str = "default_female"
    ) -> AsyncGenerator[bytes, None]:
        """Streams audio bytes incrementally via CosyVoice client."""
        log_event("cosyvoice_tts", f"Streaming audio via CosyVoice for prompt: '{text[:30]}...'")
        async for chunk in self.client.stream_audio(text=text, voice=voice, provider="cosyvoice"):
            yield chunk
