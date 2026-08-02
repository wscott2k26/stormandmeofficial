import { chatInitialState, chatReducer, filterPhaseOneActions, messageForChatError } from "./chatState";

describe("I AM chat state", () => {
  test("locks the composer while sending and clears it only after success", () => {
    const started = chatReducer({ ...chatInitialState, draft: "Hello" }, { type: "SEND_STARTED", startedAt: "2026-08-02T12:00:00Z" });
    expect(started.status).toBe("sending");
    expect(started.draft).toBe("Hello");

    const succeeded = chatReducer(started, {
      type: "SEND_SUCCEEDED",
      conversationId: "conversation-1",
      messages: [{ id: "1", role: "assistant", content: "Hi" }],
      actions: [],
    });
    expect(succeeded.status).toBe("idle");
    expect(succeeded.draft).toBe("");
  });

  test("preserves the draft after failure", () => {
    const state = chatReducer({ ...chatInitialState, draft: "Keep this" }, { type: "SEND_FAILED", error: "Unable" });
    expect(state.draft).toBe("Keep this");
    expect(state.status).toBe("error");
  });

  test("maps rate limits to the approved pause copy", () => {
    expect(messageForChatError({ status: 429 })).toBe("Please pause for a moment before sending another message.");
  });

  test("hides Phase 2 controls and keeps only deliberate safety actions", () => {
    expect(filterPhaseOneActions([
      { label: "Make a plan", type: "convert_plan" },
      { label: "Save insight", type: "save" },
      { label: "Report", type: "report" },
      { label: "Call 988", type: "call", route: "tel:988" },
      { label: "Open Safe Path", type: "route", route: "/safety" },
      { label: "Unsafe link", type: "call", route: "https://example.com" },
    ])).toEqual([
      { label: "Call 988", type: "call", route: "tel:988" },
      { label: "Open Safe Path", type: "route", route: "/iam/safety" },
    ]);
  });
});
