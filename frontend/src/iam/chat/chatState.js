export const chatInitialState = {
  status: "idle",
  privacyMode: "standard",
  conversationId: null,
  messages: [],
  draft: "",
  error: "",
  actions: [],
  lastSendStartedAt: null,
};

export function filterPhaseOneActions(actions) {
  if (!Array.isArray(actions)) return [];
  return actions.flatMap((action) => {
    if (!action || typeof action !== "object" || typeof action.label !== "string") return [];
    if (action.type === "call" && typeof action.route === "string" && action.route.startsWith("tel:")) {
      return [{ label: action.label, type: "call", route: action.route }];
    }
    if (action.type === "route" && action.route === "/safety") {
      return [{ label: action.label, type: "route", route: "/iam/safety" }];
    }
    return [];
  });
}

export function messageForChatError(error) {
  if (error?.status === 401) return "Your private session expired. Sign in again to continue.";
  if (error?.status === 429) return "Please pause for a moment before sending another message.";
  if (error?.message === "You appear to be offline. Your message has not been sent.") return error.message;
  return "Unable to respond safely right now.";
}

export function chatReducer(state, action) {
  switch (action.type) {
    case "SET_DRAFT":
      return { ...state, draft: action.draft };
    case "SET_PRIVACY_MODE":
      return {
        ...state,
        privacyMode: action.mode,
        conversationId: action.mode === "private" ? null : state.conversationId,
        messages: action.clearMessages ? [] : state.messages,
        actions: action.clearMessages ? [] : state.actions,
        error: "",
        status: "idle",
      };
    case "NEW_CONVERSATION":
      return { ...state, conversationId: null, messages: [], actions: [], error: "", status: "idle" };
    case "LOAD_HISTORY_STARTED":
      return { ...state, status: "loading-history", error: "", actions: [] };
    case "LOAD_HISTORY_SUCCEEDED":
      return { ...state, status: "idle", messages: action.messages || [], conversationId: action.conversationId, error: "" };
    case "LOAD_HISTORY_FAILED":
      return { ...state, status: "error", messages: [], error: action.error || "This conversation is unavailable." };
    case "SEND_STARTED":
      return { ...state, status: "sending", error: "", lastSendStartedAt: action.startedAt, actions: [] };
    case "SEND_SUCCEEDED":
      return {
        ...state,
        status: "idle",
        draft: "",
        error: "",
        conversationId: action.conversationId,
        messages: action.messages || state.messages,
        actions: filterPhaseOneActions(action.actions),
      };
    case "SEND_FAILED":
      return { ...state, status: "error", error: action.error, actions: [] };
    case "RECONCILE_STARTED":
      return { ...state, status: "reconciling", error: "" };
    case "RECONCILE_SUCCEEDED":
      return {
        ...state,
        status: "idle",
        conversationId: action.conversationId || state.conversationId,
        messages: action.messages || [],
        draft: action.persisted ? "" : state.draft,
        error: action.persisted ? "" : "Your message was not found. You can try sending it again.",
      };
    default:
      return state;
  }
}
