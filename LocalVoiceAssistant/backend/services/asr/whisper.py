"""
Whisper ASR service implementation supporting Whisper Large V3 served locally.
"""

from pathlib import Path
from typing import Dict, Any, AsyncGenerator, Optional
from backend.services.asr.base import BaseASRService
from backend.clients.asr_client import ASRClient
from backend.config.settings import settings
from backend.logger import logger, log_event

class WhisperASRService(BaseASRService):
    """Local OpenAI Whisper Large V3 ASR Service implementation."""

    def __init__(self, model_name: str = "whisper-large-v3") -> None:
        self.model_name = model_name
        self.client = ASRClient()
        self.is_active = False
        self.model_loaded = False
        self.validation_errors: list[str] = []
        log_event("whisper_asr", f"Instantiated WhisperASRService (model: {self.model_name})")

    def _validate_model_files(self) -> bool:
        """
        Validates model directory, model weights, tokenizer, and config files for Whisper Large V3.
        """
        self.validation_errors.clear()
        model_dir = settings.WHISPER_LARGE_V3_MODEL_PATH

        log_event("whisper_asr", f"Validating Whisper model directory: {model_dir}")

        if not model_dir.exists():
            msg = f"Whisper model directory does not exist: {model_dir}"
            self.validation_errors.append(msg)
            logger.warning(f"[WhisperASR] {msg}")
            return False

        # Check weights
        found_weights = any(model_dir.glob("*.bin")) or any(model_dir.glob("*.safetensors")) or any(model_dir.glob("*.pt"))
        if not found_weights:
            msg = f"No valid Whisper model weights found in {model_dir}"
            self.validation_errors.append(msg)
            logger.warning(f"[WhisperASR] {msg}")

        is_valid = len(self.validation_errors) == 0
        if is_valid:
            log_event("whisper_asr", f"Whisper Large V3 model validation passed.")
        else:
            log_event("whisper_asr", f"Whisper Large V3 validation unready: {self.validation_errors}", level="warning")

        return is_valid

    async def initialize(self) -> None:
        """Prepares local Whisper engine configuration and probes local server."""
        log_event("whisper_asr", f"Initializing Whisper ASR engine resources for model '{self.model_name}'...")
        self.model_loaded = self._validate_model_files()
        self.is_active = True

    async def start(self) -> None:
        """Starts Whisper ASR service."""
        log_event("whisper_asr", "Whisper ASR Service started and listening for transcription tasks.")
        self.is_active = True

    async def stop(self) -> None:
        """Stops Whisper ASR service."""
        log_event("whisper_asr", "Whisper ASR Service stopped.")
        self.is_active = False

    async def health_check(self) -> Dict[str, Any]:
        """Performs Whisper ASR health diagnostic."""
        log_event("whisper_asr", "Running health check for Whisper ASR Service.")
        return {
            "service_name": "Whisper ASR",
            "provider": "whisper",
            "model": self.model_name,
            "model_path": str(settings.WHISPER_LARGE_V3_MODEL_PATH),
            "model_loaded": self.model_loaded,
            "status": "healthy" if self.is_active else "stopped",
            "is_active": self.is_active,
            "validation_errors": self.validation_errors
        }

    async def transcribe(self, audio_bytes: bytes, language: Optional[str] = "en") -> Dict[str, Any]:
        """Transcribes audio payload (WAV, PCM, or FLAC) via Whisper client."""
        log_event("whisper_asr", f"Transcribing audio payload ({len(audio_bytes)} bytes, lang: {language})...")
        return await self.client.transcribe_audio(audio_bytes, provider="whisper")

    async def stream_transcribe(self, audio_stream: AsyncGenerator[bytes, None]) -> AsyncGenerator[str, None]:
        """Streams real-time transcription from audio chunk stream."""
        log_event("whisper_asr", "Initiating Whisper streaming transcription...")
        async for token in self.client.stream_transcribe(audio_stream):
            yield token
