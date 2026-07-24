"""
Voice Activity Detection (VAD) and audio segmenting utilities.
"""

import math
import struct
from typing import List, Tuple
from backend.logger import log_event

class VoiceActivityDetector:
    """Energy and RMS amplitude based Voice Activity Detector for local audio streams."""

    def __init__(self, threshold_db: float = -40.0, min_speech_duration_ms: int = 300, silence_duration_ms: int = 800) -> None:
        self.threshold_db = threshold_db
        self.min_speech_duration_ms = min_speech_duration_ms
        self.silence_duration_ms = silence_duration_ms
        log_event("vad", f"Initialized VoiceActivityDetector (threshold: {threshold_db}dB, min_speech: {min_speech_duration_ms}ms)")

    def calculate_rms_db(self, pcm_chunk: bytes) -> float:
        """
        Calculates Root Mean Square (RMS) energy in decibels for 16-bit PCM mono audio bytes.
        """
        if not pcm_chunk or len(pcm_chunk) < 2:
            return -100.0

        sample_count = len(pcm_chunk) // 2
        fmt = f"<{sample_count}h"
        
        try:
            samples = struct.unpack(fmt, pcm_chunk[:sample_count * 2])
        except Exception:
            return -100.0

        sum_squares = sum(float(s) * float(s) for s in samples)
        rms = math.sqrt(sum_squares / max(1, sample_count))
        
        # Avoid log(0)
        if rms < 1e-6:
            return -100.0

        # Normalized to 16-bit max amplitude (32768)
        db = 20.0 * math.log10(rms / 32768.0)
        return round(db, 2)

    def is_speech(self, pcm_chunk: bytes) -> bool:
        """
        Evaluates whether a PCM chunk contains active speech based on RMS energy threshold.
        """
        db = self.calculate_rms_db(pcm_chunk)
        return db > self.threshold_db

    def process_stream(self, pcm_stream: List[bytes], sample_rate: int = 16000) -> List[Tuple[bool, bytes]]:
        """
        Processes a list of PCM chunks and labels each frame as speech (True) or silence (False).
        """
        results = []
        for chunk in pcm_stream:
            speech = self.is_speech(chunk)
            results.append((speech, chunk))
        return results

# Singleton instance
vad = VoiceActivityDetector()
