"""
FastAPI router for Conversation Management endpoints (/api/v1/conversation).
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Query, HTTPException, Response, Body
from backend.services.conversation.manager import conversation_manager
from backend.logger import log_event

router = APIRouter(prefix="/conversation", tags=["Conversation Management"])

class RenameSessionRequest(BaseModel):
    title: str

class ArchiveSessionRequest(BaseModel):
    archive: bool = True

@router.get("/sessions")
async def list_sessions(include_archived: bool = Query(False, description="Include archived sessions")) -> List[Dict[str, Any]]:
    """Lists all active and stored conversation sessions."""
    log_event("api", f"Received GET /api/v1/conversation/sessions request (include_archived={include_archived})")
    return conversation_manager.list_sessions(include_archived=include_archived)

@router.post("/sessions")
async def create_session(title: Optional[str] = Query("New Conversation")) -> Dict[str, Any]:
    """Creates a new conversation session."""
    log_event("api", f"Received POST /api/v1/conversation/sessions request (title: '{title}')")
    return conversation_manager.create_session(title=title)

@router.post("/sessions/import")
async def import_session(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """Imports a conversation session payload containing title and messages."""
    log_event("api", "Received POST /api/v1/conversation/sessions/import request")
    return conversation_manager.import_session(payload)

@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> Dict[str, Any]:
    """Retrieves session details and complete message history."""
    log_event("api", f"Received GET /api/v1/conversation/sessions/{session_id} request")
    sess = conversation_manager.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found.")
    return sess

@router.patch("/sessions/{session_id}")
async def rename_session(session_id: str, payload: RenameSessionRequest) -> Dict[str, Any]:
    """Renames an existing session title."""
    log_event("api", f"Received PATCH /api/v1/conversation/sessions/{session_id} request (title: '{payload.title}')")
    res = conversation_manager.rename_session(session_id, payload.title)
    if not res:
        raise HTTPException(status_code=404, detail="Session not found.")
    return res

@router.post("/sessions/{session_id}/archive")
async def archive_session(session_id: str, payload: ArchiveSessionRequest) -> Dict[str, Any]:
    """Archives or unarchives a conversation session."""
    log_event("api", f"Received POST /api/v1/conversation/sessions/{session_id}/archive request (archive={payload.archive})")
    res = conversation_manager.archive_session(session_id, payload.archive)
    if not res:
        raise HTTPException(status_code=404, detail="Session not found.")
    return res

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str) -> Dict[str, Any]:
    """Deletes session and all associated messages."""
    log_event("api", f"Received DELETE /api/v1/conversation/sessions/{session_id} request")
    conversation_manager.delete_session(session_id)
    return {"status": "deleted", "session_id": session_id}

@router.post("/sessions/{session_id}/reset")
async def reset_session(session_id: str) -> Dict[str, Any]:
    """Resets all messages in a session."""
    log_event("api", f"Received POST /api/v1/conversation/sessions/{session_id}/reset request")
    conversation_manager.reset_session(session_id)
    return {"status": "reset", "session_id": session_id}

@router.get("/sessions/{session_id}/export")
async def export_session(session_id: str, format: str = Query("markdown", description="Export format (markdown, json)")):
    """Exports session messages as Markdown or JSON file download."""
    log_event("api", f"Received GET /api/v1/conversation/sessions/{session_id}/export request (format: {format})")
    content = conversation_manager.export_conversation(session_id, format_type=format)
    media_type = "application/json" if format.lower() == "json" else "text/markdown"
    ext = "json" if format.lower() == "json" else "md"
    
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="conversation_{session_id[:8]}.{ext}"'}
    )

@router.get("/search")
async def search_conversations(q: str = Query(..., description="Query text to search across conversations")) -> List[Dict[str, Any]]:
    """Searches messages for query text match."""
    log_event("api", f"Received GET /api/v1/conversation/search request (query: '{q}')")
    return conversation_manager.search_conversations(q)
