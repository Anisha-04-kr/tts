"""
Automated unit tests for LLM services, adapters, and endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.clients.lmstudio_adapter import LMStudioAdapter
from backend.clients.vllm_adapter import VLLMAdapter

client = TestClient(app)

def test_lmstudio_adapter_initialization():
    """Verify LMStudioAdapter initializes cleanly."""
    adapter = LMStudioAdapter()
    assert adapter.endpoint is not None

def test_vllm_adapter_initialization():
    """Verify VLLMAdapter initializes cleanly."""
    adapter = VLLMAdapter()
    assert adapter.endpoint is not None

def test_llm_generate_endpoint():
    """Verify POST /api/v1/llm/generate endpoint."""
    payload = {
        "prompt": "What is the distance to the moon?",
        "temperature": 0.7,
        "max_tokens": 100
    }
    response = client.post("/api/v1/llm/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    assert data["tokens_generated"] > 0
