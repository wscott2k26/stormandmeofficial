import React, { cloneElement, useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { iamConfig } from "../config/iamConfig";
import { loadProfile } from "../profile/profileApi";
import { isProfileComplete } from "../profile/profileContract";
import { useIamAuth } from "./IamAuthProvider";

export default function IamProtectedRoute({ children }) {
  const auth = useIamAuth();
  const location = useLocation();
  const [profileState, setProfileState] = useState({ status: "idle", profile: null, error: "" });

  const refreshProfile = useCallback(async () => {
    if (!auth.user?.id) return null;
    setProfileState((current) => ({ ...current, status: "loading", error: "" }));
    try {
      const profile = await loadProfile(auth.user.id);
      setProfileState({ status: "ready", profile, error: "" });
      return profile;
    } catch (_error) {
      setProfileState({ status: "error", profile: null, error: "Your profile could not be loaded." });
      return null;
    }
  }, [auth.user?.id]);

  useEffect(() => {
    if (auth.status === "authenticated" && auth.user?.id) refreshProfile();
  }, [auth.status, auth.user?.id, refreshProfile]);

  if (!iamConfig.isConfigured) {
    return (
      <main className="iam-status-page" role="status">
        <h1>I AM is not configured for private access yet.</h1>
        <p>The owner must add the approved public Supabase settings to this preview. No secret value belongs in the browser.</p>
      </main>
    );
  }

  if (auth.status === "loading") {
    return <main className="iam-status-page" role="status">Checking your private session…</main>;
  }

  if (auth.status === "anonymous" || (auth.status === "error" && !auth.user)) {
    return <Navigate to="/iam/auth" replace state={{ from: location.pathname + location.search }} />;
  }

  if (profileState.status === "idle" || profileState.status === "loading") {
    return <main className="iam-status-page" role="status">Loading your I AM profile…</main>;
  }

  if (profileState.status === "error") {
    return (
      <main className="iam-status-page">
        <h1>We could not load your profile.</h1>
        <p>{profileState.error}</p>
        <button type="button" className="iam-button" onClick={refreshProfile}>Try again</button>
      </main>
    );
  }

  if (location.pathname.startsWith("/iam/app") && !isProfileComplete(profileState.profile)) {
    return <Navigate to="/iam/onboarding" replace />;
  }

  return cloneElement(children, {
    profile: profileState.profile,
    refreshProfile,
  });
}
