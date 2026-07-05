import json
import logging
import os
from typing import AsyncIterator, Iterable

import httpx

logger = logging.getLogger("voxcode.llm")


class LocalLLMService:
    def __init__(self):
        self.base_url = os.getenv("MODEL_SERVER_URL", "http://localhost:8000/v1/chat/completions")
        self.timeout = float(os.getenv("MODEL_SERVER_TIMEOUT", "120"))
        self.max_tokens = int(os.getenv("MODEL_SERVER_MAX_TOKENS", "4096"))
        self.temperature = float(os.getenv("MODEL_SERVER_TEMPERATURE", "0.0"))

    async def stream_code(
        self,
        messages: list[dict[str, str]],
        fallback_text: str,
        repeat_penalty: float = 1.1,
    ) -> AsyncIterator[str]:
        state = {
            "inside_think": False,
            "inside_code": False,
            "has_code_block": False,
            "finished": False,
            "buffer": "",
        }
        stop_markers = ["Key Feature", "Dependencies:", "Notes:", "Explanation:", "### ", "```"]

        try:
            async for content in self._stream_raw_content(messages, repeat_penalty=repeat_penalty):
                for chunk in self._sanitize_code_content(content, state, stop_markers):
                    yield chunk

            if not state["has_code_block"] and state["buffer"] and not state["finished"]:
                yield state["buffer"]
        except Exception as exc:
            logger.error(f"LLM code stream error: {exc}")
            for chunk in self._fallback_chunks(fallback_text):
                yield chunk

    async def stream_text(
        self,
        messages: list[dict[str, str]],
        fallback_text: str,
        repeat_penalty: float = 1.05,
    ) -> AsyncIterator[str]:
        try:
            async for content in self._stream_raw_content(messages, repeat_penalty=repeat_penalty):
                if content:
                    yield content
        except Exception as exc:
            logger.error(f"LLM text stream error: {exc}")
            yield fallback_text

    async def _stream_raw_content(
        self,
        messages: list[dict[str, str]],
        repeat_penalty: float,
    ) -> AsyncIterator[str]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream(
                "POST",
                self.base_url,
                json={
                    "messages": messages,
                    "stream": True,
                    "max_tokens": self.max_tokens,
                    "temperature": self.temperature,
                    "repeat_penalty": repeat_penalty,
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    if "[DONE]" in line:
                        break
                    try:
                        chunk_json = json.loads(line[6:])
                        content = chunk_json["choices"][0]["delta"].get("content", "")
                    except Exception:
                        continue
                    if content:
                        yield content

    def _sanitize_code_content(
        self,
        content: str,
        state: dict,
        stop_markers: Iterable[str],
    ) -> list[str]:
        emitted: list[str] = []
        if state["finished"]:
            return emitted

        state["buffer"] += content

        if state["buffer"].count("```") >= 2 and not state["has_code_block"]:
            first = state["buffer"].find("```")
            second = state["buffer"].find("```", first + 3)
            code_block = state["buffer"][first + 3:second]
            code_lines = code_block.split("\n", 1)
            emitted.append(code_lines[1] if len(code_lines) > 1 else "")
            state["buffer"] = state["buffer"][second + 3:]
            state["has_code_block"] = True
            state["inside_code"] = False
            state["finished"] = True
            return emitted

        if "<think>" in state["buffer"]:
            state["inside_think"] = True
            state["buffer"] = state["buffer"].split("<think>")[-1]

        if "</think>" in state["buffer"]:
            state["inside_think"] = False
            state["buffer"] = state["buffer"].split("</think>")[-1]
            return emitted

        if state["inside_think"]:
            state["buffer"] = ""
            return emitted

        if "```" in state["buffer"]:
            if not state["inside_code"]:
                state["inside_code"] = True
                state["has_code_block"] = True
                parts = state["buffer"].split("```")
                code_part = parts[-1].split("\n", 1)
                state["buffer"] = code_part[1] if len(code_part) > 1 else ""
            else:
                state["finished"] = True
                state["inside_code"] = False
                return emitted

        if state["has_code_block"] and not state["inside_code"]:
            if any(marker in state["buffer"] for marker in stop_markers):
                state["finished"] = True
                return emitted

        if state["inside_code"]:
            emitted.append(state["buffer"])
            state["buffer"] = ""
            return emitted

        if not state["has_code_block"] and len(state["buffer"]) > 150:
            if any(marker in state["buffer"] for marker in stop_markers):
                state["finished"] = True
                return emitted
            emitted.append(state["buffer"])
            state["buffer"] = ""

        return emitted

    def _fallback_chunks(self, text: str, chunk_size: int = 120) -> list[str]:
        if not text:
            return []
        return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]


llm_service = LocalLLMService()
