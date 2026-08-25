import json
import os
from typing import Any, Dict
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
MODEL = "gpt-5.6-luna"
MAX_OUTPUT_TOKENS = 260
REQUEST_TIMEOUT_SECONDS = 8

_BLOCKED_KEYS = {
    "password",
    "passwd",
    "email",
    "emailaddress",
    "paymenttoken",
    "purchasetoken",
    "purchasepayload",
    "billingpayload",
    "deviceid",
    "advertisingid",
    "gaid",
    "androidid",
    "authorization",
    "apikey",
    "api_key",
    "token",
}
_ALLOWED_ROOT_KEYS = {"gameId", "mode", "question", "state", "knownRule"}
_ALLOWED_CONFIDENCE = {"low", "medium", "high"}


class HoldWiseCoachError(RuntimeError):
    pass


def _normalized_key(value: str) -> str:
    return "".join(ch for ch in value.lower() if ch.isalnum() or ch == "_")


def _sanitize_value(value: Any, depth: int = 0) -> Any:
    if depth > 6:
        return None
    if isinstance(value, dict):
        cleaned: Dict[str, Any] = {}
        for key, item in value.items():
            key_text = str(key)
            if _normalized_key(key_text) in _BLOCKED_KEYS:
                continue
            safe = _sanitize_value(item, depth + 1)
            if safe is not None:
                cleaned[key_text[:64]] = safe
        return cleaned
    if isinstance(value, list):
        return [_sanitize_value(item, depth + 1) for item in value[:64]]
    if isinstance(value, str):
        return value[:1200]
    if isinstance(value, (int, float, bool)) or value is None:
        return value
    return str(value)[:1200]


def sanitize_context(payload: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(payload, dict):
        raise HoldWiseCoachError("Invalid coaching request")
    cleaned: Dict[str, Any] = {}
    for key in _ALLOWED_ROOT_KEYS:
        if key in payload:
            value = _sanitize_value(payload[key])
            if value is not None:
                cleaned[key] = value
    question = str(cleaned.get("question", "")).strip()
    if not question:
        raise HoldWiseCoachError("A coaching question is required")
    cleaned["question"] = question[:600]
    cleaned["gameId"] = str(cleaned.get("gameId", "unknown"))[:80]
    cleaned["mode"] = str(cleaned.get("mode", "practice"))[:40]
    return cleaned


def build_coach_prompt(payload: Dict[str, Any]) -> str:
    clean = sanitize_context(payload)
    context_json = json.dumps(clean, separators=(",", ":"), ensure_ascii=False)
    return (
        "You are HoldWise AI Coach, an educational card-game strategy tutor. "
        "Help users learn rules, probabilities, and decision-making for simulated practice only. "
        "Do not encourage real-money gambling, wagering, chasing losses, or financial risk. "
        "Use only the supplied game state; never invent hidden cards or future outcomes. "
        "If a recommended move is not supported by the supplied legal moves, explain the concept without naming an illegal move. "
        "Return ONLY valid JSON with keys answer, recommendedMove, confidence. "
        "answer must be concise plain English (max 110 words). recommendedMove may be null. "
        "confidence must be low, medium, or high.\n\n"
        f"Learning context: {context_json}"
    )


def extract_output_text(data: Dict[str, Any]) -> str:
    for item in data.get("output", []) if isinstance(data, dict) else []:
        if not isinstance(item, dict) or item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if isinstance(content, dict) and content.get("type") == "output_text":
                text = content.get("text")
                if isinstance(text, str) and text.strip():
                    return text.strip()
    fallback = data.get("output_text") if isinstance(data, dict) else None
    if isinstance(fallback, str) and fallback.strip():
        return fallback.strip()
    raise HoldWiseCoachError("AI service returned no coaching text")


def validate_coach_response(value: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(value, dict):
        raise HoldWiseCoachError("AI service returned an invalid response")
    answer = value.get("answer")
    if not isinstance(answer, str) or not answer.strip():
        raise HoldWiseCoachError("AI service returned an invalid response")
    recommended = value.get("recommendedMove")
    if recommended is not None and not isinstance(recommended, str):
        recommended = None
    confidence = str(value.get("confidence", "medium")).lower()
    if confidence not in _ALLOWED_CONFIDENCE:
        confidence = "medium"
    return {
        "answer": answer.strip()[:1400],
        "recommendedMove": recommended.strip()[:80] if isinstance(recommended, str) and recommended.strip() else None,
        "confidence": confidence,
        "source": "cloud-ai",
    }


def generate_coaching(payload: Dict[str, Any]) -> Dict[str, Any]:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise HoldWiseCoachError("HoldWise AI Coach is not configured")

    prompt = build_coach_prompt(payload)
    body = {
        "model": MODEL,
        "input": prompt,
        "max_output_tokens": MAX_OUTPUT_TOKENS,
    }
    request = Request(
        OPENAI_RESPONSES_URL,
        data=json.dumps(body).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            raw = response.read()
    except HTTPError as exc:
        raise HoldWiseCoachError(f"AI service unavailable ({exc.code})") from exc
    except (URLError, TimeoutError, OSError) as exc:
        raise HoldWiseCoachError("AI service unavailable") from exc

    try:
        response_data = json.loads(raw.decode("utf-8"))
        text = extract_output_text(response_data)
        parsed = json.loads(text)
    except (UnicodeDecodeError, json.JSONDecodeError, TypeError, ValueError) as exc:
        raise HoldWiseCoachError("AI service returned an invalid response") from exc

    return validate_coach_response(parsed)


def configuration_status() -> Dict[str, Any]:
    return {
        "ok": True,
        "configured": bool(os.environ.get("OPENAI_API_KEY", "").strip()),
        "model": MODEL,
    }
