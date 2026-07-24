"""
Local HTTP client wrapper for vLLM-Omni Speech API serving Fish Speech S2 Pro.
"""

from typing import Dict, Any, AsyncGenerator, Optional
import httpx
from backend.config.settings import settings
from backend.logger import logger, log_event

class TTSClient:
    """Handles HTTP communication with local vLLM-Omni Speech API endpoint."""

    def __init__(self, endpoint: Optional[str] = None, timeout: float = 1.5) -> None:
        self.endpoint = endpoint or settings.TTS_ENDPOINT
        self.timeout = timeout
        log_event("tts_client", f"Initialized TTSClient targeting local vLLM-Omni endpoint: {self.endpoint}")

    async def check_vllm_omni_health(self) -> bool:
        """
        Probes the local vLLM-Omni server endpoint on localhost.
        Returns True if server is online and reachable, False otherwise.
        """
        try:
            base_url = f"http://{settings.VLLM_OMNI_HOST}:{settings.VLLM_OMNI_PORT}/health"
            async with httpx.AsyncClient(timeout=1.0) as client:
                res = await client.get(base_url)
                if res.status_code == 200:
                    log_event("tts_client", f"vLLM-Omni health check probe successful at {base_url}.")
                    return True
        except Exception:
            pass

        log_event("tts_client", f"vLLM-Omni server probe failed for endpoint {self.endpoint}.", level="warning")
        return False

    async def synthesize_speech(
        self,
        text: str,
        language: str = "auto",
        speaker: str = "default",
        speed: float = 1.0,
        pitch: float = 0.0,
        sample_rate: int = 24000,
        output_format: str = "wav"
    ) -> Optional[bytes]:
        """
        Sends text payload to local vLLM-Omni speech API.
        Returns raw audio bytes (WAV/PCM) if successful, or None if vLLM-Omni is offline or fails.
        NEVER generates fake speech.
        """
        log_event("tts_client", f"Sending speech synthesis request to {self.endpoint} (language: '{language}', speaker: '{speaker}', sample_rate: {sample_rate}Hz)...")

        payload = {
            "model": settings.DEFAULT_TTS_MODEL,
            "input": text,
            "language": language,
            "voice": speaker,
            "speed": speed,
            "pitch": pitch,
            "response_format": output_format,
            "sample_rate": sample_rate
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.endpoint,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                if response.status_code == 200:
                    log_event("tts_client", f"Successfully received {len(response.content)} audio bytes from vLLM-Omni.")
                    return response.content
                else:
                    logger.warning(f"[TTSClient] vLLM-Omni returned non-200 status code {response.status_code}: {response.text}")
        except httpx.ConnectError:
            log_event("tts_client", f"Unable to connect to local vLLM-Omni server at {self.endpoint}. Server is offline.", level="warning")
        except httpx.TimeoutException:
            logger.error(f"[TTSClient] Connection timeout contacting vLLM-Omni at {self.endpoint}.")
        except Exception as err:
            logger.error(f"[TTSClient] Exception contacting vLLM-Omni: {err}")

        # Return None on failure (never fake audio)
        return None

    async def stream_audio(
        self,
        text: str,
        language: str = "auto",
        speaker: str = "default",
        speed: float = 1.0,
        pitch: float = 0.0,
        sample_rate: int = 24000
    ) -> AsyncGenerator[bytes, None]:
        """
        Streams audio chunk bytes incrementally from vLLM-Omni speech API.
        """
        log_event("tts_client", f"Initiating audio stream from {self.endpoint} (language: '{language}')...")
        
        payload = {
            "model": settings.DEFAULT_TTS_MODEL,
            "input": text,
            "language": language,
            "voice": speaker,
            "speed": speed,
            "pitch": pitch,
            "stream": True,
            "sample_rate": sample_rate
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream("POST", self.endpoint, json=payload) as response:
                    if response.status_code == 200:
                        async for chunk in response.aiter_bytes():
                            if chunk:
                                yield chunk
                    else:
                        logger.warning(f"[TTSClient] Streaming returned status code {response.status_code}")
        except Exception as err:
            logger.warning(f"[TTSClient] Audio streaming failed: {err}")
