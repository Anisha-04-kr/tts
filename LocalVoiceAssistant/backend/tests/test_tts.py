"""
Automated unit and integration tests for Phase 3 Local TTS Service (Fish Speech S2 Pro + vLLM-Omni).
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_tts_health_endpoint():
    """Verify GET /api/v1/tts/health returns comprehensive diagnostics & GPU info."""
    response = client.get("/api/v1/tts/health")
    assert response.status_code == 200
    data = response.json()
    
    # Requirement 7 & 8 Assertions
    assert "status" in data
    assert "fish_speech_version" in data
    assert "vllm_version" in data
    assert "model_path" in data
    assert "model_loaded" in data
    assert "vllm_omni_reachable" in data
    assert "gpu" in data
    
    gpu = data["gpu"]
    assert "cuda_available" in gpu
    assert "gpu_name" in gpu
    assert "vram_used_gb" in gpu
    assert "vram_total_gb" in gpu
    assert "inference_device" in gpu

def test_tts_models_endpoint():
    """Verify GET /api/v1/tts/models lists registered Fish Speech models."""
    response = client.get("/api/v1/tts/models")
    assert response.status_code == 200
    models = response.json()
    assert isinstance(models, list)
    assert any(m["id"] == "fish-speech-s2-pro" for m in models)

def test_tts_restart_endpoint():
    """Verify POST /api/v1/tts/restart rebinds the service and client."""
    response = client.post("/api/v1/tts/restart")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "restarted"

def test_tts_stop_endpoint():
    """Verify POST /api/v1/tts/stop stops the service."""
    response = client.post("/api/v1/tts/stop")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "stopped"

def test_tts_synthesize_offline_error():
    """
    Verify POST /api/v1/tts/synthesize returns HTTP 503 JSON offline error response when vLLM-Omni is offline.
    Never generates fake WAV audio.
    """
    payload = {
        "text": "Testing UTF-8 speech synthesis parameter handling: 😃 Hola, Bonjour, 你好",
        "speaker": "default",
        "speed": 1.0,
        "pitch": 0.0,
        "sample_rate": 24000
    }
    response = client.post("/api/v1/tts/synthesize", json=payload)
    
    # Requirement 4 assertion: return HTTP 503 with status: offline
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "offline"
    assert data["message"] == "Fish Speech server is unavailable."

def test_tts_synthesize_json_request():
    """Verify POST /api/v1/tts/synthesize when vLLM-Omni is unready returns structured JSON error."""
    payload = {
        "text": "Multi-language test: Das ist ein Test.",
        "return_json": True
    }
    response = client.post("/api/v1/tts/synthesize", json=payload)
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "offline"
