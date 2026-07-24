"""
FastAPI WebSocket endpoint for full-duplex real-time audio streaming (/api/v1/ws/audio-stream).
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.logger import logger, log_event

router = APIRouter(prefix="/ws", tags=["WebSocket Streaming"])

@router.websocket("/audio-stream")
async def websocket_audio_stream(websocket: WebSocket):
    """
    Prepared full-duplex WebSocket endpoint for receiving continuous input mic audio and returning synthesized speech.
    """
    await websocket.accept()
    log_event("websocket", "WebSocket client connected for streaming audio interface.")

    try:
        while True:
            # Receive audio frame bytes or message
            data = await websocket.receive_bytes()
            log_event("websocket", f"Received {len(data)} raw audio frame bytes over WebSocket.")
            
            # Echo structured frame back as mock pipeline response
            response_frame = b"ACK_" + data[:16]
            await websocket.send_bytes(response_frame)
    except WebSocketDisconnect:
        log_event("websocket", "WebSocket client disconnected gracefully.")
    except Exception as err:
        logger.error(f"[WebSocket] Audio stream error: {err}")
        await websocket.close()
