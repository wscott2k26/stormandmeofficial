import fs from "fs";
import path from "path";
import { createConversation, deriveConversationTitle, sendChatMessage } from "./chatApi";

function createStandardClient({ invokeResult, messageResult = { data: [], error: null } }) {
  const createSingle = jest.fn().mockResolvedValue({ data: { id: "conversation-1" }, error: null });
  const createSelect = jest.fn(() => ({ single: createSingle }));
  const insert = jest.fn(() => ({ select: createSelect }));

  const deleteLastEq = jest.fn().mockResolvedValue({ error: null });
  const deleteFirstEq = jest.fn(() => ({ eq: deleteLastEq }));
  const remove = jest.fn(() => ({ eq: deleteFirstEq }));

  const updateLastEq = jest.fn().mockResolvedValue({ error: null });
  const updateFirstEq = jest.fn(() => ({ eq: updateLastEq }));
  const update = jest.fn(() => ({ eq: updateFirstEq }));

  const messageOrder = jest.fn().mockResolvedValue(messageResult);
  const messageEq = jest.fn(() => ({ order: messageOrder }));
  const messageSelect = jest.fn(() => ({ eq: messageEq }));

  const conversations = { insert, delete: remove, update };
  const messages = { select: messageSelect };
  const client = {
    from: jest.fn((table) => table === "messages" ? messages : conversations),
    functions: { invoke: jest.fn().mockResolvedValue(invokeResult) },
  };

  return { client, insert, remove, update };
}

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

  test("cleans up a newly created blank conversation after an explicit function failure", async () => {
    const { client, remove } = createStandardClient({
      invokeResult: { data: null, error: { context: { status: 429 } } },
    });

    await expect(sendChatMessage({
      userId: "user-1",
      message: "Hello",
      privacyMode: "standard",
      client,
    })).rejects.toMatchObject({ status: 429 });

    expect(remove).toHaveBeenCalledTimes(1);
  });

  test("attaches the new conversation id when an uncertain network failure may have persisted", async () => {
    const { client, remove } = createStandardClient({
      invokeResult: { data: null, error: { message: "network interrupted" } },
    });

    let caught;
    try {
      await sendChatMessage({
        userId: "user-1",
        message: "Hello",
        privacyMode: "standard",
        client,
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toMatchObject({
      conversationId: "conversation-1",
      mayHavePersisted: true,
    });
    expect(remove).not.toHaveBeenCalled();
  });

  test("keeps a successful AI response usable when history reload fails", async () => {
    const { client } = createStandardClient({
      invokeResult: {
        data: { text: "response text", safetyTier: "normal", actions: [] },
        error: null,
      },
      messageResult: { data: null, error: { message: "history unavailable" } },
    });

    await expect(sendChatMessage({
      userId: "user-1",
      message: "Hello",
      privacyMode: "standard",
      client,
    })).resolves.toEqual({
      text: "response text",
      safetyTier: "normal",
      actions: [],
      conversationId: "conversation-1",
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
