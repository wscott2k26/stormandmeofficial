import json
import os
from unittest.mock import patch

import pytest

from holdwise_ai import (
    HoldWiseCoachError,
    build_coach_prompt,
    extract_output_text,
    generate_coaching,
    sanitize_context,
    validate_coach_response,
)


def test_sanitize_context_removes_sensitive_fields_recursively():
    payload = {
        "gameId": "blackjack",
        "mode": "practice",
        "question": "Why stand?",
        "email": "player@example.com",
        "paymentToken": "secret",
        "state": {
            "player": ["10H", "KS"],
            "dealer": ["6S"],
            "legalMoves": ["stand", "hit"],
            "deviceId": "abc",
            "purchasePayload": "private",
        },
    }
    clean = sanitize_context(payload)
    assert clean["gameId"] == "blackjack"
    assert clean["state"]["player"] == ["10H", "KS"]
    assert "email" not in clean
    assert "paymentToken" not in clean
    assert "deviceId" not in clean["state"]
    assert "purchasePayload" not in clean["state"]


def test_build_prompt_frames_learning_not_real_money_gambling():
    prompt = build_coach_prompt({
        "gameId": "blackjack",
        "mode": "practice",
        "question": "Why stand?",
        "state": {"legalMoves": ["stand", "hit"]},
    })
    lower = prompt.lower()
    assert "learning" in lower
    assert "real-money" in lower or "real money" in lower
    assert "json" in lower


def test_extract_output_text_reads_responses_api_message_content():
    data = {
        "output": [
            {
                "type": "message",
                "content": [{"type": "output_text", "text": '{"answer":"Stand."}'}],
            }
        ]
    }
    assert extract_output_text(data) == '{"answer":"Stand."}'


def test_validate_coach_response_rejects_missing_answer():
    with pytest.raises(HoldWiseCoachError):
        validate_coach_response({"recommendedMove": "stand"})


def test_validate_coach_response_normalizes_safe_shape():
    result = validate_coach_response({
        "answer": "Standing protects a strong made hand.",
        "recommendedMove": "stand",
        "confidence": "HIGH",
        "extra": "ignored",
    })
    assert result == {
        "answer": "Standing protects a strong made hand.",
        "recommendedMove": "stand",
        "confidence": "high",
        "source": "cloud-ai",
    }


def test_generate_coaching_requires_server_key():
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(HoldWiseCoachError, match="not configured"):
            generate_coaching({"gameId": "blackjack", "question": "Why stand?"})


def test_generate_coaching_parses_model_json_without_exposing_key():
    fake_response = {
        "output": [{
            "type": "message",
            "content": [{
                "type": "output_text",
                "text": json.dumps({
                    "answer": "Standing is correct because 20 is already a very strong total.",
                    "recommendedMove": "stand",
                    "confidence": "high",
                }),
            }],
        }]
    }

    class FakeHTTPResponse:
        def __enter__(self):
            return self
        def __exit__(self, exc_type, exc, tb):
            return False
        def read(self):
            return json.dumps(fake_response).encode("utf-8")

    with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}, clear=True):
        with patch("holdwise_ai.urlopen", return_value=FakeHTTPResponse()) as opener:
            result = generate_coaching({
                "gameId": "blackjack",
                "mode": "practice",
                "question": "Why stand?",
                "state": {"player": ["10H", "KS"], "dealer": ["6S"], "legalMoves": ["stand", "hit"]},
            })

    assert result["source"] == "cloud-ai"
    assert result["recommendedMove"] == "stand"
    request = opener.call_args.args[0]
    body = json.loads(request.data.decode("utf-8"))
    assert body["model"] == "gpt-5.6-luna"
    assert "test-key" not in body["input"]
    assert body["max_output_tokens"] <= 300
