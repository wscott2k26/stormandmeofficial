import React, { useMemo, useState } from "react";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useIamAuth } from "../auth/IamAuthProvider";
import { saveProfile } from "./profileApi";
import { IAM_LANES } from "./profileContract";
import "../styles/iam.css";

const LANE_COPY = {
  him: ["Him", "Grounded, direct and practical support."],
  her: ["Her", "Warm, expressive and clear support."],
  becoming: ["Becoming", "Balanced, adaptive and shaped by your choices."],
};

export default function IamOnboardingPage({ profile, refreshProfile }) {
  const auth = useIamAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [lane, setLane] = useState(IAM_LANES.includes(profile?.lane) ? profile.lane : "becoming");
  const [adult, setAdult] = useState(profile?.declared_adult === true);
  const [aiBoundary, setAiBoundary] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(profile?.memory_enabled === true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const valid = useMemo(() => Boolean(adult && aiBoundary && IAM_LANES.includes(lane)), [adult, aiBoundary, lane]);

  async function submit(event) {
    event.preventDefault();
    if (!valid || !auth.user?.id) return;
    setBusy(true);
    setError("");
    try {
      await saveProfile(auth.user.id, {
        displayName,
        lane,
        acceptedAdultBoundary: adult,
        acceptedAiBoundary: aiBoundary,
        memoryEnabled,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      });
      if (typeof refreshProfile === "function") await refreshProfile();
      navigate("/iam/app/talk", { replace: true });
    } catch (_caught) {
      setError("Your choices were not saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="iam-page iam-onboarding-page">
      <section className="iam-onboarding-card" aria-labelledby="iam-onboarding-title">
        <div className="iam-brand-row">
          <div className="iam-orb" aria-hidden="true"><Sparkles /></div>
          <div><p className="iam-kicker">Required setup · working title</p><p className="iam-wordmark">I AM</p></div>
        </div>
        <h1 id="iam-onboarding-title">Choose how I AM should support you.</h1>
        <p className="iam-lead">These choices shape tone and continuity. They never lower safety standards or change access to help.</p>

        <form className="iam-form iam-onboarding-form" onSubmit={submit}>
          <label>
            <span>What should I call you? <em>Optional</em></span>
            <input className="iam-plain-input" maxLength={80} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your first name or nickname" />
          </label>

          <fieldset className="iam-fieldset">
            <legend>Choose a support lane</legend>
            <div className="iam-lane-grid">
              {IAM_LANES.map((value) => (
                <label key={value} className={`iam-lane-card ${lane === value ? "is-selected" : ""}`}>
                  <input type="radio" name="lane" value={value} checked={lane === value} onChange={() => setLane(value)} />
                  <span className="iam-lane-check" aria-hidden="true">{lane === value && <Check />}</span>
                  <strong>{LANE_COPY[value][0]}</strong>
                  <small>{LANE_COPY[value][1]}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="iam-consent-stack">
            <label className="iam-check-row">
              <input type="checkbox" checked={adult} onChange={(event) => setAdult(event.target.checked)} />
              <span><strong>I confirm that I am at least 18 years old.</strong><small>This first release is for adults in the United States.</small></span>
            </label>
            <label className="iam-check-row">
              <input type="checkbox" checked={aiBoundary} onChange={(event) => setAiBoundary(event.target.checked)} />
              <span><strong>I understand I AM is AI, not therapy or emergency monitoring.</strong><small>Responses may be wrong. Immediate danger requires local emergency help or trained human support.</small></span>
            </label>
            <label className="iam-check-row">
              <input type="checkbox" checked={memoryEnabled} onChange={(event) => setMemoryEnabled(event.target.checked)} />
              <span><strong>Allow memory proposals</strong><small>Optional and off by default. Phase 1 does not save new memories yet.</small></span>
            </label>
          </div>

          <div className="iam-safety-note"><ShieldCheck aria-hidden="true" /><p>Safety support stays available whether memory is on or off. Crisis or abuse disclosures never earn rewards.</p></div>
          {error && <div className="iam-alert iam-alert-error" role="alert">{error}</div>}
          <button className="iam-button iam-button-primary" type="submit" disabled={!valid || busy}>{busy ? "Saving…" : <>Save and talk to I AM <ArrowRight aria-hidden="true" /></>}</button>
        </form>

        <nav className="iam-policy-links" aria-label="Onboarding policies">
          <Link to="/iam/safety">Safety</Link><Link to="/iam/privacy">Privacy</Link><Link to="/iam/terms">Terms</Link>
        </nav>
      </section>
    </main>
  );
}
