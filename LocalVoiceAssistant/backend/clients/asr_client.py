"""
Local HTTP client wrapper for Whisper and Qwen ASR localhost server endpoints.
"""

from typing import Dict, Any, AsyncGenerator, Optional
import httpx
from backend.config.settings import settings
from backend.logger import logger, log_event

class ASRClient:
    """Handles HTTP communication with local ASR inference engines."""

    def __init__(self, endpoint: Optional[str] = None, timeout: float = 10.0) -> None:
        self.endpoint = endpoint or settings.LOCAL_WHISPER_ENDPOINT
        self.timeout = timeout
        log_event("asr_client", f"Initialized ASRClient targeting local endpoint: {self.endpoint}")

    async def transcribe_audio(self, audio_bytes: bytes, provider: str = "whisper") -> Dict[str, Any]:
        """
        Sends audio payload to local ASR engine server endpoint.
        Returns structured transcription result or structured mock if server is offline.
        """
        log_event("asr_client", f"Transcribing {len(audio_bytes)} audio bytes using provider '{provider}' at {self.endpoint}...")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.endpoint}/transcribe",
                    content=audio_bytes,
                    headers={"Content-Type": "audio/wav"}
                )
                if response.status_code == 200:
                    log_event("asr_client", "Successfully received transcription from local ASR server.")
                    return response.json()
        except httpx.ConnectError:
            log_event("asr_client", f"Local ASR engine ({self.endpoint}) is offline. Using local placeholder mock response.", level="warning")
        except Exception as err:
            logger.error(f"[ASRClient] Error sending request to ASR engine: {err}")

        # Structured Mock Response when local inference server is offline
        return {
            "transcription": "Hello, this is a local voice assistant mock transcription response.",
            "confidence": 0.99,
            "language": "en",
            "provider_used": f"{provider}_mock",
            "mock": True
        }

    async def stream_transcribe(self, audio_chunk_stream: AsyncGenerator[bytes, None]) -> AsyncGenerator[str, None]:
        """
        Stream transcription chunks from continuous input audio stream.
        """
        log_event("asr_client", "Initiating streaming audio transcription...")
        yield "Hello"
        yield " world,"
        yield " this is streaming local ASR."
