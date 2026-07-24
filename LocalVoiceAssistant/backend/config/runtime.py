"""
Dynamic runtime state manager for tracking live active models, running services, and operational stats.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class RuntimeState(BaseModel):
    """Encapsulates dynamic application state modified during runtime."""

    startup_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_running: bool = Field(default=False, description="Application active status")
    
    # Active Models State
    active_asr_model: str = Field(default="whisper-small-local")
    active_llm_model: str = Field(default="llama3-8b-local")
    active_tts_model: str = Field(default="fishspeech-v1.5-local")

    # Active Service Providers
    active_asr_provider: str = Field(default="whisper")
    active_llm_provider: str = Field(default="lmstudio")
    active_tts_provider: str = Field(default="fishspeech")

    # Status tracking for services
    services_status: Dict[str, str] = Field(default_factory=lambda: {
        "asr": "stopped",
        "llm": "stopped",
        "tts": "stopped",
        "audio": "stopped"
    })

    tts_running_since: Optional[datetime] = Field(default=None)
    tts_synthesis_count: int = Field(default=0)
    tts_total_synthesis_time_ms: float = Field(default=0.0)

    # Telemetry-free internal counters
    total_asr_requests: int = Field(default=0)
    total_llm_tokens_generated: int = Field(default=0)
    total_tts_bytes_synthesized: int = Field(default=0)

    def get_uptime_seconds(self) -> float:
        """Returns uptime in seconds since application startup."""
        return (datetime.now(timezone.utc) - self.startup_time).total_seconds()

    def update_service_status(self, service_name: str, status: str) -> None:
        """Updates runtime state for a specific service."""
        self.services_status[service_name] = status

    def set_active_model(self, service_type: str, model_name: str, provider_name: Optional[str] = None) -> None:
        """Updates active model for ASR, LLM, or TTS."""
        if service_type.lower() == "asr":
            self.active_asr_model = model_name
            if provider_name:
                self.active_asr_provider = provider_name
        elif service_type.lower() == "llm":
            self.active_llm_model = model_name
            if provider_name:
                self.active_llm_provider = provider_name
        elif service_type.lower() == "tts":
            self.active_tts_model = model_name
            if provider_name:
                self.active_tts_provider = provider_name

    def snapshot(self) -> Dict[str, Any]:
        """Returns structured dictionary snapshot of current runtime state."""
        return {
            "startup_time": self.startup_time.isoformat(),
            "uptime_seconds": round(self.get_uptime_seconds(), 2),
            "is_running": self.is_running,
            "active_models": {
                "asr": {"model": self.active_asr_model, "provider": self.active_asr_provider},
                "llm": {"model": self.active_llm_model, "provider": self.active_llm_provider},
                "tts": {"model": self.active_tts_model, "provider": self.active_tts_provider},
            },
            "services_status": self.services_status,
            "stats": {
                "total_asr_requests": self.total_asr_requests,
                "total_llm_tokens_generated": self.total_llm_tokens_generated,
                "total_tts_bytes_synthesized": self.total_tts_bytes_synthesized,
            }
        }

# Global singleton runtime state
runtime_state = RuntimeState()
