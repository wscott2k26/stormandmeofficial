import React, { useCallback, useEffect, useState } from "react";
import { MessageCirclePlus, MessagesSquare, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useIamAuth } from "../auth/IamAuthProvider";
import { deleteConversation, listConversations } from "./chatApi";
import "../styles/iam.css";

export function conversationHref(id) {
  if (!id) throw new Error("Conversation id is required.");
  return `/iam/app/talk?conversation=${encodeURIComponent(id)}`;
}

function formatUpdated(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated recently";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function IamConversationsPage() {
  const auth = useIamAuth();
  const [state, setState] = useState({ status: "loading", conversations: [], error: "" });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const conversations = await listConversations(auth.user.id);
      setState({ status: "ready", conversations, error: "" });
    } catch (_caught) {
      setState({ status: "error", conversations: [], error: "Your conversations could not be loaded." });
    }
  }, [auth.user.id]);

  useEffect(() => { refresh(); }, [refresh]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteConversation(pendingDelete.id, auth.user.id);
      setPendingDelete(null);
      await refresh();
    } catch (_caught) {
      setState((current) => ({ ...current, status: "error", error: "Conversation could not be deleted." }));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="iam-workspace">
      <section className="iam-conversations-card" aria-labelledby="iam-conversations-title">
        <header className="iam-conversations-header">
          <div>
            <p className="iam-kicker">Private history · working title</p>
            <h1 id="iam-conversations-title">Conversations</h1>
            <p>Resume saved threads or start fresh. Private-mode exchanges are not intentionally added here.</p>
          </div>
          <Link className="iam-button iam-button-primary" to="/iam/app/talk"><MessageCirclePlus aria-hidden="true" /> Start a conversation</Link>
        </header>

        {state.status === "loading" && <div className="iam-empty-state" role="status"><MessagesSquare aria-hidden="true" /><p>Loading your conversations…</p></div>}
        {state.status === "error" && <div className="iam-empty-state"><h2>Something did not load.</h2><p>{state.error}</p><button type="button" className="iam-button iam-button-secondary" onClick={refresh}>Try again</button></div>}
        {state.status === "ready" && state.conversations.length === 0 && (
          <div className="iam-empty-state"><MessagesSquare aria-hidden="true" /><h2>No saved conversations yet.</h2><p>Start with whatever is on your mind. One honest next move is enough.</p><Link className="iam-button iam-button-primary" to="/iam/app/talk">Start a conversation</Link></div>
        )}
        {state.status === "ready" && state.conversations.length > 0 && (
          <div className="iam-conversation-list">
            {state.conversations.map((conversation) => (
              <article className="iam-conversation-row" key={conversation.id}>
                <Link className="iam-conversation-link" to={conversationHref(conversation.id)}>
                  <strong>{conversation.title || "New conversation"}</strong>
                  <small>{formatUpdated(conversation.updated_at)}</small>
                </Link>
                <button type="button" className="iam-delete-button" aria-label={`Delete ${conversation.title || "conversation"}`} onClick={() => setPendingDelete(conversation)}><Trash2 aria-hidden="true" /></button>
              </article>
            ))}
          </div>
        )}
      </section>

      {pendingDelete && (
        <div className="iam-dialog-backdrop" role="presentation">
          <section className="iam-dialog" role="dialog" aria-modal="true" aria-labelledby="iam-delete-title">
            <h2 id="iam-delete-title">Delete this conversation?</h2>
            <p>Delete this conversation and its messages? Any separately saved memory remains in the Memory Center until you delete it there.</p>
            <div className="iam-dialog-actions">
              <button type="button" className="iam-button iam-button-secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>Cancel</button>
              <button type="button" className="iam-button iam-button-danger" onClick={confirmDelete} disabled={deleting} autoFocus>{deleting ? "Deleting…" : "Delete conversation"}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
