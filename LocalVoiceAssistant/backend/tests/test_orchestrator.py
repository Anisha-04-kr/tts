"""
Automated unit tests for AIOrchestrator pipeline execution and cancellation.
"""

import pytest
from backend.core.orchestrator import orchestrator
from backend.services.conversation.manager import conversation_manager

@pytest.mark.asyncio
async def test_orchestrator_pipeline_execution():
    """Verify AIOrchestrator runs end-to-end voice pipeline cleanly."""
    session = conversation_manager.create_session(title="Orchestrator Test Session")
    sid = session["session_id"]

    mock_audio = b"RIFF" + b"\x00" * 100
    res = await orchestrator.run_pipeline(audio_bytes=mock_audio, session_id=sid)
    
    assert res["status"] == "success"
    assert "transcript" in res
    assert "llm_text" in res
    assert "total_time_ms" in res

    # Verify messages saved to database
    sess = conversation_manager.get_session(sid)
    assert len(sess["messages"]) == 2
