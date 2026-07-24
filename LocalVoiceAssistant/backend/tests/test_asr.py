"""
Automated unit tests for Whisper ASR service and endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.asr.whisper import WhisperASRService

client = TestClient(app)

def test_whisper_service_initialization():
    """Verify WhisperASRService initializes and validates model files cleanly."""
    service = WhisperASRService(model_name="whisper-large-v3")
    assert service.model_name == "whisper-large-v3"
    assert service.is_active is False

def test_asr_transcribe_wav():
    """Verify POST /api/v1/asr/transcribe endpoint."""
    payload = {
        "audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
        "language": "en"
    }
    response = client.post("/api/v1/asr/transcribe", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "transcription" in data
    assert "confidence" in data
