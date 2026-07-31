import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";

const REQUEST_URL = "https://xdstipqlrnnuutggvhbz.supabase.co/functions/v1/public-request";

const CONTENT = {
  privacy: {
    overline: "I AM · Privacy",
    title: "I AM Privacy Policy",
    intro: "How I AM handles account, conversation, plan, community, safety, career, and device data.",
    sections: [
      ["Who operates I AM", "I AM is operated by Storm And Me LLC. The app provides an adult whole-life AI companion with I Am Him, I Am Her, and I Am Becoming support lanes."],
      ["Information you provide", "Depending on the features you use, we may process your account email, display name, age confirmation, companion preferences, goals, check-ins, conversations, user-approved memories, career documents and analyses, relationship or wellness plans, saved style boards, community posts and reactions, reports, support requests, and account-deletion requests."],
      ["Sensitive information", "Conversations about emotional wellness, abuse, relationships, safety, health concerns, work, or finances may be sensitive. Do not enter information you do not want processed. Private sessions are designed not to be saved to the cloud, but internet or device activity may still be visible to a device owner, network administrator, operating-system provider, or other person with access to the device."],
      ["How information is used", "We use information to authenticate accounts, personalize the companion with your permission, produce requested AI responses and career analyses, save plans and progress, moderate community content, protect safety, prevent abuse, verify subscriptions, deliver notifications you enable, investigate errors, respond to support requests, and meet legal obligations."],
      ["AI and service providers", "AI requests are sent through protected server functions to configured AI providers. Provider-side response storage is disabled where supported. We also use infrastructure and platform services such as Supabase, Apple, Google, Expo, and the applicable app stores. These providers process information under their own agreements and privacy terms."],
      ["Advertising and sale of data", "I AM does not sell conversation, mood, abuse, health, safety, career-document, or private-plan information. I AM does not use those categories to build advertising profiles."],
      ["Community", "Community posts are not private. They may be reviewed by automated moderation and authorized administrators. Do not post addresses, phone numbers, account credentials, precise location, identifying safety-plan details, or other personal information."],
      ["Retention", "Account data is retained while the account is active and as needed to provide the service. Some operational, fraud-prevention, billing, audit, or legal records may be retained for a limited period after deletion when required. Public support requests are retained only as long as reasonably needed to verify and complete the request and document the outcome."],
      ["Your controls", "Inside the app you can review or delete memories, control personalization, sign out, disable notifications, and request account deletion. You may also use the public deletion-request page without opening the app."],
      ["Age and location", "I AM is currently intended for adults age 18 or older in the United States. It is not designed for children."],
      ["Contact", "For privacy questions, use the I AM support page and choose Privacy request. Do not include passwords, government identification numbers, payment-card numbers, or detailed medical records."],
    ],
  },
  terms: {
    overline: "I AM · Legal",
    title: "I AM Terms of Use",
    intro: "Rules and boundaries for using the I AM application and community.",
    sections: [
      ["Adult use only", "You must be at least 18 years old to create an I AM account or use its community features."],
      ["What I AM is", "I AM is an AI-assisted life-navigation product for reflection, planning, career preparation, confidence, relationships, wellness routines, style planning, community, and verified resource discovery."],
      ["What I AM is not", "I AM is not a therapist, physician, attorney, financial adviser, emergency service, domestic-violence advocate, recruiter, stylist, or human monitoring service. It cannot guarantee safety, employment, relationship outcomes, health outcomes, product availability, or the accuracy of every AI response."],
      ["Emergencies", "Do not rely on I AM for emergency response. In immediate danger in the United States, call 911. For suicide or crisis support, call or text 988. For domestic-violence support, contact the National Domestic Violence Hotline at 1-800-799-7233 or text START to 88788."],
      ["Your responsibility", "You are responsible for evaluating suggestions before acting, protecting your device and credentials, maintaining accurate account information, and obtaining qualified professional help when needed."],
      ["Community rules", "Do not harass, threaten, impersonate, exploit, dox, solicit sexual content, encourage self-harm, post illegal material, manipulate vulnerable users, evade moderation, or share private information. We may remove content, restrict features, suspend accounts, preserve evidence, or report conduct when reasonably necessary for safety or law."],
      ["AI output and reporting", "AI output may be incomplete or wrong. Use the in-app report feature when a response is unsafe, offensive, misleading, or otherwise inappropriate. Reports may be reviewed to improve safeguards."],
      ["Subscriptions", "Paid features, prices, billing periods, trials, renewal, cancellation, refunds, and restore-purchase options are presented through Apple App Store or Google Play. Store terms and applicable law govern transactions. Safety resources are not paywalled."],
      ["Intellectual property", "The I AM software, branding, original interface, written materials, and product content are owned by Storm And Me LLC or its licensors. You retain rights in content you create, subject to the limited permissions needed to operate, secure, moderate, and improve the service."],
      ["Service changes", "Features may change for safety, reliability, legal, platform, or operational reasons. Material policy changes will be reflected by a new effective date and, when appropriate, an in-app notice."],
      ["Governing law", "These terms are governed by applicable United States and South Carolina law, without limiting consumer rights that cannot legally be waived."],
    ],
  },
  safety: {
    overline: "I AM · Safety",
    title: "Safety Statement",
    intro: "I AM can support reflection and planning, but it is not watched in real time and cannot send emergency help.",
    sections: [
      ["Immediate danger", "If you or someone else may be in immediate danger in the United States, call 911 or go to the nearest emergency department."],
      ["Suicide and crisis support", "Call or text 988 to reach the 988 Suicide & Crisis Lifeline. If possible, move away from anything that could be used for harm and contact a trusted person who can stay with you."],
      ["Domestic violence", "Call the National Domestic Violence Hotline at 1-800-799-7233, text START to 88788, or visit TheHotline.org. Leaving or confronting an abusive person can increase danger in some situations; a trained advocate can help you consider options."],
      ["Monitored devices", "Internet, phone, browser, app, location, and account activity may be monitored and may not be fully erasable. Consider using a safer device or account when seeking help. The app's quick-exit features cannot guarantee that all traces are removed."],
      ["No real-time monitoring", "No person is continuously reading conversations or waiting to intervene. Automated systems may route high-risk language to safer responses, but they can miss context or make mistakes."],
      ["Verified resources", "High-stakes resources shown inside I AM include source and review information and may expire for re-verification. Availability can still change, so confirm details with the provider."],
      ["Report unsafe output", "Use the in-app report control or the public support page to report unsafe AI output, inaccurate safety resources, or harmful community content. Do not use a report form as a substitute for emergency help."],
    ],
  },
};

