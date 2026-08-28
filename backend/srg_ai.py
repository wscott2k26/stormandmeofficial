import json
import os
import re
from typing import Any, Dict, List
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
MODEL = os.environ.get("SRG_OPENAI_MODEL", "gpt-5.6-luna")
MAX_OUTPUT_TOKENS = 700
REQUEST_TIMEOUT_SECONDS = 12

_SECRET_KEY_RE = re.compile(
    r"(password|passwd|pin|ssn|socialsecurity|routing|accountnumber|cardnumber|cvv|cvc|"
    r"verificationcode|securitycode|apikey|api_key|token|authorization)",
    re.IGNORECASE,
)
_SSN_RE = re.compile(r"(?<!\d)\d{3}[- ]?\d{2}[- ]?\d{4}(?!\d)")
_LONG_DIGIT_RE = re.compile(r"(?<!\d)(?:\d[ -]?){13,19}(?!\d)")


class SRGCoachError(RuntimeError):
    pass


def _money(value: Any) -> float:
    try:
        return max(0.0, min(float(value or 0), 100_000_000.0))
    except (TypeError, ValueError):
        return 0.0


def _short(value: Any, limit: int = 120) -> str:
    return str(value or "").strip()[:limit]


def _sanitize_message(message: Any) -> str:
    text = _short(message, 2500)
    if not text:
        raise SRGCoachError("A coaching message is required")
    if _SSN_RE.search(text) or _LONG_DIGIT_RE.search(text):
        raise SRGCoachError("Sensitive identifiers are not accepted")
    return text


def _sanitize_state(raw: Any) -> Dict[str, Any]:
    if not isinstance(raw, dict):
        return {}

    state: Dict[str, Any] = {
        "stage": _short(raw.get("stage"), 20) or "recover",
        "income": _money(raw.get("income")),
        "buffer": _money(raw.get("buffer")),
        "goal": _short(raw.get("goal"), 300),
    }

    bills: List[Dict[str, Any]] = []
    for item in (raw.get("bills") or [])[:40]:
        if not isinstance(item, dict):
            continue
        bills.append({
            "name": _short(item.get("name"), 60),
            "amount": _money(item.get("amount")),
            "due": int(item.get("due") or 0) if str(item.get("due") or "").isdigit() else None,
            "paid": bool(item.get("paid")),
        })
    state["bills"] = bills

    cards: List[Dict[str, Any]] = []
    for item in (raw.get("cards") or [])[:30]:
        if not isinstance(item, dict):
            continue
        cards.append({
            "name": _short(item.get("name"), 60),
            "balance": _money(item.get("balance")),
            "limit": _money(item.get("limit")),
        })
    state["cards"] = cards

    hustles: List[Dict[str, Any]] = []
    for item in (raw.get("hustles") or [])[:20]:
        if not isinstance(item, dict):
            continue
        hustles.append({"id": _short(item.get("id"), 40), "name": _short(item.get("name"), 60)})
    state["hustles"] = hustles

    reminders: List[Dict[str, Any]] = []
    for item in (raw.get("upcomingReminders") or [])[:20]:
        if not isinstance(item, dict):
            continue
        reminders.append({
            "title": _short(item.get("title"), 80),
            "type": _short(item.get("type"), 30),
            "date": _short(item.get("date"), 40),
        })
    state["upcomingReminders"] = reminders

    return state


def _contains_secret_keys(value: Any, depth: int = 0) -> bool:
    if depth > 6:
        return False
    if isinstance(value, dict):
        for key, item in value.items():
            if _SECRET_KEY_RE.search(str(key)):
                return True
            if _contains_secret_keys(item, depth + 1):
                return True
    elif isinstance(value, list):
        return any(_contains_secret_keys(item, depth + 1) for item in value[:80])
    return False


