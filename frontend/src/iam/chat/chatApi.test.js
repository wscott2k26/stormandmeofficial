import fs from "fs";
import path from "path";
import { createConversation, deriveConversationTitle, sendChatMessage } from "./chatApi";

describe("I AM chat API contract", () => {
  test("derives a trimmed 60-character title", () => {
    expect(deriveConversationTitle("   I need help changing careers after a layoff   "))
      .toBe("I need help changing careers after a layoff");
    expect(deriveConversationTitle("x".repeat(100))).toHaveLength(60);
  });

  test("creates the exact standard conversation payload", async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: "conversation-1" }, error: null });
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    const client = { from: jest.fn(() => ({ insert })) };

    await createConversation("user-1", client);
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-1",
      title: "New conversation",
      area: "general",
      privacy_mode: "standard",
    });
  });

  test("private chat invokes the function without creating a database conversation", async () => {
    const client = {
      from: jest.fn(),
      functions: {
        invoke: jest.fn().mockResolvedValue({
          data: { text: "response text", safetyTier: "normal", actions: [] },
          error: null,
        }),
      },
    };

    const result = await sendChatMessage({
      userId: "user-1",
      message: "Hello",
      privacyMode: "private",
      client,
    });

    expect(client.from).not.toHaveBeenCalled();
    expect(client.functions.invoke).toHaveBeenCalledWith("chat", {
      body: expect.objectContaining({ message: "Hello", privacyMode: "private" }),
    });
    expect(result).toEqual({
      text: "response text",
      safetyTier: "normal",
      actions: [],
      conversationId: expect.any(String),
      messages: null,
    });
  });

  test("keeps OpenAI and service-role work out of browser source", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "src/iam/chat/chatApi.js"), "utf8");
    expect(source).toContain('client.functions.invoke("chat"');
    expect(source).not.toContain("OPENAI_API_KEY");
    expect(source).not.toContain("SERVICE_ROLE");
  });
});
