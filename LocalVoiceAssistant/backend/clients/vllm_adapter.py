"""
vLLM Client Adapter for local high-throughput OpenAI-compatible inference server.
"""

import json
from typing import Dict, Any, List, AsyncGenerator, Optional
import httpx
from backend.config.settings import settings
from backend.logger import logger, log_event

class VLLMAdapter:
    """Adapter interface communicating with local vLLM server (configurable endpoint)."""

    def __init__(self, endpoint: Optional[str] = None, timeout: float = 30.0) -> None:
        self.endpoint = endpoint or settings.LOCAL_VLLM_ENDPOINT
        self.timeout = timeout
        log_event("vllm_adapter", f"Initialized VLLMAdapter targeting local endpoint: {self.endpoint}")

    async def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "vllm-mistral-7b-local",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> Dict[str, Any]:
        """
        Sends chat conversation history to vLLM `/chat/completions` API.
        """
        log_event("vllm_adapter", f"Sending vLLM completion request ({len(messages)} messages) to {self.endpoint}...")
        
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
                        "provider_used": "vllm",
                        "mock": False
                    }
        except httpx.ConnectError:
            log_event("vllm_adapter", f"Local vLLM engine at {self.endpoint} is offline. Using fallback response.", level="warning")
        except Exception as err:
            logger.error(f"[VLLMAdapter] Error contacting vLLM: {err}")

        last_user_msg = messages[-1]["content"] if messages else ""
        mock_text = f"vLLM Local Assistant response to: '{last_user_msg}'"
        return {
            "text": mock_text,
            "tokens_generated": len(mock_text.split()),
            "model_used": model,
            "provider_used": "vllm_offline",
            "mock": True
        }

    async def stream_chat_tokens(
        self,
        messages: List[Dict[str, str]],
        model: str = "vllm-mistral-7b-local",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> AsyncGenerator[str, None]:
        """
        Streams generated text tokens from vLLM using SSE stream.
        """
        log_event("vllm_adapter", f"Initiating vLLM token stream from {self.endpoint}...")
        
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
            logger.warning(f"[VLLMAdapter] Token streaming error: {err}")

        if not contacted:
            for word in ["vLLM ", "offline ", "stream ", "response."]:
                yield word
