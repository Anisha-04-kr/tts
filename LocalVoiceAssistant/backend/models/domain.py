"""
Domain entity models representing core data structures for models, services, and hardware.
"""

from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class ModelType(str, Enum):
    ASR = "asr"
    LLM = "llm"
    TTS = "tts"
    EMBEDDING = "embedding"

class ModelMetadata(BaseModel):
    """Represents local AI model metadata managed by ModelRegistry."""
    id: str = Field(..., description="Unique model identifier")
    name: str = Field(..., description="Display name")
    type: ModelType = Field(..., description="Category of model")
    provider: str = Field(..., description="Engine provider (e.g. whisper, lmstudio, fishspeech)")
    path: str = Field(..., description="Local filesystem path")
    size_bytes: int = Field(default=0, description="Size on disk in bytes")
    is_installed: bool = Field(default=True, description="Installation status")
    is_active: bool = Field(default=False, description="Active status in runtime")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Model parameters / configuration")

class ServiceHealthInfo(BaseModel):
    """Detailed health status info for individual backend services."""
    service_name: str
    status: str  # healthy, degraded, stopped, error
    provider: str
    details: Dict[str, Any] = Field(default_factory=dict)

class GPUInfo(BaseModel):
    """Hardware GPU status information."""
    is_available: bool = Field(default=False)
    device_count: int = Field(default=0)
    device_name: Optional[str] = Field(default="NVIDIA GPU Placeholder")
    total_vram_gb: float = Field(default=0.0)
    free_vram_gb: float = Field(default=0.0)
    cuda_version: Optional[str] = Field(default="12.1 (Placeholder)")
