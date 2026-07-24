"""
Pydantic schemas for API v1 requests and responses.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

# Common Status & Health Schemas
class HealthResponse(BaseModel):
    status: str = Field(json_schema_extra={"example": "healthy"})
    timestamp: str
    services: Dict[str, Any]

class StatusResponse(BaseModel):
    status: str = Field(json_schema_extra={"example": "ok"})
    app_name: str
    version: str
    uptime_seconds: float
    gpu: Dict[str, Any]
    active_models: Dict[str, Any]
    services: Dict[str, str]

class ConfigResponse(BaseModel):
    project_name: str
    version: str
    host: str
    port: int
    environment: str
    debug: bool
    directories: Dict[str, str]
    audio_settings: Dict[str, Any]
    gpu_settings: Dict[str, Any]
    model_defaults: Dict[str, str]

# TTS Endpoint Schemas
class TTSRequest(BaseModel):
    text: str = Field(..., description="Text prompt to synthesize into speech (any UTF-8 language)", json_schema_extra={"example": "Hello, this is a local text-to-speech test."})
    language: Optional[str] = Field(default="auto", description="Speech language identifier (auto, en, ta, hi, es, etc.)")
    speaker: Optional[str] = Field(default="default", description="Speaker reference voice profile identifier")
    speed: Optional[float] = Field(default=1.0, ge=0.5, le=2.0, description="Speech rate speed factor")
    pitch: Optional[float] = Field(default=0.0, ge=-10.0, le=10.0, description="Audio pitch shift factor")
    sample_rate: Optional[int] = Field(default=24000, description="Target audio sampling rate in Hz")
    output_format: Optional[str] = Field(default="wav", description="Audio encoding format (wav, pcm)")
    return_json: Optional[bool] = Field(default=False, description="Set True to receive Base64 JSON instead of direct binary audio stream")

class TTSResponse(BaseModel):
    audio_base64: Optional[str] = Field(default=None, description="Base64 encoded audio bytes (if return_json=True)")
    format: str = Field(default="wav")
    sample_rate: int = Field(default=24000)
    duration_seconds: float = Field(default=0.0)
    synthesis_time_ms: float = Field(default=0.0)
    model_used: str = Field(default="fish-speech-s2-pro")
    provider_used: str = Field(default="vllm-omni")
    metadata: Dict[str, Any] = Field(default_factory=dict)

class TTSHealthResponse(BaseModel):
    status: str = Field(json_schema_extra={"example": "healthy"})
    fish_speech_version: str = Field(default="1.5 S2 Pro")
    vllm_version: str = Field(default="vllm-omni-0.4.0")
    model_path: str
    model_loaded: bool
    vllm_omni_reachable: bool
    running_since: Optional[str] = None
    validation_errors: List[str] = Field(default_factory=list)
    gpu: Dict[str, Any] = Field(default_factory=dict)

class TTSLanguageItem(BaseModel):
    code: str
    name: str
    native_name: Optional[str] = None


# LLM Endpoint Schemas
class LLMRequest(BaseModel):
    prompt: str = Field(..., description="User prompt text", json_schema_extra={"example": "What is the distance to the moon?"})
    system_prompt: Optional[str] = Field(default="You are a helpful local voice assistant.", description="System prompt instructions")
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=256, ge=1)
    provider: Optional[str] = Field(default=None, description="Optional override provider (lmstudio, vllm)")

class LLMResponse(BaseModel):
    text: str = Field(..., description="Generated text response")
    tokens_generated: int
    model_used: str
    provider_used: str
    finish_reason: str = Field(default="stop")

# ASR Endpoint Schemas
class ASRRequest(BaseModel):
    audio_base64: Optional[str] = Field(default=None, description="Base64 encoded WAV audio bytes")
    language: Optional[str] = Field(default="en", description="Target audio language")
    provider: Optional[str] = Field(default=None, description="Optional override provider (whisper, qwen_asr)")

class ASRResponse(BaseModel):
    transcription: str = Field(..., description="Transcribed text string")
    confidence: float = Field(default=0.98)
    language_detected: str = Field(default="en")
    processing_time_ms: float = Field(default=120.0)
    provider_used: str

# Model Registry Request Schemas
class ModelSwitchRequest(BaseModel):
    service_type: str = Field(..., description="Target service category (asr, llm, tts)", json_schema_extra={"example": "llm"})
    model_name: str = Field(..., description="Target model name", json_schema_extra={"example": "llama3-8b-local"})
    provider: Optional[str] = Field(default=None, description="Provider engine name", json_schema_extra={"example": "lmstudio"})

# Settings Update Request Schema
class SettingsUpdateRequest(BaseModel):
    log_level: Optional[str] = Field(default=None)
    default_sample_rate: Optional[int] = Field(default=None)
    enable_gpu: Optional[bool] = Field(default=None)
