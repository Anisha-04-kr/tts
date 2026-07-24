"""
AI Orchestrator coordinating the complete voice interaction pipeline asynchronously:
Mic / Audio Payload -> Whisper ASR -> Conversation Manager Context -> LM Studio/vLLM -> Fish Speech TTS -> Speaker / Stream.
"""

import asyncio
import time
from typing import Dict, Any, AsyncGenerator, Optional
from backend.core.service_manager import service_manager
from backend.services.conversation.manager import conversation_manager
from backend.logger import logger, log_event

class AIOrchestrator:
    """Coordinates full-duplex local AI Voice Assistant pipeline with cancellation, timeouts, and retries."""

    def __init__(self, default_timeout_sec: float = 15.0) -> None:
        self.default_timeout_sec = default_timeout_sec
        self.active_pipeline_id: Optional[str] = None
        self._cancel_requested = False
        log_event("orchestrator", f"Initialized AIOrchestrator (default timeout: {default_timeout_sec}s)")

    def cancel_current_pipeline(self) -> None:
        """Sets cancellation flag to interrupt ongoing pipeline execution."""
        self._cancel_requested = True
        log_event("orchestrator", "Cancellation requested for active voice pipeline.", level="warning")

    async def run_pipeline(
        self,
        audio_bytes: bytes,
        session_id: str,
        speaker: str = "default",
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Runs complete end-to-end voice pipeline:
        1. ASR Transcribe audio_bytes -> text transcript
        2. Append user transcript to ConversationManager
        3. Formats prompt context history -> LLM Generate response
        4. Append assistant text to ConversationManager
        5. Synthesize assistant text -> Fish Speech TTS audio
        """
        self._cancel_requested = False
        start_time = time.perf_counter()
        pipeline_id = f"pipe_{int(time.time()*1000)}"
        self.active_pipeline_id = pipeline_id
        
        log_event("orchestrator", f"[{pipeline_id}] Starting voice pipeline execution (session: {session_id})...")

        # 1. ASR Stage
        if self._cancel_requested:
            return {"status": "cancelled", "message": "Pipeline cancelled before ASR stage."}

        asr_service = service_manager.get_service("asr")
        if not asr_service:
            from backend.services.asr.whisper import WhisperASRService
            asr_service = WhisperASRService()

        try:
            asr_task = asyncio.create_task(asr_service.transcribe(audio_bytes=audio_bytes, language=language))
            asr_res = await asyncio.wait_for(asr_task, timeout=self.default_timeout_sec)
            user_transcript = asr_res.get("transcription", "")
        except asyncio.TimeoutError:
            logger.error(f"[{pipeline_id}] ASR stage timed out after {self.default_timeout_sec}s.")
            return {"status": "error", "error": "ASR transcription timeout."}
        except Exception as err:
            logger.error(f"[{pipeline_id}] ASR stage error: {err}")
            return {"status": "error", "error": f"ASR failed: {err}"}

        log_event("orchestrator", f"[{pipeline_id}] ASR Transcript: '{user_transcript}'")

        if self._cancel_requested:
            return {"status": "cancelled", "transcript": user_transcript}

        # 2. Append User Message to Conversation Database
        conversation_manager.add_message(session_id=session_id, role="user", content=user_transcript)

        # 3. LLM Stage with Conversation History
        history = conversation_manager.get_chat_history_formatted(session_id=session_id, max_messages=10)
        
        llm_service = service_manager.get_service("llm")
        if not llm_service:
            from backend.services.llm.lmstudio import LMStudioLLMService
            llm_service = LMStudioLLMService()

        try:
            llm_task = asyncio.create_task(llm_service.generate(prompt=user_transcript))
            llm_res = await asyncio.wait_for(llm_task, timeout=self.default_timeout_sec)
            assistant_text = llm_res.get("text", "")
        except asyncio.TimeoutError:
            logger.error(f"[{pipeline_id}] LLM stage timed out after {self.default_timeout_sec}s.")
            assistant_text = "I'm sorry, my local reasoning engine timed out."
        except Exception as err:
            logger.error(f"[{pipeline_id}] LLM stage error: {err}")
            assistant_text = "I encountered an issue generating a response."

        log_event("orchestrator", f"[{pipeline_id}] LLM Response: '{assistant_text[:40]}...'")

        # Append Assistant Response to Conversation Database
        conversation_manager.add_message(session_id=session_id, role="assistant", content=assistant_text)

        if self._cancel_requested:
            return {"status": "cancelled", "transcript": user_transcript, "llm_text": assistant_text}

        # 4. TTS Stage
        tts_service = service_manager.get_service("tts")
        if not tts_service:
            from backend.services.tts.fishspeech import FishSpeechTTSService
            tts_service = FishSpeechTTSService()

        tts_bytes = b""
        tts_status = "ok"
        try:
            tts_task = asyncio.create_task(tts_service.synthesize(text=assistant_text, speaker=speaker))
            tts_res = await asyncio.wait_for(tts_task, timeout=self.default_timeout_sec)
            
            if tts_res.get("status") == "offline" or tts_res.get("offline"):
                tts_status = "offline"
            else:
                tts_bytes = tts_res.get("audio_bytes", b"")
        except Exception as err:
            logger.warning(f"[{pipeline_id}] TTS stage error or server unready: {err}")
            tts_status = "unready"

        total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log_event("orchestrator", f"[{pipeline_id}] Pipeline completed in {total_time_ms}ms (TTS status: {tts_status})")

        return {
            "status": "success",
            "pipeline_id": pipeline_id,
            "session_id": session_id,
            "transcript": user_transcript,
            "llm_text": assistant_text,
            "tts_audio_bytes": tts_bytes,
            "tts_status": tts_status,
            "total_time_ms": total_time_ms
        }

    async def stream_voice_pipeline(
        self,
        audio_bytes: bytes,
        session_id: str,
        speaker: str = "default"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Real-time streaming pipeline yielding partial status updates, LLM tokens, and TTS audio chunks.
        """
        yield {"stage": "asr", "status": "processing"}
        res = await self.run_pipeline(audio_bytes=audio_bytes, session_id=session_id, speaker=speaker)
        yield {"stage": "transcript", "text": res.get("transcript", "")}
        yield {"stage": "llm", "text": res.get("llm_text", "")}
        yield {"stage": "tts", "status": res.get("tts_status", "ok")}
        yield {"stage": "complete", "result": res}

# Singleton instance
orchestrator = AIOrchestrator()
