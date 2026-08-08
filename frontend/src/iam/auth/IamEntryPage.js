import React from "react";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/iam.css";

export default function IamEntryPage() {
  return (
    <main className="iam-page iam-entry-page">
      <div className="iam-ambient iam-ambient-one" aria-hidden="true" />
      <div className="iam-ambient iam-ambient-two" aria-hidden="true" />
      <section className="iam-entry-card" aria-labelledby="iam-entry-title">
        <div className="iam-brand-row">
          <div className="iam-orb" aria-hidden="true"><Sparkles /></div>
          <div>
            <p className="iam-kicker">Storm And Me LLC · working title</p>
            <p className="iam-wordmark">I AM</p>
          </div>
        </div>

        <h1 id="iam-entry-title">Talk it through. Choose one honest next move.</h1>
        <p className="iam-lead">
          A private AI-assisted whole-life companion for U.S. adults. I AM can help you reflect, compare options and make a practical plan, but it is not therapy, emergency response or a human monitoring service.
        </p>

        <div className="iam-entry-actions">
          <Link className="iam-button iam-button-primary" to="/iam/auth?mode=signup">
            Create account <ArrowRight aria-hidden="true" />
          </Link>
          <Link className="iam-button iam-button-secondary" to="/iam/auth?mode=signin">
            Sign in
          </Link>
        </div>

        <div className="iam-trust-grid">
          <article>
            <LockKeyhole aria-hidden="true" />
            <h2>Private by design</h2>
            <p>Memory starts off. You decide what is saved and standard versus private conversation mode is labeled plainly.</p>
          </article>
          <article>
            <ShieldCheck aria-hidden="true" />
            <h2>Safety before engagement</h2>
            <p>Safety support is never paywalled. High-risk moments do not trigger points, streaks or celebration.</p>
          </article>
        </div>

        <nav className="iam-policy-links" aria-label="I AM policies and support">
          <Link to="/iam/privacy">Privacy</Link>
          <Link to="/iam/terms">Terms</Link>
          <Link to="/iam/safety">Safety</Link>
          <Link to="/iam/support">Support</Link>
          <Link to="/iam/delete-account">Delete Account</Link>
        </nav>
      </section>
    </main>
  );
}
