"""
Sounddevice helper for enumerating host audio hardware devices on Windows.
"""

from typing import List, Dict, Any
from backend.logger import logger, log_event

def get_available_audio_devices() -> List[Dict[str, Any]]:
    """
    Enumerates host audio input and output devices via sounddevice or fallback placeholders.
    """
    devices: List[Dict[str, Any]] = []

    try:
        import sounddevice as sd
        device_list = sd.query_devices()
        for idx, dev in enumerate(device_list):
            devices.append({
                "index": idx,
                "name": dev.get("name", f"Audio Device {idx}"),
                "max_input_channels": dev.get("max_input_channels", 0),
                "max_output_channels": dev.get("max_output_channels", 0),
                "default_sample_rate": dev.get("default_samplerate", 44100.0),
                "is_input": dev.get("max_input_channels", 0) > 0,
                "is_output": dev.get("max_output_channels", 0) > 0,
                "host_api": dev.get("hostapi", 0)
            })
        log_event("audio_device", f"Successfully enumerated {len(devices)} host audio devices via sounddevice.")
        return devices
    except ImportError:
        log_event("audio_device", "sounddevice module not yet installed. Returning system fallback device list.", level="warning")
    except Exception as err:
        logger.warning(f"[AudioDevice] Sounddevice query failed: {err}")

    # Fallback default device structures for offline hardware enumeration
    return [
        {
            "index": 0,
            "name": "Default Microphone (WASAPI Placeholder)",
            "max_input_channels": 2,
            "max_output_channels": 0,
            "default_sample_rate": 16000.0,
            "is_input": True,
            "is_output": False,
            "host_api": 0
        },
        {
            "index": 1,
            "name": "Default Speakers (WASAPI Placeholder)",
            "max_input_channels": 0,
            "max_output_channels": 2,
            "default_sample_rate": 48000.0,
            "is_input": False,
            "is_output": True,
            "host_api": 0
        }
    ]
