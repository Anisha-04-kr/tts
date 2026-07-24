"""
Automated unit tests for ConversationManager and endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.conversation.manager import conversation_manager

client = TestClient(app)

def test_conversation_manager_crud():
    """Verify session creation, message appending, retrieval, search, and deletion."""
    session = conversation_manager.create_session(title="Test Unit Session")
    sid = session["session_id"]
    assert sid is not None

    msg = conversation_manager.add_message(sid, "user", "What is the capital of France?")
    assert msg["role"] == "user"

    conversation_manager.add_message(sid, "assistant", "The capital of France is Paris.")

    retrieved = conversation_manager.get_session(sid)
    assert retrieved is not None
    assert len(retrieved["messages"]) == 2

    # Search check
    search_res = conversation_manager.search_conversations("Paris")
    assert len(search_res) > 0

    # Delete check
    conversation_manager.delete_session(sid)
    assert conversation_manager.get_session(sid) is None

def test_conversation_api_endpoints():
    """Verify GET/POST /api/v1/conversation/sessions endpoints."""
    res1 = client.post("/api/v1/conversation/sessions?title=API+Session")
    assert res1.status_code == 200
    sess = res1.json()
    sid = sess["session_id"]

    res2 = client.get(f"/api/v1/conversation/sessions/{sid}")
    assert res2.status_code == 200

    res3 = client.get("/api/v1/conversation/sessions")
    assert res3.status_code == 200
    assert len(res3.json()) > 0
