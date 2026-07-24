"""
LM Studio LLM Client Adapter for local OpenAI-compatible inference engine.
"""

import json
from typing import Dict, Any, List, AsyncGenerator, Optional
import httpx
from backend.config.settings import settings
from backend.logger import logger, log_event

class LMStudioAdapter:
    """Adapter interface communicating with local LM Studio server (configurable endpoint)."""

    def __init__(self, endpoint: Optional[str] = None, timeout: float = 30.0) -> None:
        self.endpoint = endpoint or settings.LOCAL_LMSTUDIO_ENDPOINT
        self.timeout = timeout
        log_event("lmstudio_adapter", f"Initialized LMStudioAdapter targeting local endpoint: {self.endpoint}")

    async def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3-8b-local",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> Dict[str, Any]:
        """
        Sends formatted chat conversation history to LM Studio `/chat/completions` API.
        """
        log_event("lmstudio_adapter", f"Sending completion request ({len(messages)} messages) to {self.endpoint}...")
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(
                    f"{self.endpoint}/chat/completions",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return {
                        "text": content,
                        "tokens_generated": data.get("usage", {}).get("completion_tokens", len(content.split())),
                        "model_used": model,
                        "provider_used": "lmstudio",
                        "mock": False
                    }
        except httpx.ConnectError:
            log_event("lmstudio_adapter", f"Local LM Studio engine at {self.endpoint} is offline. Using fallback response.", level="warning")
        except Exception as err:
            logger.error(f"[LMStudioAdapter] Error contacting LM Studio: {err}")

        # Fallback response when local engine server is offline
        last_user_msg = messages[-1]["content"] if messages else ""
        mock_text = f"LM Studio Local Assistant response to: '{last_user_msg}'"
        return {
            "text": mock_text,
            "tokens_generated": len(mock_text.split()),
            "model_used": model,
            "provider_used": "lmstudio_offline",
            "mock": True
        }

    async def stream_chat_tokens(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3-8b-local",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> AsyncGenerator[str, None]:
        """
        Streams generated text tokens from LM Studio using SSE stream.
        """
        log_event("lmstudio_adapter", f"Initiating token stream from {self.endpoint}...")
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }

        contacted = False
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream("POST", f"{self.endpoint}/chat/completions", json=payload) as res:
                    if res.status_code == 200:
                        contacted = True
                        async for line in res.aiter_lines():
                            if line.startswith("data: ") and line != "data: [DONE]":
                                try:
                                    data = json.loads(line[6:])
                                    token = data["choices"][0]["delta"].get("content", "")
                                    if token:
                                        yield token
                                except Exception:
                                    pass
        except Exception as err:
            logger.warning(f"[LMStudioAdapter] Token streaming error: {err}")

        if not contacted:
            for word in ["LM ", "Studio ", "offline ", "stream ", "response."]:
                yield word
