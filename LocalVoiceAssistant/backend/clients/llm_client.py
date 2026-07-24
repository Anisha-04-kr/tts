"""
Unified LLM Client using Adapter Pattern to communicate with LM Studio or vLLM.
"""

from typing import Dict, Any, List, AsyncGenerator, Optional
from backend.clients.lmstudio_adapter import LMStudioAdapter
from backend.clients.vllm_adapter import VLLMAdapter
from backend.logger import log_event

class LLMClient:
    """Delegates completion and streaming requests to provider-specific adapters (LM Studio / vLLM)."""

    def __init__(self, provider: str = "lmstudio") -> None:
        self.provider = provider.lower()
        self.lmstudio_adapter = LMStudioAdapter()
        self.vllm_adapter = VLLMAdapter()
        log_event("llm_client", f"Initialized unified LLMClient (active provider: '{self.provider}')")

    async def generate_chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3-8b-local",
        temperature: float = 0.7,
        max_tokens: int = 256,
        provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends formatted chat conversation history to the target adapter.
        """
        target = (provider or self.provider).lower()
        if target == "vllm":
            return await self.vllm_adapter.generate_chat_completion(messages, model=model, temperature=temperature, max_tokens=max_tokens)
        else:
            return await self.lmstudio_adapter.generate_chat_completion(messages, model=model, temperature=temperature, max_tokens=max_tokens)

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3-8b-local",
        temperature: float = 0.7,
        max_tokens: int = 256,
        provider: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Streams tokens from the target adapter.
        """
        target = (provider or self.provider).lower()
        if target == "vllm":
            async for token in self.vllm_adapter.stream_chat_tokens(messages, model=model, temperature=temperature, max_tokens=max_tokens):
                yield token
        else:
            async for token in self.lmstudio_adapter.stream_chat_tokens(messages, model=model, temperature=temperature, max_tokens=max_tokens):
                yield token

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "You are a local voice assistant.",
        model: str = "llama3-8b-local",
        temperature: float = 0.7,
        max_tokens: int = 256,
        provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """Formats single prompt as chat message list and routes to adapter."""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        return await self.generate_chat(messages, model=model, temperature=temperature, max_tokens=max_tokens, provider=provider)

    async def stream_tokens(
        self,
        prompt: str,
        system_prompt: str = "You are a local voice assistant.",
        model: str = "llama3-8b-local",
        temperature: float = 0.7,
        max_tokens: int = 256,
        provider: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Formats single prompt as chat message list and streams tokens via adapter."""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        async for token in self.stream_chat(messages, model=model, temperature=temperature, max_tokens=max_tokens, provider=provider):
            yield token
