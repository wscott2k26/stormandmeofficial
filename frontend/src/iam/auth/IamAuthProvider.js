import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { requireSupabase } from "../data/supabaseClient";
import { authInitialState, authReducer } from "./authState";

const IamAuthContext = createContext(null);

function messageFor(error, fallback) {
  if (error && typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }
  return fallback;
}

export function IamAuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  useEffect(() => {
    let active = true;
    let subscription;

    try {
      const client = requireSupabase();
      client.auth.getSession()
        .then(({ data, error }) => {
          if (!active) return;
          if (error) {
            dispatch({ type: "AUTH_ERROR", error: messageFor(error, "Your session could not be checked.") });
            return;
          }
          dispatch({ type: "SESSION_READY", session: data.session });
        })
        .catch((error) => {
          if (active) dispatch({ type: "AUTH_ERROR", error: messageFor(error, "Your session could not be checked.") });
        });

      const result = client.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        dispatch({ type: "SESSION_READY", session });
      });
      subscription = result.data.subscription;
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", error: messageFor(error, "I AM is not configured for sign-in yet.") });
    }

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const actions = useMemo(() => ({
    async signUp(email, password) {
      dispatch({ type: "CLEAR_ERROR" });
      const client = requireSupabase();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/iam/auth?mode=confirmed`,
        },
      });
      if (error) throw new Error(messageFor(error, "Account could not be created."));
      return {
        user: data.user,
        session: data.session,
        requiresEmailConfirmation: Boolean(data.user && !data.session),
      };
    },
    async signIn(email, password) {
      dispatch({ type: "CLEAR_ERROR" });
      const client = requireSupabase();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error(messageFor(error, "Sign-in failed."));
      dispatch({ type: "SESSION_READY", session: data.session });
      return data;
    },
    async signOut() {
      const client = requireSupabase();
      const { error } = await client.auth.signOut();
      if (error) throw new Error(messageFor(error, "Sign-out failed."));
      dispatch({ type: "SIGNED_OUT" });
    },
    async requestPasswordReset(email) {
      const client = requireSupabase();
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/iam/auth?mode=reset`,
      });
      if (error) throw new Error(messageFor(error, "Password reset email could not be sent."));
      return true;
    },
    async updatePassword(password) {
      const normalized = String(password || "");
      if (normalized.length < 10) {
        throw new Error("Password must be at least 10 characters.");
      }
      const client = requireSupabase();
      const { data, error } = await client.auth.updateUser({ password: normalized });
      if (error) throw new Error(messageFor(error, "Password could not be updated."));
      return data.user;
    },
  }), []);

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);
  return <IamAuthContext.Provider value={value}>{children}</IamAuthContext.Provider>;
}

export function useIamAuth() {
  const value = useContext(IamAuthContext);
  if (!value) throw new Error("useIamAuth must be used inside IamAuthProvider.");
  return value;
}
