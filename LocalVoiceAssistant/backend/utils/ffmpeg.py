"""
FFmpeg integration and audio conversion helpers.
"""

import shutil
import subprocess
from typing import Dict, Any
from backend.logger import logger, log_event

def verify_ffmpeg_installation() -> Dict[str, Any]:
    """
    Checks if system FFmpeg executable binary is available on PATH.
    """
    ffmpeg_path = shutil.which("ffmpeg")
    is_available = ffmpeg_path is not None
    
    version_str = "Not installed on PATH"
    if is_available:
        try:
            res = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True, timeout=2.0)
            if res.returncode == 0:
                first_line = res.stdout.splitlines()[0]
                version_str = first_line
        except Exception as err:
            logger.warning(f"[FFmpeg] Error querying ffmpeg version: {err}")

    log_event("ffmpeg", f"FFmpeg availability: {is_available} ({version_str})")

    return {
        "is_available": is_available,
        "ffmpeg_path": ffmpeg_path or "None",
        "version": version_str
    }

def convert_audio_pcm_to_wav(pcm_data: bytes, sample_rate: int = 16000, channels: int = 1) -> bytes:
    """
    Converts raw PCM byte stream to a valid WAV file with standard headers.
    """
    import struct

    bits_per_sample = 16
    block_align = channels * (bits_per_sample // 8)
    byte_rate = sample_rate * block_align
    data_size = len(pcm_data)
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        chunk_size,
        b"WAVE",
        b"fmt ",
        16,  # Subchunk1Size (16 for PCM)
        1,   # AudioFormat (1 for PCM)
        channels,
        sample_rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b"data",
        data_size
    )

    return header + pcm_data