def build_prompt(message: str, state: Dict[str, Any]) -> str:
    snapshot = json.dumps(state, separators=(",", ":"), ensure_ascii=False)
    return (
        "You are SRG Recovery Coach inside Survive Recover Grow, a financial-recovery education app. "
        "Your job is to reduce overwhelm and help the user choose a small, realistic next move. "
        "Prioritize essential cash-flow stability first (housing, utilities, food, transportation, insurance), "
        "then debt and credit improvement, then savings and growth. "
        "Use only the supplied user-entered snapshot; never invent balances, scores, creditors, deadlines, or income. "
        "Never ask for or expose passwords, PINs, SSNs, full bank/card/account numbers, routing numbers, CVVs, or verification codes. "
        "Never guarantee a credit-score increase, debt result, income result, approval, investment result, or timeline. "
        "Never encourage disputing accurate credit information or fabricating identity theft, fraud, or errors. "
        "You may suggest checking a report for possible inaccuracies and gathering factual evidence before a legitimate dispute. "
        "Never initiate payments, transfers, purchases, account openings, disputes, or external actions. The user must approve and perform actions. "
        "Side-hustle advice must be legitimate, realistic, and framed as options to test, never guaranteed earnings. "
        "Avoid shaming language. Keep the plan concise and practical. "
        "Return ONLY valid JSON with this schema: "
        '{"headline":"string","summary":"string","actions":[{"title":"string","why":"string","priority":1}],'
        '"side_hustle_angle":"string or empty","disclaimer":"string"}. '
        "Return 3 to 5 actions. priority is 1 (highest) through 5. "
        "The disclaimer must say the guidance is educational and the user controls every financial action.\n\n"
        f"User message: {message}\n"
        f"User-entered snapshot: {snapshot}"
    )


def _extract_output_text(data: Dict[str, Any]) -> str:
    if not isinstance(data, dict):
        raise SRGCoachError("AI returned invalid data")
    direct = data.get("output_text")
    if isinstance(direct, str) and direct.strip():
        return direct.strip()
    for item in data.get("output", []):
        if not isinstance(item, dict) or item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if isinstance(content, dict) and content.get("type") == "output_text":
                text = content.get("text")
                if isinstance(text, str) and text.strip():
                    return text.strip()
    raise SRGCoachError("AI returned no text")


def _validate(value: Any) -> Dict[str, Any]:
    if not isinstance(value, dict):
        raise SRGCoachError("AI returned an invalid response")

    headline = _short(value.get("headline"), 140)
    summary = _short(value.get("summary"), 900)
    if not headline or not summary:
        raise SRGCoachError("AI response missing required fields")

    actions = []
    for item in (value.get("actions") or [])[:5]:
        if not isinstance(item, dict):
            continue
        title = _short(item.get("title"), 140)
        why = _short(item.get("why"), 420)
        if not title or not why:
            continue
        try:
            priority = int(item.get("priority", 3))
        except (TypeError, ValueError):
            priority = 3
        actions.append({"title": title, "why": why, "priority": max(1, min(5, priority))})

    if len(actions) < 3:
        raise SRGCoachError("AI response had too few actions")

    return {
        "plan": {
            "headline": headline,
            "summary": summary,
            "actions": actions,
            "side_hustle_angle": _short(value.get("side_hustle_angle"), 500),
            "disclaimer": _short(value.get("disclaimer"), 420)
                or "Educational guidance only. You control every financial action.",
        },
        "source": "cloud-ai",
        "model": MODEL,
    }


def generate_srg_coaching(payload: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(payload, dict):
        raise SRGCoachError("Invalid request")
    if _contains_secret_keys(payload):
        raise SRGCoachError("Sensitive fields are not accepted")

    message = _sanitize_message(payload.get("message"))
    state = _sanitize_state(payload.get("state"))
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise SRGCoachError("SRG AI is not configured")

    body = {
        "model": MODEL,
        "input": build_prompt(message, state),
        "max_output_tokens": MAX_OUTPUT_TOKENS,
    }
    req = Request(
        OPENAI_RESPONSES_URL,
        data=json.dumps(body).encode("utf-8"),
        method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            raw = response.read()
    except HTTPError as exc:
        raise SRGCoachError(f"AI unavailable ({exc.code})") from exc
    except (URLError, TimeoutError, OSError) as exc:
        raise SRGCoachError("AI unavailable") from exc

    try:
        data = json.loads(raw.decode("utf-8"))
        parsed = json.loads(_extract_output_text(data))
    except (UnicodeDecodeError, json.JSONDecodeError, TypeError, ValueError) as exc:
        raise SRGCoachError("AI returned invalid data") from exc

    return _validate(parsed)


def srg_configuration_status() -> Dict[str, Any]:
    return {
        "ok": True,
        "configured": bool(os.environ.get("OPENAI_API_KEY", "").strip()),
        "model": MODEL,
        "guardrails": {
            "no_secrets": True,
            "no_false_disputes": True,
            "no_guarantees": True,
            "no_autonomous_money_movement": True,
        },
    }
