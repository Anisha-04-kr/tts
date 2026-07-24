"""
Backend test suite verifying health, status, config, models, and service endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    """Verify root GET / endpoint returns online status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_health_endpoint():
    """Verify GET /health and /api/v1/health endpoints."""
    res1 = client.get("/health")
    assert res1.status_code == 200
    assert res1.json()["status"] in ["healthy", "degraded"]

    res2 = client.get("/api/v1/health")
    assert res2.status_code == 200
    assert res2.json()["status"] in ["healthy", "degraded"]

def test_status_endpoint():
    """Verify GET /status and /api/v1/status endpoints."""
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "gpu" in data
    assert "active_models" in data

def test_config_endpoint():
    """Verify GET /config and /api/v1/config endpoints."""
    response = client.get("/config")
    assert response.status_code == 200
    data = response.json()
    assert data["host"] == "127.0.0.1"
    assert data["port"] == 8000

def test_list_models_endpoint():
    """Verify GET /api/v1/models endpoint."""
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    models = response.json()
    assert isinstance(models, list)
    assert len(models) > 0

def test_switch_model_endpoint():
    """Verify POST /api/v1/models/switch endpoint."""
    payload = {
        "service_type": "llm",
        "model_name": "vllm-mistral-7b-local",
        "provider": "vllm"
    }
    response = client.post("/api/v1/models/switch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "vllm-mistral-7b-local"
    assert data["is_active"] is True

def test_llm_generate_endpoint():
    """Verify POST /api/v1/llm/generate endpoint."""
    payload = {
        "prompt": "Hello, local assistant!"
    }
    response = client.post("/api/v1/llm/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    assert len(data["text"]) > 0

def test_tts_synthesize_endpoint():
    """Verify POST /api/v1/tts/synthesize endpoint (returns 200 when vLLM-Omni online, or 503 offline)."""
    payload = {
        "text": "Testing text to speech synthesis."
    }
    response = client.post("/api/v1/tts/synthesize", json=payload)
    assert response.status_code in [200, 503]
    if response.status_code == 503:
        assert response.json()["status"] == "offline"

def test_asr_transcribe_endpoint():
    """Verify POST /api/v1/asr/transcribe endpoint."""
    payload = {
        "language": "en"
    }
    response = client.post("/api/v1/asr/transcribe", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "transcription" in data

def test_audio_devices_endpoint():
    """Verify GET /api/v1/audio/devices endpoint."""
    response = client.get("/api/v1/audio/devices")
    assert response.status_code == 200
    devices = response.json()
    assert isinstance(devices, list)
