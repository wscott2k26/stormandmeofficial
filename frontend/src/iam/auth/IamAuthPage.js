import React, { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { loadProfile } from "../profile/profileApi";
import { isProfileComplete } from "../profile/profileContract";
import { EMAIL_PATTERN, validateCredentials, validateNewPassword } from "./authValidation";
import { useIamAuth } from "./IamAuthProvider";
import "../styles/iam.css";

export default function IamAuthPage() {
  const auth = useIamAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const requestedMode = params.get("mode") || "signin";
  const mode = ["signup", "signin", "forgot", "reset", "confirmed"].includes(requestedMode)
    ? requestedMode
    : "signin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const heading = useMemo(() => ({
    signup: "Create your private account",
    signin: "Welcome back",
    forgot: "Reset your password",
    reset: "Choose a new password",
    confirmed: "Email confirmed",
  }[mode]), [mode]);

  async function finishAuth() {
    const destination = location.state?.from || "/iam/app/talk";
    navigate(destination, { replace: true });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (mode === "forgot") {
      if (!EMAIL_PATTERN.test(email.trim())) {
        setError("Enter a valid email address.");
        return;
      }
      setBusy(true);
      try {
        await auth.requestPasswordReset(email.trim());
        setMessage("Check your email for a password reset link.");
      } catch (caught) {
        setError(caught.message || "Password reset email could not be sent.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === "reset") {
      const validation = validateNewPassword(password, confirmPassword);
      if (validation) {
        setError(validation);
        return;
      }
      if (auth.status !== "authenticated" || !auth.user) {
        setError("This reset link is invalid or expired. Request a new one.");
        return;
      }
      setBusy(true);
      try {
        await auth.updatePassword(password);
        setMessage("Your password has been updated.");
        const profile = await loadProfile(auth.user.id);
        navigate(isProfileComplete(profile) ? "/iam/app/talk" : "/iam/onboarding", { replace: true });
      } catch (caught) {
        setError(caught.message || "Password could not be updated.");
      } finally {
        setBusy(false);
      }
      return;
    }

    const validation = validateCredentials(email, password);
    if (validation) {
      setError(validation);
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const result = await auth.signUp(email.trim(), password);
        if (result.requiresEmailConfirmation) {
          setMessage("Check your email to confirm your account, then return here to sign in.");
        } else {
          navigate("/iam/onboarding", { replace: true });
        }
      } else {
        await auth.signIn(email.trim(), password);
        await finishAuth();
      }
    } catch (caught) {
      setError(caught.message || "Your request could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "confirmed") {
    return (
      <main className="iam-page iam-auth-page">
        <section className="iam-auth-card">
          <ShieldCheck className="iam-auth-icon" aria-hidden="true" />
          <p className="iam-kicker">I AM · working title</p>
          <h1>{heading}</h1>
          <p>Your email is confirmed. Sign in to continue to the private companion.</p>
          <Link className="iam-button iam-button-primary" to="/iam/auth?mode=signin">Sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="iam-page iam-auth-page">
      <section className="iam-auth-card" aria-labelledby="iam-auth-title">
        <Link className="iam-back-link" to="/iam"><ArrowLeft aria-hidden="true" /> Back to I AM</Link>
        <p className="iam-kicker">Private account · working title</p>
        <h1 id="iam-auth-title">{heading}</h1>
        <p className="iam-muted">
          {mode === "signup" && "Create an adult account. Memory remains off until you choose otherwise."}
          {mode === "signin" && "Sign in to continue your conversations and private settings."}
          {mode === "forgot" && "We will send a secure reset link to your account email."}
          {mode === "reset" && "Use at least 10 characters. The reset link must still be valid."}
        </p>

        <form className="iam-form" onSubmit={submit} noValidate>
          {mode !== "reset" && (
            <label>
              <span>Email</span>
              <div className="iam-input-wrap"><Mail aria-hidden="true" /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} /></div>
            </label>
          )}

          {!["forgot"].includes(mode) && (
            <label>
              <span>{mode === "reset" ? "New password" : "Password"}</span>
              <div className="iam-input-wrap">
                <KeyRound aria-hidden="true" />
                <input type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} />
                <button type="button" className="iam-icon-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button>
              </div>
            </label>
          )}

          {mode === "reset" && (
            <label>
              <span>Confirm new password</span>
              <div className="iam-input-wrap"><KeyRound aria-hidden="true" /><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={busy} /></div>
            </label>
          )}

          {error && <div className="iam-alert iam-alert-error" role="alert">{error}</div>}
          {message && <div className="iam-alert iam-alert-success" role="status">{message}</div>}

          <button className="iam-button iam-button-primary" type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "signin" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Update password"}
          </button>
        </form>

        <div className="iam-auth-switches">
          {mode !== "signin" && <Link to="/iam/auth?mode=signin">Sign in instead</Link>}
          {mode !== "signup" && <Link to="/iam/auth?mode=signup">Create an account</Link>}
          {mode !== "forgot" && mode !== "reset" && <Link to="/iam/auth?mode=forgot">Forgot password?</Link>}
        </div>
      </section>
    </main>
  );
}
