import React, { useState } from "react";
import { LogOut, MessageCircle, MessagesSquare, ShieldCheck, Sparkles } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useIamAuth } from "../auth/IamAuthProvider";
import "../styles/iam.css";

export default function IamAppShell({ profile }) {
  const auth = useIamAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      await auth.signOut();
      navigate("/iam", { replace: true });
    } catch (_caught) {
      setError("Sign-out failed. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className={`iam-app-shell iam-lane-${profile?.lane || "becoming"}`}>
      <header className="iam-app-header">
        <NavLink className="iam-app-brand" to="/iam/app/talk">
          <span className="iam-mini-orb" aria-hidden="true"><Sparkles /></span>
          <span><strong>I AM</strong><small>working title</small></span>
        </NavLink>
        <nav className="iam-app-nav" aria-label="I AM application">
          <NavLink to="/iam/app/talk"><MessageCircle aria-hidden="true" /> Talk</NavLink>
          <NavLink to="/iam/app/conversations"><MessagesSquare aria-hidden="true" /> Conversations</NavLink>
          <NavLink to="/iam/safety"><ShieldCheck aria-hidden="true" /> Safety</NavLink>
        </nav>
        <button className="iam-signout" type="button" onClick={signOut} disabled={signingOut}>
          <LogOut aria-hidden="true" /> {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </header>
      {error && <div className="iam-shell-alert" role="alert">{error}</div>}
      <Outlet context={{ profile }} />
      <nav className="iam-mobile-nav" aria-label="I AM mobile navigation">
        <NavLink to="/iam/app/talk"><MessageCircle aria-hidden="true" /><span>Talk</span></NavLink>
        <NavLink to="/iam/app/conversations"><MessagesSquare aria-hidden="true" /><span>History</span></NavLink>
        <NavLink to="/iam/safety"><ShieldCheck aria-hidden="true" /><span>Safety</span></NavLink>
      </nav>
    </div>
  );
}
