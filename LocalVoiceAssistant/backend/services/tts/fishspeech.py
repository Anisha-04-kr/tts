"""
Fish Speech TTS service implementation wrapping local Fish Speech S2 Pro engine served via vLLM-Omni.
"""

import time
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, AsyncGenerator, Optional
from backend.services.tts.base import BaseTTSService
from backend.clients.tts_client import TTSClient
from backend.config.settings import settings
from backend.config.runtime import runtime_state
from backend.core.gpu_manager import gpu_manager
from backend.logger import logger, log_event

class FishSpeechTTSService(BaseTTSService):
    """Local Fish Speech S2 Pro TTS Service implementation."""

    def __init__(self, model_name: str = "fish-speech-s2-pro") -> None:
        self.model_name = model_name
        self.client = TTSClient()
        self.is_active = False
        self.model_loaded = False
        self.running_since: Optional[datetime] = None
        self.validation_errors: list[str] = []
        log_event("fishspeech_tts", f"Instantiated FishSpeechTTSService (model: {self.model_name})")

    def _validate_model_files(self) -> bool:
        """
        Validates model directory, model weights, tokenizer, and config files on local disk.
        Fails validation if essential files are missing.
        """
        self.validation_errors.clear()
        model_dir = settings.FISH_SPEECH_MODEL_PATH

        log_event("fishspeech_tts", f"Validating Fish Speech model directory: {model_dir}")

        # 1. Directory Check
        if not model_dir.exists():
            msg = f"Model directory does not exist: {model_dir}"
            self.validation_errors.append(msg)
            logger.warning(f"[FishSpeech] {msg}")
            return False

        # 2. Model Weights Check
        weight_patterns = ["*.pth", "*.safetensors", "*.ckpt", "*.bin", "*.pt", "pytorch_model.bin"]
        found_weights = any(list(model_dir.glob(pat)) for pat in weight_patterns)
        if not found_weights:
            msg = f"No valid model weights found in {model_dir} (expected .pth, .safetensors, .ckpt, or .bin)"
            self.validation_errors.append(msg)
            logger.warning(f"[FishSpeech] {msg}")

        # 3. Tokenizer Check
        tokenizer_patterns = ["tokenizer.json", "tokenizer.model", "vocab.json", "tokenizer"]
        found_tokenizer = any((model_dir / name).exists() for name in tokenizer_patterns) or any(model_dir.glob("tokenizer*"))
        if not found_tokenizer:
            msg = f"Tokenizer file missing in {model_dir} (expected tokenizer.json or tokenizer.model)"
            self.validation_errors.append(msg)
            logger.warning(f"[FishSpeech] {msg}")

        # 4. Configuration Check
        config_patterns = ["config.json", "config.yaml", "hyper_parameters.yaml"]
        found_config = any((model_dir / name).exists() for name in config_patterns) or any(model_dir.glob("config*"))
        if not found_config:
            msg = f"Model configuration file missing in {model_dir} (expected config.json or config.yaml)"
            self.validation_errors.append(msg)
            logger.warning(f"[FishSpeech] {msg}")

        is_valid = len(self.validation_errors) == 0
        if is_valid:
            log_event("fishspeech_tts", f"Model files validation passed for '{self.model_name}'.")
        else:
            log_event("fishspeech_tts", f"Model validation completed with {len(self.validation_errors)} warnings.", level="warning")

        return is_valid

    async def initialize(self) -> None:
        """Initializes model verification and checks vLLM-Omni connectivity."""
        log_event("fishspeech_tts", f"Initializing Fish Speech engine for model '{self.model_name}'...")
        
        # Perform Model Validation
        self.model_loaded = self._validate_model_files()
        
        # Probe vLLM-Omni Server
        vllm_reachable = await self.client.check_vllm_omni_health()
        
        self.is_active = True
        self.running_since = datetime.now(timezone.utc)
        runtime_state.tts_running_since = self.running_since
        runtime_state.update_service_status("tts", "running" if vllm_reachable else "unready")

    async def start(self) -> None:
        """Starts Fish Speech service."""
        log_event("fishspeech_tts", "Fish Speech TTS Service started.")
        self.is_active = True
        if self.running_since is None:
            self.running_since = datetime.now(timezone.utc)
            runtime_state.tts_running_since = self.running_since

    async def stop(self) -> None:
        """Stops Fish Speech service gracefully."""
        log_event("fishspeech_tts", "Fish Speech TTS Service stopping...")
        self.is_active = False
        runtime_state.update_service_status("tts", "stopped")

    async def restart_service(self) -> None:
        """Restarts Fish Speech TTS service and re-probes local vLLM-Omni engine."""
        log_event("fishspeech_tts", "Restarting Fish Speech TTS service...")
        await self.stop()
        self.client = TTSClient()
        await self.initialize()
        await self.start()
        log_event("fishspeech_tts", "Fish Speech TTS service restarted successfully.")

    async def health_check(self) -> Dict[str, Any]:
        """
        Performs detailed health diagnostic queries for Fish Speech, vLLM-Omni, and GPU resources.
        """
        vllm_reachable = await self.client.check_vllm_omni_health()
        gpu_info = gpu_manager.get_status_dict()

        overall_status = "healthy"
        if not vllm_reachable or not self.model_loaded:
            overall_status = "unready" if self.model_loaded else "offline"

        return {
            "status": overall_status,
            "fish_speech_version": settings.FISH_SPEECH_VERSION,
            "vllm_version": settings.VLLM_VERSION,
            "model_path": str(settings.FISH_SPEECH_MODEL_PATH),
            "model_loaded": self.model_loaded,
            "vllm_omni_reachable": vllm_reachable,
            "running_since": self.running_since.isoformat() if self.running_since else None,
            "validation_errors": self.validation_errors,
            "gpu": {
                "cuda_available": gpu_info["cuda_available"],
                "gpu_name": gpu_info["gpu_name"],
                "vram_used_gb": gpu_info["vram_used_gb"],
                "vram_total_gb": gpu_info["vram_total_gb"],
                "inference_device": gpu_info["inference_device"]
            }
        }

    async def synthesize(
        self,
        text: str,
        speaker: str = "default",
        speed: float = 1.0,
        pitch: float = 0.0,
        sample_rate: int = 24000,
        output_format: str = "wav"
    ) -> Dict[str, Any]:
        """
        Synthesizes text prompt into speech using local vLLM-Omni.
        Returns audio byte payload or offline status JSON error dictionary. Never generates fake audio.
        """
        log_event("fishspeech_tts", f"Synthesizing text prompt (len={len(text)}, speaker='{speaker}')...")
        start_time = time.perf_counter()

        # Check vLLM-Omni connectivity
        vllm_reachable = await self.client.check_vllm_omni_health()
        if not vllm_reachable:
            log_event("fishspeech_tts", "Synthesis failed: vLLM-Omni server is offline.", level="warning")
            return {
                "status": "offline",
                "message": "Fish Speech server is unavailable.",
                "offline": True
            }

        audio_bytes = await self.client.synthesize_speech(
            text=text,
            speaker=speaker,
            speed=speed,
            pitch=pitch,
            sample_rate=sample_rate,
            output_format=output_format
        )

        synthesis_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        if audio_bytes is None:
            return {
                "status": "offline",
                "message": "Fish Speech server is unavailable.",
                "offline": True
            }

        # Update metrics
        runtime_state.tts_synthesis_count += 1
        runtime_state.tts_total_synthesis_time_ms += synthesis_time_ms
        runtime_state.total_tts_bytes_synthesized += len(audio_bytes)

        duration_seconds = round(len(text) * 0.08 + 0.5, 2)

        return {
            "status": "success",
            "audio_bytes": audio_bytes,
            "format": output_format,
            "sample_rate": sample_rate,
            "duration_seconds": duration_seconds,
            "synthesis_time_ms": synthesis_time_ms,
            "model_used": settings.DEFAULT_TTS_MODEL,
            "provider_used": "vllm-omni",
            "metadata": {
                "speaker": speaker,
                "speed": speed,
                "pitch": pitch,
                "language": "auto-detected UTF-8",
                "fish_speech_version": settings.FISH_SPEECH_VERSION
            }
        }

    async def stream_audio(
        self,
        text: str,
        speaker: str = "default",
        speed: float = 1.0,
        pitch: float = 0.0,
        sample_rate: int = 24000
    ) -> AsyncGenerator[bytes, None]:
        """Streams audio bytes incrementally from vLLM-Omni."""
        log_event("fishspeech_tts", f"Streaming audio via Fish Speech for prompt: '{text[:30]}...'")
        async for chunk in self.client.stream_audio(
            text=text,
            speaker=speaker,
            speed=speed,
            pitch=pitch,
            sample_rate=sample_rate
        ):
            yield chunk
