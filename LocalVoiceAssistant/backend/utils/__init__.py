"""
Utility functions package.
"""
from backend.utils.ffmpeg import verify_ffmpeg_installation, convert_audio_pcm_to_wav
from backend.utils.audio_device import get_available_audio_devices
from backend.utils.vad import vad, VoiceActivityDetector

__all__ = [
    "verify_ffmpeg_installation",
    "convert_audio_pcm_to_wav",
    "get_available_audio_devices",
    "vad",
    "VoiceActivityDetector"
]
