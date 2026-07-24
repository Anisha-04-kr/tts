"""
FastAPI router for backend log viewer endpoint (/api/v1/logs).
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Query
from backend.config.settings import settings
from backend.logger import log_event

router = APIRouter(prefix="/logs", tags=["Logs Viewer"])

@router.get("")
async def get_logs(lines: int = Query(100, ge=1, le=1000, description="Number of recent log lines to read")) -> Dict[str, Any]:
    """
    Reads recent log entries directly from local `logs/backend.log` file.
    """
    log_event("api", f"Received GET /api/v1/logs request (lines: {lines})")
    log_file = settings.LOG_FILE_PATH

    if not log_file.exists():
        return {"log_file": str(log_file), "total_lines": 0, "logs": ["No log entries recorded yet."]}

    try:
        with open(log_file, "r", encoding="utf-8", errors="replace") as f:
            all_lines = f.readlines()
            recent_lines = [line.strip() for line in all_lines[-lines:]]
            return {
                "log_file": str(log_file),
                "total_lines": len(all_lines),
                "requested_lines": len(recent_lines),
                "logs": recent_lines
            }
    except Exception as err:
        return {"log_file": str(log_file), "error": f"Failed reading log file: {err}", "logs": []}
