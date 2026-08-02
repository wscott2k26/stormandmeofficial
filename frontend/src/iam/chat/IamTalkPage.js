import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AlertTriangle, ArrowUp, History, LockKeyhole, MessageCirclePlus, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useIamAuth } from "../auth/IamAuthProvider";
import {
  listConversations,
  loadMessages,
  MAX_MESSAGE_LENGTH,
  reconcileUncertainSend,
  sendChatMessage,
} from "./chatApi";
import { chatInitialState, chatReducer, messageForChatError } from "./chatState";
import "../styles/iam.css";

const STARTERS = [
  "Help me choose one thing to focus on today.",
  "I feel stuck and need a practical next step.",
  "Help me think through a difficult decision without taking over.",
];

function localMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    risk: "normal",
    created_at: new Date().toISOString(),
  };
}

export default function IamTalkPage() {
  const auth = useIamAuth();
  const { profile } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const requestedConversation = params.get("conversation");
  const [state, dispatch] = useReducer(chatReducer, chatInitialState);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [rateLimitedUntil, setRateLimitedUntil] = useState(0);
  const bottomRef = useRef(null);

  const laneLabel = useMemo(() => ({ him: "Him", her: "Her", becoming: "Becoming" }[profile?.lane] || "Becoming"), [profile?.lane]);
  const overLimit = state.draft.length > MAX_MESSAGE_LENGTH;
  const locked = ["sending", "reconciling", "loading-history"].includes(state.status);
  const rateLimited = Date.now() < rateLimitedUntil;
  const canSend = state.draft.trim().length > 0 && !overLimit && !locked && online && !rateLimited;

  useEffect(() => {
    function onlineNow() { setOnline(true); }
    function offlineNow() { setOnline(false); }
    window.addEventListener("online", onlineNow);
    window.addEventListener("offline", offlineNow);
    return () => {
      window.removeEventListener("online", onlineNow);
      window.removeEventListener("offline", offlineNow);
    };
  }, []);

  useEffect(() => {
    if (!rateLimitedUntil) return undefined;
    const delay = rateLimitedUntil - Date.now();
    if (delay <= 0) {
      setRateLimitedUntil(0);
      return undefined;
    }
    const timer = window.setTimeout(() => setRateLimitedUntil(0), delay);
    return () => window.clearTimeout(timer);
  }, [rateLimitedUntil]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state.messages, state.status]);

  useEffect(() => {
    let active = true;
    if (state.privacyMode !== "standard") return undefined;
    if (!requestedConversation) {
      dispatch({ type: "NEW_CONVERSATION" });
      return undefined;
    }

    dispatch({ type: "LOAD_HISTORY_STARTED" });
    Promise.all([
      listConversations(auth.user.id),
      loadMessages(requestedConversation),
    ]).then(([conversations, messages]) => {
      if (!active) return;
      if (!conversations.some((item) => item.id === requestedConversation)) {
        dispatch({ type: "LOAD_HISTORY_FAILED", error: "This conversation is unavailable." });
        return;
      }
      dispatch({ type: "LOAD_HISTORY_SUCCEEDED", conversationId: requestedConversation, messages });
    }).catch(() => {
      if (active) dispatch({ type: "LOAD_HISTORY_FAILED", error: "This conversation is unavailable." });
    });

    return () => { active = false; };
  }, [requestedConversation, state.privacyMode, auth.user.id]);

  function startNewConversation() {
    if (state.privacyMode === "private" && state.messages.length > 0) {
      const confirmed = window.confirm("Leave this private exchange? It is not intentionally saved to conversation history.");
      if (!confirmed) return;
    }
    dispatch({ type: "NEW_CONVERSATION" });
    dispatch({ type: "SET_PRIVACY_MODE", mode: "standard", clearMessages: true });
    setParams({}, { replace: true });
  }

  function changePrivacyMode(mode) {
    if (mode === state.privacyMode) return;
    if (state.privacyMode === "private" && state.messages.length > 0) {
      const confirmed = window.confirm("Clear this private exchange and return to saved conversation mode?");
      if (!confirmed) return;
    }
    dispatch({ type: "SET_PRIVACY_MODE", mode, clearMessages: true });
    setParams({}, { replace: true });
  }

  async function send(event) {
    event.preventDefault();
    if (!online) {
      dispatch({ type: "SEND_FAILED", error: "You appear to be offline. Your message has not been sent." });
      return;
    }
    if (!canSend) return;

    const message = state.draft.trim();
    const startedAt = new Date().toISOString();
    const priorMessages = state.messages;
    dispatch({ type: "SEND_STARTED", startedAt });

    try {
      const result = await sendChatMessage({
        userId: auth.user.id,
        conversationId: state.conversationId,
        message,
        privacyMode: state.privacyMode,
      });

      const messages = state.privacyMode === "private" || !result.messages
        ? [...priorMessages, localMessage("user", message), localMessage("assistant", result.text)]
        : result.messages;

      dispatch({
        type: "SEND_SUCCEEDED",
        conversationId: result.conversationId,
        messages,
        actions: result.actions,
      });

      if (state.privacyMode === "standard" && result.conversationId !== requestedConversation) {
        setParams({ conversation: result.conversationId }, { replace: true });
      }
    } catch (error) {
      if (error?.status === 429) setRateLimitedUntil(Date.now() + 15000);

      const uncertainConversationId = error?.conversationId || state.conversationId;
      if (state.privacyMode === "standard" && error?.mayHavePersisted && uncertainConversationId) {
        dispatch({ type: "RECONCILE_STARTED" });
        try {
          const result = await reconcileUncertainSend({
            conversationId: uncertainConversationId,
            message,
            sendStartedAt: startedAt,
          });
          dispatch({
            type: "RECONCILE_SUCCEEDED",
            conversationId: uncertainConversationId,
            ...result,
          });
          if (result.persisted && uncertainConversationId !== requestedConversation) {
            setParams({ conversation: uncertainConversationId }, { replace: true });
          }
          return;
        } catch (_reconcileError) {
          // Fall through to the safe generic failure.
        }
      }

      dispatch({ type: "SEND_FAILED", error: messageForChatError(error) });
    }
  }

  const unavailable = requestedConversation && state.privacyMode === "standard" && state.status === "error" && state.error === "This conversation is unavailable.";

  return (
    <main className="iam-workspace">
      <section className="iam-chat-card" aria-labelledby="iam-talk-title">
        <header className="iam-chat-header">
          <div>
            <p className="iam-kicker">AI companion · {laneLabel} lane · working title</p>
            <h1 id="iam-talk-title">Talk to I AM</h1>
            <p>Reflect, compare options and choose one real-world next move. I AM may be wrong and does not replace qualified or emergency help.</p>
          </div>
          <div className="iam-chat-header-actions">
            <div className="iam-segmented" role="group" aria-label="Conversation privacy mode">
              <button type="button" aria-pressed={state.privacyMode === "standard"} onClick={() => changePrivacyMode("standard")}>Saved</button>
              <button type="button" aria-pressed={state.privacyMode === "private"} onClick={() => changePrivacyMode("private")}>Private</button>
            </div>
            <button type="button" className="iam-chat-toolbar-button" onClick={startNewConversation}><MessageCirclePlus aria-hidden="true" /> New</button>
            <Link className="iam-chat-toolbar-button" to="/iam/app/conversations"><History aria-hidden="true" /> History</Link>
            <Link className="iam-chat-toolbar-button" to="/iam/safety"><ShieldCheck aria-hidden="true" /> Safety</Link>
          </div>
        </header>

        {state.privacyMode === "private" && (
          <div className="iam-private-caution"><LockKeyhole aria-hidden="true" /><span>Private mode is not intentionally saved to I AM conversation history. It cannot erase browser, device, network, provider or security logs.</span></div>
        )}

        <div className="iam-message-list" aria-label="Conversation messages">
          {unavailable ? (
            <div className="iam-empty-state">
              <AlertTriangle aria-hidden="true" />
              <h2>This conversation is unavailable.</h2>
              <p>It may have been deleted, or this account does not have permission to open it.</p>
              <div className="iam-entry-actions"><button className="iam-button iam-button-primary" type="button" onClick={startNewConversation}>Start a new conversation</button><Link className="iam-button iam-button-secondary" to="/iam/app/conversations">Back to conversations</Link></div>
            </div>
          ) : state.status === "loading-history" ? (
            <div className="iam-empty-state" role="status"><div className="iam-orb" aria-hidden="true"><Sparkles /></div><p>Loading your conversation…</p></div>
          ) : state.messages.length === 0 ? (
            <div className="iam-empty-chat">
              <div className="iam-orb" aria-hidden="true"><Sparkles /></div>
              <h2>What are you carrying today?</h2>
              <p>Start anywhere. I AM will keep the response practical, preserve your choices and point back to real people when a situation needs more than an app.</p>
              <div className="iam-starter-grid">
                {STARTERS.map((prompt) => <button key={prompt} type="button" onClick={() => dispatch({ type: "SET_DRAFT", draft: prompt })}>{prompt}</button>)}
              </div>
            </div>
          ) : (
            state.messages.map((message) => (
              <article key={message.id} className={`iam-message iam-message-${message.role}`} aria-label={message.role === "user" ? "Your message" : "I AM response"}>
                <small>{message.role === "user" ? "You" : "I AM · AI"}</small>
                <p>{message.content}</p>
              </article>
            ))
          )}

          {state.actions.length > 0 && (
            <div className="iam-response-actions" aria-label="Safety response actions">
              {state.actions.map((action) => action.type === "call"
                ? <a key={`${action.type}-${action.route}`} href={action.route}>{action.label}</a>
                : <Link key={`${action.type}-${action.route}`} to={action.route}>{action.label}</Link>)}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <footer className="iam-composer-wrap">
          {state.error && <div className="iam-alert iam-alert-error" role="alert">{state.error}{errorSignIn(state.error)}</div>}
          {!online && <div className="iam-inline-notice" role="status">You appear to be offline. Your message has not been sent.</div>}
          <div className="sr-only" aria-live="polite">
            {state.status === "sending" ? "I AM is preparing a response." : state.status === "reconciling" ? "Checking whether your message was saved." : ""}
          </div>
          <form className="iam-composer" onSubmit={send}>
            <textarea aria-label="Message I AM" placeholder="Type what is on your mind…" value={state.draft} onChange={(event) => dispatch({ type: "SET_DRAFT", draft: event.target.value })} maxLength={MAX_MESSAGE_LENGTH + 500} disabled={locked || unavailable} />
            <button className="iam-send-button" type="submit" aria-label="Send message" disabled={!canSend || unavailable}><ArrowUp aria-hidden="true" /></button>
          </form>
          <div className="iam-composer-meta"><span>{state.privacyMode === "private" ? "Private exchange — not intentionally added to history" : "Saved conversation mode"}</span><span className={overLimit ? "iam-count-over" : ""}>{state.draft.length.toLocaleString()} / 8,000</span></div>
        </footer>
      </section>
    </main>
  );
}

function errorSignIn(error) {
  return error.startsWith("Your private session expired")
    ? <> <Link to="/iam/auth">Sign in again.</Link></>
    : null;
}