const REQUEST_OPTIONS = [
  ["general_support", "General support"],
  ["technical", "Technical problem"],
  ["billing", "Billing or subscription"],
  ["privacy", "Privacy request"],
  ["resource_correction", "Safety-resource correction"],
  ["unsafe_ai", "Unsafe or inaccurate AI response"],
];

function Field({ label, children }) {
  return <label className="block"><span className="text-xs tracking-widest uppercase text-storm-silver/55">{label}</span>{children}</label>;
}

function RequestForm({ deletion = false }) {
  const [form, setForm] = useState({
    requestType: deletion ? "account_deletion" : "general_support",
    displayName: "",
    email: "",
    subject: deletion ? "Delete my I AM account" : "",
    details: deletion ? "Please delete my I AM account and associated personal data." : "",
    appVersion: "",
    platform: "",
    honeypot: "",
  });
  const [confirmed, setConfirmed] = useState(false);
  const [state, setState] = useState({ loading: false, success: false, error: "", requestId: "" });
  const ready = useMemo(() => form.email.includes("@") && form.details.trim().length >= 10 && (!deletion || confirmed), [form, deletion, confirmed]);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;
    setState({ loading: true, success: false, error: "", requestId: "" });
    try {
      const response = await fetch(REQUEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request could not be submitted.");
      setState({ loading: false, success: true, error: "", requestId: data.requestId || "received" });
    } catch (error) {
      setState({ loading: false, success: false, error: error.message || "Request could not be submitted.", requestId: "" });
    }
  };

  if (state.success) return (
    <div className="glass rounded-3xl p-8 text-center">
      <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
      <h2 className="font-display text-2xl font-bold text-white mt-4">Request received</h2>
      <p className="text-storm-silver/75 mt-3">Reference: <span className="text-white">{state.requestId}</span></p>
      <p className="text-storm-silver/60 mt-3 text-sm">We may contact you at the submitted email to verify account ownership. Never send a password, authentication code, payment-card number, or government identification document by ordinary email.</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-7 sm:p-9 space-y-5">
      {!deletion && <Field label="Request type"><select value={form.requestType} onChange={set("requestType")} className="mt-2 w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-white">{REQUEST_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Name (optional)"><input value={form.displayName} onChange={set("displayName")} maxLength={120} className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" /></Field>
        <Field label="Account email"><input required type="email" value={form.email} onChange={set("email")} maxLength={320} className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" /></Field>
      </div>
      <Field label="Subject"><input required value={form.subject} onChange={set("subject")} maxLength={180} className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" /></Field>
      <Field label={deletion ? "Deletion request" : "Details"}><textarea required rows={7} value={form.details} onChange={set("details")} maxLength={4000} className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60 resize-none" /></Field>
      {!deletion && <div className="grid sm:grid-cols-2 gap-5"><Field label="App version (optional)"><input value={form.appVersion} onChange={set("appVersion")} maxLength={40} placeholder="Example: 1.0.0" className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white" /></Field><Field label="Device or platform (optional)"><input value={form.platform} onChange={set("platform")} maxLength={40} placeholder="Example: iPhone / Android" className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white" /></Field></div>}
      <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={set("honeypot")} className="hidden" />
      {deletion && <label className="flex items-start gap-3 text-sm text-storm-silver/75"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" /><span>I understand this request is for permanent deletion of the I AM account associated with the email above, subject to limited records that may lawfully need to be retained.</span></label>}
      {state.error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200 text-sm">{state.error}</div>}
      <GlowButton type="submit" className="w-full" disabled={!ready || state.loading}>{state.loading ? "Submitting…" : deletion ? "Request permanent deletion" : "Submit support request"}</GlowButton>
      <p className="text-xs text-storm-silver/45">Do not include passwords, security codes, payment-card numbers, precise safety-plan details, or government identification numbers.</p>
    </form>
  );
}

function LegalContent({ content }) {
  return <section className="max-w-3xl mx-auto px-6 pb-24 space-y-10">{content.sections.map(([heading, paragraph]) => <div key={heading}><h2 className="font-display text-xl sm:text-2xl font-bold text-white">{heading}</h2><p className="mt-3 text-storm-silver/75 leading-relaxed font-light">{paragraph}</p></div>)}<p className="text-xs text-storm-silver/40 pt-4">Effective July 31, 2026 · Storm And Me LLC</p></section>;
}

export default function IamLegalPage({ slug }) {
  const content = CONTENT[slug];
  if (content) return <div><PageHero overline={content.overline} title={content.title} subtitle={content.intro} /><LegalContent content={content} /><IamFooterLinks /></div>;
  if (slug === "support") return <div><PageHero overline="I AM · Support" title="I AM Support" subtitle="Technical, billing, privacy, safety-resource, and unsafe-AI reports go into a private operational queue." /><section className="max-w-3xl mx-auto px-6 pb-24 space-y-8"><div className="glass rounded-2xl p-6 flex gap-4"><AlertTriangle className="w-6 h-6 text-amber-300 shrink-0" /><p className="text-storm-silver/75">This form is not monitored as an emergency service. In immediate danger call 911. In the U.S., call or text 988 for crisis support.</p></div><RequestForm /></section><IamFooterLinks /></div>;
  if (slug === "delete") return <div><PageHero overline="I AM · Privacy" title="Delete Your I AM Account" subtitle="Request permanent account deletion without opening the app." /><section className="max-w-3xl mx-auto px-6 pb-24 space-y-8"><div className="glass rounded-2xl p-6 space-y-3"><div className="flex gap-3 items-center"><ShieldCheck className="w-6 h-6 text-storm-blue" /><h2 className="font-display text-xl font-bold text-white">Before submitting</h2></div><p className="text-storm-silver/75">Inside the app, use Profile → Privacy & Data → Delete account for the fastest authenticated process. This public form is available when you cannot open the app.</p><p className="text-storm-silver/75">Deletion includes the account and associated profile, conversations, memories, goals, studio records, community content tied to the account, push tokens, and active entitlements. Limited fraud-prevention, purchase, audit, or legal records may be retained when required.</p><p className="text-storm-silver/75">We aim to verify and complete eligible requests within 30 days. We may contact you at the account email to confirm ownership, and applicable law may require a different timeframe.</p></div><RequestForm deletion /></section><IamFooterLinks /></div>;
  return null;
}

function IamFooterLinks() {
  return <section className="max-w-4xl mx-auto px-6 pb-24"><div className="glass rounded-2xl p-6 flex flex-wrap gap-x-6 gap-y-3 text-sm"><Link className="text-storm-blue hover:text-white" to="/iam/privacy">Privacy</Link><Link className="text-storm-blue hover:text-white" to="/iam/terms">Terms</Link><Link className="text-storm-blue hover:text-white" to="/iam/safety">Safety</Link><Link className="text-storm-blue hover:text-white" to="/iam/support">Support</Link><Link className="text-storm-blue hover:text-white" to="/iam/delete-account">Delete account</Link><a className="text-storm-blue hover:text-white inline-flex items-center gap-1" href="https://988lifeline.org" target="_blank" rel="noreferrer">988 Lifeline <ExternalLink className="w-3 h-3" /></a></div></section>;
}
