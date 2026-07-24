"""
OmniVoice TTS service implementation wrapping local OmniVoice zero-shot engine.
"""

from typing import Dict, Any, AsyncGenerator
from backend.services.tts.base import BaseTTSService
from backend.clients.tts_client import TTSClient
from backend.logger import logger, log_event

class OmniVoiceTTSService(BaseTTSService):
    """Local OmniVoice Zero-Shot TTS Service implementation."""

    def __init__(self, model_name: str = "omnivoice-v1-local") -> None:
        self.model_name = model_name
        self.client = TTSClient()
        self.is_active = False
        log_event("omnivoice_tts", f"Instantiated OmniVoiceTTSService (model: {self.model_name})")

    async def initialize(self) -> None:
        """Initializes OmniVoice engine."""
        log_event("omnivoice_tts", f"Initializing OmniVoice model '{self.model_name}'...")
        self.is_active = True

    async def start(self) -> None:
        """Starts OmniVoice service."""
        log_event("omnivoice_tts", "OmniVoice TTS Service started.")

    async def stop(self) -> None:
        """Stops OmniVoice service."""
        log_event("omnivoice_tts", "OmniVoice TTS Service stopped.")
        self.is_active = False

    async def health_check(self) -> Dict[str, Any]:
        """Performs OmniVoice health check."""
        return {
            "service_name": "OmniVoice TTS",
            "provider": "omnivoice",
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
        """Synthesizes text via OmniVoice client."""
        log_event("omnivoice_tts", f"Synthesizing speech via OmniVoice for prompt: '{text[:30]}...'")
        return await self.client.synthesize_speech(
            text=text,
            voice=voice,
            speed=speed,
            provider="omnivoice"
        )

    async def stream_audio(
        self,
        text: str,
        voice: str = "default_female"
    ) -> AsyncGenerator[bytes, None]:
        """Streams audio bytes incrementally via OmniVoice client."""
        log_event("omnivoice_tts", f"Streaming audio via OmniVoice for prompt: '{text[:30]}...'")
        async for chunk in self.client.stream_audio(text=text, voice=voice, provider="omnivoice"):
            yield chunk
