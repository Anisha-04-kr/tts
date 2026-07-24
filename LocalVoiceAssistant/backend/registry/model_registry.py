"""
Local AI Model Registry tracking available models, active models, local paths, and metadata.
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from backend.config.settings import settings
from backend.logger import logger, log_event

class ModelRegistry:
    """Manages metadata, path validation, and dynamic runtime switching for local AI models."""

    def __init__(self) -> None:
        self.models: Dict[str, Dict[str, Any]] = {
            "whisper-large-v3": {
                "id": "whisper-large-v3",
                "name": "Whisper Large V3",
                "type": "asr",
                "provider": "whisper",
                "path": str(settings.WHISPER_LARGE_V3_MODEL_PATH),
                "local_path": str(settings.WHISPER_LARGE_V3_MODEL_PATH),
                "is_active": True,
                "is_installed": True,
                "description": "High-accuracy local automatic speech recognition model."
            },
            "qwen-asr": {
                "id": "qwen-asr",
                "name": "Qwen ASR (Local)",
                "type": "asr",
                "provider": "qwen",
                "path": str(settings.MODELS_DIR / "asr" / "qwen-asr"),
                "local_path": str(settings.MODELS_DIR / "asr" / "qwen-asr"),
                "is_active": False,
                "is_installed": False,
                "description": "Multilingual Qwen speech recognition model."
            },
            "llama3-8b-local": {
                "id": "llama3-8b-local",
                "name": "Meta Llama 3 8B Instruct",
                "type": "llm",
                "provider": "lmstudio",
                "path": "lmstudio://llama-3-8b-instruct",
                "local_path": "lmstudio://llama-3-8b-instruct",
                "is_active": True,
                "is_installed": True,
                "description": "General purpose local reasoning model."
            },
            "qwen-3.5-7b": {
                "id": "qwen-3.5-7b",
                "name": "Qwen 3.5 7B Instruct",
                "type": "llm",
                "provider": "lmstudio",
                "path": "lmstudio://qwen-3.5-7b",
                "local_path": "lmstudio://qwen-3.5-7b",
                "is_active": False,
                "is_installed": True,
                "description": "High performance local Qwen language model."
            },
            "medgemma-7b": {
                "id": "medgemma-7b",
                "name": "MedGemma 7B (Clinical AI)",
                "type": "llm",
                "provider": "lmstudio",
                "path": "lmstudio://medgemma-7b",
                "local_path": "lmstudio://medgemma-7b",
                "is_active": False,
                "is_installed": True,
                "description": "Specialized clinical & healthcare local knowledge model."
            },
            "vllm-mistral-7b-local": {
                "id": "vllm-mistral-7b-local",
                "name": "Mistral 7B Instruct (vLLM)",
                "type": "llm",
                "provider": "vllm",
                "path": "vllm://mistral-7b-instruct",
                "local_path": "vllm://mistral-7b-instruct",
                "is_active": False,
                "is_installed": True,
                "description": "High-throughput vLLM engine."
            },
            "fish-speech-s2-pro": {
                "id": "fish-speech-s2-pro",
                "name": "Fish Speech v1.5 S2 Pro",
                "type": "tts",
                "provider": "fishspeech",
                "path": str(settings.FISH_SPEECH_MODEL_PATH),
                "local_path": str(settings.FISH_SPEECH_MODEL_PATH),
                "is_active": True,
                "is_installed": True,
                "description": "Zero-shot voice cloning & text-to-speech engine."
            },
            "cosyvoice-300m": {
                "id": "cosyvoice-300m",
                "name": "CosyVoice 300M",
                "type": "tts",
                "provider": "cosyvoice",
                "path": str(settings.MODELS_DIR / "tts" / "cosyvoice"),
                "local_path": str(settings.MODELS_DIR / "tts" / "cosyvoice"),
                "is_active": False,
                "is_installed": False,
                "description": "Local natural multi-lingual speech synthesis model."
            }
        }
        log_event("model_registry", f"Initialized ModelRegistry with {len(self.models)} tracked local model definitions.")

    def list_models(
        self,
        service_type: Optional[str] = None,
        model_type: Optional[Any] = None
    ) -> List[Dict[str, Any]]:
        """Lists models, optionally filtered by service_type or model_type ('asr', 'llm', 'tts')."""
        items = list(self.models.values())
        target_filter = service_type or (model_type.value if hasattr(model_type, "value") else str(model_type) if model_type else None)

        if target_filter:
            items = [m for m in items if m["type"].lower() == str(target_filter).lower()]
        
        for m in items:
            p = m.get("path") or m.get("local_path", "")
            if p.startswith("lmstudio://") or p.startswith("vllm://"):
                m["is_installed"] = True
            else:
                m["is_installed"] = os.path.exists(p)
        return items

    def get_model(self, model_id: str) -> Optional[Dict[str, Any]]:
        """Returns model metadata dictionary for target model_id."""
        return self.models.get(model_id)

    def set_active_model(
        self,
        service_type: str,
        model_id: str,
        provider: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Hot-swaps the active model for a given service_type."""
        if model_id not in self.models:
            logger.warning(f"[ModelRegistry] Model '{model_id}' not found in registry.")
            return None

        target_type = service_type.lower()
        for mid, mdata in self.models.items():
            if mdata["type"].lower() == target_type:
                mdata["is_active"] = (mid == model_id)

        log_event("model_registry", f"Switched active '{service_type}' model to '{model_id}' (provider: {provider})")
        return self.models[model_id]

# Singleton instance
model_registry = ModelRegistry()
