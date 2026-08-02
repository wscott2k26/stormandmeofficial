import { requireSupabase } from "../data/supabaseClient";

const MAX_MESSAGE_LENGTH = 8000;

function chatError(message, status) {
  const error = new Error(message);
  if (status) error.status = status;
  return error;
}

function ensureMessage(message) {
  const normalized = String(message || "").trim();
  if (!normalized) throw chatError("Write a message before sending.", 400);
  if (normalized.length > MAX_MESSAGE_LENGTH) throw chatError("Messages must be 8,000 characters or fewer.", 400);
  return normalized;
}

function ephemeralId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `private-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function deriveConversationTitle(message) {
  const cleaned = String(message || "").trim().replace(/\s+/g, " ");
  return (cleaned || "New conversation").slice(0, 60);
}

export async function createConversation(userId, client = requireSupabase()) {
  if (!userId) throw chatError("User id is required.", 400);
  const payload = {
    user_id: userId,
    title: "New conversation",
    area: "general",
    privacy_mode: "standard",
  };
  const { data, error } = await client.from("conversations").insert(payload).select("*").single();
  if (error) throw chatError(error.message || "Conversation could not be created.", error.status);
  return data;
}

export async function listConversations(userId, client = requireSupabase()) {
  if (!userId) throw chatError("User id is required.", 400);
  const { data, error } = await client
    .from("conversations")
    .select("id,title,area,privacy_mode,created_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw chatError(error.message || "Conversations could not be loaded.", error.status);
  return data || [];
}

export async function loadMessages(conversationId, client = requireSupabase()) {
  if (!conversationId) throw chatError("Conversation id is required.", 400);
  const { data, error } = await client
    .from("messages")
    .select("id,role,content,risk,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw chatError(error.message || "Messages could not be loaded.", error.status);
  return data || [];
}

export async function deleteConversation(conversationId, userId, client = requireSupabase()) {
  if (!conversationId) throw chatError("Conversation id is required.", 400);
  if (!userId) throw chatError("User id is required.", 400);
  const { error } = await client
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId);
  if (error) throw chatError(error.message || "Conversation could not be deleted.", error.status);
  return true;
}

async function invokeChat(client, body) {
  const { data, error } = await client.functions.invoke("chat", { body });
  if (error) {
    const status = error?.context?.status || error?.status;
    throw chatError(
      status === 429 ? "Please pause for a moment before sending another message." : "Unable to respond safely right now.",
      status
    );
  }
  if (!data || typeof data.text !== "string") throw chatError("Unable to respond safely right now.", 500);
  return {
    text: data.text,
    safetyTier: typeof data.safetyTier === "string" ? data.safetyTier : "normal",
    actions: Array.isArray(data.actions) ? data.actions : [],
  };
}

async function removeBlankConversation(conversationId, userId, client) {
  try {
    await deleteConversation(conversationId, userId, client);
  } catch (_error) {
    // A failed cleanup must never replace the original chat error.
  }
}

export async function sendChatMessage({
  userId,
  conversationId,
  message,
  privacyMode = "standard",
  client = requireSupabase(),
}) {
  const normalized = ensureMessage(message);
  if (!["standard", "private"].includes(privacyMode)) throw chatError("Invalid privacy mode.", 400);

  if (privacyMode === "private") {
    const privateConversationId = conversationId || ephemeralId();
    const response = await invokeChat(client, {
      conversationId: privateConversationId,
      message: normalized,
      privacyMode: "private",
    });
    return { ...response, conversationId: privateConversationId, messages: null };
  }

  if (!userId) throw chatError("User id is required.", 400);
  const created = !conversationId;
  const conversation = created ? await createConversation(userId, client) : { id: conversationId };
  const activeId = conversation.id;

  let response;
  try {
    response = await invokeChat(client, {
      conversationId: activeId,
      message: normalized,
      privacyMode: "standard",
    });
  } catch (error) {
    if (created && error?.status) {
      await removeBlankConversation(activeId, userId, client);
    } else if (created) {
      error.conversationId = activeId;
      error.mayHavePersisted = true;
    }
    throw error;
  }

  const update = {
    updated_at: new Date().toISOString(),
    ...(created ? { title: deriveConversationTitle(normalized) } : {}),
  };
  await client
    .from("conversations")
    .update(update)
    .eq("id", activeId)
    .eq("user_id", userId);

  let messages = null;
  try {
    messages = await loadMessages(activeId, client);
  } catch (_error) {
    // The AI response is still usable. A later reload can recover persisted history.
  }

  return { ...response, conversationId: activeId, messages };
}

export async function reconcileUncertainSend({
  conversationId,
  message,
  sendStartedAt,
  client = requireSupabase(),
}) {
  const messages = await loadMessages(conversationId, client);
  const normalized = String(message || "").trim();
  const started = new Date(sendStartedAt).getTime();
  const latestMatching = [...messages].reverse().find((item) => item.role === "user" && String(item.content || "").trim() === normalized);
  const persisted = Boolean(latestMatching && new Date(latestMatching.created_at).getTime() >= started);
  return { persisted, messages };
}

export { MAX_MESSAGE_LENGTH };
