"""
Static environment configuration module powered by Pydantic Settings.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Base Directory (LocalVoiceAssistant/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    """Centralized static environment configuration."""

    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / "config" / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # General Project Information
    PROJECT_NAME: str = Field(default="Local AI Voice Assistant", description="Application name")
    VERSION: str = Field(default="0.1.0", description="Backend version")
    ENVIRONMENT: str = Field(default="development", description="Execution environment")
    DEBUG: bool = Field(default=True, description="Debug mode status")

    # Host and Server Configuration
    HOST: str = Field(default="127.0.0.1", description="Backend bind host (local-only)")
    PORT: int = Field(default=8000, description="Backend HTTP server port")

    # Directory Paths
    ROOT_DIR: Path = Field(default=PROJECT_ROOT)
    MODELS_DIR: Path = Field(default=PROJECT_ROOT / "models")
    LOGS_DIR: Path = Field(default=PROJECT_ROOT / "logs")
    TEMP_DIR: Path = Field(default=PROJECT_ROOT / "temp")
    CONFIG_DIR: Path = Field(default=PROJECT_ROOT / "config")

    # Specific Model Subdirectories
    WHISPER_MODELS_DIR: Path = Field(default=PROJECT_ROOT / "models" / "whisper")
    WHISPER_LARGE_V3_MODEL_PATH: Path = Field(default=PROJECT_ROOT / "models" / "whisper" / "whisper-large-v3")
    FISH_SPEECH_MODELS_DIR: Path = Field(default=PROJECT_ROOT / "models" / "fishspeech")
    FISH_SPEECH_MODEL_PATH: Path = Field(default=PROJECT_ROOT / "models" / "fishspeech" / "fish-speech-s2-pro")
    LLM_MODELS_DIR: Path = Field(default=PROJECT_ROOT / "models" / "llm")
    VOICES_DIR: Path = Field(default=PROJECT_ROOT / "models" / "voices")
    CACHE_DIR: Path = Field(default=PROJECT_ROOT / "models" / "cache")
    DOWNLOADS_DIR: Path = Field(default=PROJECT_ROOT / "models" / "downloads")
    EMBEDDINGS_DIR: Path = Field(default=PROJECT_ROOT / "models" / "embeddings")

    # Active Default Models
    DEFAULT_ASR_MODEL: str = Field(default="whisper-small-local", description="Default ASR model name")
    DEFAULT_LLM_MODEL: str = Field(default="llama3-8b-local", description="Default LLM model name")
    DEFAULT_TTS_MODEL: str = Field(default="fish-speech-s2-pro", description="Default TTS model name")

    # Fish Speech S2 Pro & vLLM-Omni Configuration
    VLLM_OMNI_HOST: str = Field(default="127.0.0.1", description="vLLM-Omni server host")
    VLLM_OMNI_PORT: int = Field(default=8002, description="vLLM-Omni server port")
    TTS_ENDPOINT: str = Field(default="http://127.0.0.1:8002/v1/audio/speech", description="Configurable vLLM-Omni TTS Speech API endpoint")
    DEFAULT_SPEAKER: str = Field(default="default", description="Default speaker voice profile identifier")
    VOICE_REFERENCE_DIRECTORY: Path = Field(default=PROJECT_ROOT / "models" / "voices", description="Directory containing voice reference audio profiles")
    VOICE_CLONING_ENABLED: bool = Field(default=True, description="Enable reference voice cloning capability")
    LANGUAGE_VALIDATION: bool = Field(default=False, description="Allow any UTF-8 text without restricting languages")
    FISH_SPEECH_VERSION: str = Field(default="1.5 S2 Pro", description="Fish Speech model version")
    VLLM_VERSION: str = Field(default="vllm-omni-0.4.0", description="vLLM-Omni engine version")

    # Audio Hardware Settings
    DEFAULT_SAMPLE_RATE: int = Field(default=24000, description="Default audio sampling rate in Hz")
    DEFAULT_CHANNELS: int = Field(default=1, description="Audio channels (mono=1, stereo=2)")
    DEFAULT_CHUNK_SIZE: int = Field(default=1024, description="Audio buffer chunk size")
    DEFAULT_INPUT_DEVICE_INDEX: int = Field(default=0, description="Default microphone device index")
    DEFAULT_OUTPUT_DEVICE_INDEX: int = Field(default=0, description="Default speaker device index")

    # GPU Configuration Placeholders
    ENABLE_GPU: bool = Field(default=True, description="Enable CUDA GPU acceleration")
    CUDA_VISIBLE_DEVICES: str = Field(default="0", description="CUDA visible devices index")
    DEFAULT_COMPUTE_TYPE: str = Field(default="float16", description="Default compute precision")
    MAX_VRAM_GB: float = Field(default=8.0, description="Maximum VRAM limit in GB")

    # Logging Settings
    LOG_LEVEL: str = Field(default="INFO", description="Console & file log severity level")
    LOG_FILE_PATH: Path = Field(default=PROJECT_ROOT / "logs" / "backend.log")

    # Local Client Endpoints
    LOCAL_WHISPER_ENDPOINT: str = Field(default="http://127.0.0.1:8001", description="Local Whisper server URI")
    LOCAL_LMSTUDIO_ENDPOINT: str = Field(default="http://127.0.0.1:1234/v1", description="LM Studio server URI")
    LOCAL_VLLM_ENDPOINT: str = Field(default="http://127.0.0.1:8000/v1", description="vLLM server URI")
    LOCAL_TTS_ENDPOINT: str = Field(default="http://127.0.0.1:8002", description="Local TTS server URI")

    def ensure_directories_exist(self) -> None:
        """Helper to guarantee all required project directories exist on system."""
        dirs = [
            self.MODELS_DIR, self.LOGS_DIR, self.TEMP_DIR, self.CONFIG_DIR,
            self.WHISPER_MODELS_DIR, self.WHISPER_LARGE_V3_MODEL_PATH,
            self.FISH_SPEECH_MODELS_DIR, self.FISH_SPEECH_MODEL_PATH,
            self.LLM_MODELS_DIR, self.VOICES_DIR, self.CACHE_DIR, self.DOWNLOADS_DIR, self.EMBEDDINGS_DIR
        ]
        for directory in dirs:
            directory.mkdir(parents=True, exist_ok=True)

# Instantiate singleton settings
settings = Settings()
settings.ensure_directories_exist()
