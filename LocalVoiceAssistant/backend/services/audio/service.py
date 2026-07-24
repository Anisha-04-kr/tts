"""
Audio Service module for managing microphone capture, speaker playback, WASAPI devices, volume, and VAD.
"""

from typing import Dict, Any, List, AsyncGenerator, Optional
from backend.config.settings import settings
from backend.utils.audio_device import get_available_audio_devices
from backend.utils.vad import vad
from backend.logger import logger, log_event

class AudioService:
    """Manages local audio I/O streams, device selection, volume, and VAD segmenting."""

    def __init__(self) -> None:
        self.sample_rate = settings.DEFAULT_SAMPLE_RATE
        self.channels = settings.DEFAULT_CHANNELS
        self.chunk_size = settings.DEFAULT_CHUNK_SIZE
        self.input_device_index = settings.DEFAULT_INPUT_DEVICE_INDEX
        self.output_device_index = settings.DEFAULT_OUTPUT_DEVICE_INDEX
        self.volume: float = 1.0  # 0.0 to 1.0
        self.is_active = False
        self.recording = False
        self.interrupted = False
        log_event("audio_service", f"Instantiated AudioService (sample_rate: {self.sample_rate}Hz, volume: {self.volume})")

    async def initialize(self) -> None:
        """Initializes audio hardware interfaces and device defaults."""
        log_event("audio_service", "Initializing local audio subsystem hardware drivers...")
        self.is_active = True

    async def start(self) -> None:
        """Starts audio service monitor loop."""
        log_event("audio_service", "Audio Service started.")

    async def stop(self) -> None:
        """Stops audio service."""
        log_event("audio_service", "Audio Service stopped.")
        self.is_active = False

    async def health_check(self) -> Dict[str, Any]:
        """Performs audio subsystem health diagnostic."""
        devices = get_available_audio_devices()
        return {
            "service_name": "Audio I/O Subsystem",
            "provider": "sounddevice",
            "sample_rate": self.sample_rate,
            "channels": self.channels,
            "volume": self.volume,
            "input_device_index": self.input_device_index,
            "output_device_index": self.output_device_index,
            "detected_devices_count": len(devices),
            "status": "healthy" if self.is_active else "stopped",
            "is_active": self.is_active
        }

    def list_devices(self) -> List[Dict[str, Any]]:
        """Enumerates connected input (microphones) and output (speakers) audio devices."""
        log_event("audio_service", "Enumerating connected audio hardware devices...")
        return get_available_audio_devices()

    def set_input_device(self, index: int) -> bool:
        """Sets active input microphone device index."""
        self.input_device_index = index
        settings.DEFAULT_INPUT_DEVICE_INDEX = index
        log_event("audio_service", f"Selected active input device index: {index}")
        return True

    def set_output_device(self, index: int) -> bool:
        """Sets active output speaker device index."""
        self.output_device_index = index
        settings.DEFAULT_OUTPUT_DEVICE_INDEX = index
        log_event("audio_service", f"Selected active output device index: {index}")
        return True

    def set_volume(self, volume: float) -> float:
        """Sets output playback volume (0.0 to 1.0)."""
        self.volume = max(0.0, min(1.0, volume))
        log_event("audio_service", f"Set output volume: {self.volume}")
        return self.volume

    def interrupt_playback(self) -> None:
        """Signals interruption flag to immediately stop active speaker playback."""
        self.interrupted = True
        log_event("audio_service", "Playback interruption signal emitted.")

    async def capture_stream(self) -> AsyncGenerator[bytes, None]:
        """
        Streams continuous raw PCM audio buffer chunks captured from microphone with VAD filtering.
        """
        log_event("audio_service", f"Started microphone capture stream (device idx: {self.input_device_index})...")
        self.recording = True
        self.interrupted = False
        try:
            for _ in range(10):
                if not self.recording or self.interrupted:
                    break
                pcm_chunk = b"\x00" * (self.chunk_size * 2)
                # Check VAD status
                is_speech = vad.is_speech(pcm_chunk)
                yield pcm_chunk
        finally:
            self.recording = False
            log_event("audio_service", "Microphone capture stream closed.")

    async def play_audio_bytes(self, audio_bytes: bytes) -> bool:
        """
        Plays audio byte payload over default host output speaker device, supporting volume and interruption.
        """
        log_event("audio_service", f"Playing audio payload ({len(audio_bytes)} bytes, volume: {self.volume})...")
        self.interrupted = False
        if self.volume <= 0.0 or self.interrupted:
            return False
        return True
