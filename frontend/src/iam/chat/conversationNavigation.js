export function conversationHref(id) {
  if (!id) throw new Error("Conversation id is required.");
  return `/iam/app/talk?conversation=${encodeURIComponent(id)}`;
}
