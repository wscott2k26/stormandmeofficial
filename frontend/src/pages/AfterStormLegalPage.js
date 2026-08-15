import React from "react";
import { Link } from "react-router-dom";
import { Cloud, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";

const EFFECTIVE_DATE = "August 15, 2026";

const PRIVACY_SECTIONS = [
  ["Who operates AfterStorm", "AfterStorm is operated by Storm And Me LLC. Version 1.0 is a device-first iPhone app that turns everyday goals into small quests and visual restoration progress."],
  ["No account required", "AfterStorm 1.0 does not require an account, username, password, or AfterStorm profile. Core quest and restoration features can be used without creating an account with Storm And Me LLC."],
  ["Progress and preferences", "The app stores selected life areas, quest progress, restoration progress, onboarding state, and app preferences using Apple platform storage on your device. When iCloud is available, Apple CloudKit may sync this app state through your iCloud account. A local-storage fallback is used when cloud-backed storage is unavailable."],
  ["Camera and photos", "Camera or photo access is optional and is requested only after you choose a feature that needs it, such as Scan My World or an optional completion-photo interaction. AfterStorm does not operate a server that receives your camera image or completion photo in version 1.0. Apple system frameworks may process the image on the device to support the requested feature."],
  ["Microphone and speech recognition", "Microphone and speech-recognition access is optional and is requested only when you choose to speak a quest request. The app does not operate its own speech-recognition server. Apple system speech services may process your request according to your device, language, settings, and Apple's applicable privacy terms."],
  ["Apple Intelligence", "On compatible system versions and devices, AfterStorm may use Apple's Foundation Models / Apple Intelligence system features to create quest suggestions. The current app does not send those prompts to an AfterStorm-operated AI server."],
  ["Analytics, advertising, and tracking", "AfterStorm 1.0 does not include an AfterStorm-operated advertising network, cross-app tracking system, or user-profile analytics backend. Storm And Me LLC does not sell AfterStorm quest progress, camera input, voice input, or restoration activity."],
  ["Apple platform services", "Features such as iCloud, CloudKit, speech recognition, photo access, widgets, and Apple Intelligence are provided by Apple and may be governed by Apple account, device, and privacy settings. You can manage relevant permissions in iOS Settings."],
  ["Retention and deletion", "Local app state remains on your device until it is changed, reset through available app/device controls, or the app's local data is removed. iCloud-backed app state follows your iCloud settings and Apple's storage behavior. Because AfterStorm 1.0 has no Storm And Me account, there is no separate AfterStorm web account to delete."],
  ["Children", "AfterStorm is a general productivity and lifestyle app and is not designed to collect personal information from children. It does not include a public social feed or public user-generated-content system in version 1.0."],
  ["Changes", "If a future version adds an AfterStorm server, analytics provider, advertising technology, account system, new AI provider, or materially different data flow, this policy and the App Store privacy disclosures will be updated before or with that release."],
  ["Contact", "For privacy questions about AfterStorm, use the AfterStorm Support page and follow the contact link to Storm & Me Official."],
];

function SectionList({ sections }) {
  return (
    <section className="max-w-3xl mx-auto px-6 pb-24 space-y-9">
      {sections.map(([heading, paragraph]) => (
        <div key={heading}>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">{heading}</h2>
          <p className="mt-3 text-storm-silver/75 leading-relaxed font-light">{paragraph}</p>
        </div>
      ))}
      <p className="text-xs text-storm-silver/40 pt-4">Effective {EFFECTIVE_DATE} · Storm And Me LLC</p>
    </section>
  );
}

function AfterStormLinks() {
  return (
    <div className="max-w-3xl mx-auto px-6 pb-20 flex flex-wrap gap-4 text-sm">
      <Link className="text-storm-blue hover:text-white" to="/afterstorm">AfterStorm</Link>
      <Link className="text-storm-blue hover:text-white" to="/afterstorm/privacy">Privacy</Link>
      <Link className="text-storm-blue hover:text-white" to="/afterstorm/support">Support</Link>
      <Link className="text-storm-blue hover:text-white" to="/contact">Contact Storm & Me</Link>
    </div>
  );
}

function Overview() {
  return (
    <div>
      <PageHero overline="Storm And Me LLC · AfterStorm" title="Restore one thing." subtitle="AfterStorm turns an overwhelming day into small quests — then lets your storm-darkened world brighten as those wins add up." />
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="glass rounded-3xl p-7"><Sparkles className="w-8 h-8 text-amber-300" /><h2 className="font-display text-xl font-bold text-white mt-5">Small quests</h2><p className="text-storm-silver/70 mt-3">Choose the life areas that need attention and get a next step sized for the time you have.</p></div>
          <div className="glass rounded-3xl p-7"><Cloud className="w-8 h-8 text-storm-blue" /><h2 className="font-display text-xl font-bold text-white mt-5">A world that clears</h2><p className="text-storm-silver/70 mt-3">Complete quests, earn Sparks, and watch the visual restoration world move from storm toward recovery.</p></div>
          <div className="glass rounded-3xl p-7"><ShieldCheck className="w-8 h-8 text-emerald-300" /><h2 className="font-display text-xl font-bold text-white mt-5">Device-first</h2><p className="text-storm-silver/70 mt-3">No AfterStorm account is required for version 1.0. Optional camera, voice, and Apple Intelligence features use Apple platform capabilities.</p></div>
        </div>
        <div className="glass rounded-3xl p-8 mt-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div><h2 className="font-display text-2xl font-bold text-white">AfterStorm 1.0</h2><p className="text-storm-silver/65 mt-2">Privacy and support information for the iPhone release.</p></div>
          <div className="flex flex-wrap gap-3"><Link to="/afterstorm/privacy"><GlowButton>Privacy Policy</GlowButton></Link><Link to="/afterstorm/support"><GlowButton>Support</GlowButton></Link></div>
        </div>
      </section>
      <AfterStormLinks />
    </div>
  );
}

function Privacy() {
  return <div><PageHero overline="AfterStorm · Privacy" title="AfterStorm Privacy Policy" subtitle="How the iPhone app handles progress, iCloud sync, camera, voice, and Apple Intelligence features." /><SectionList sections={PRIVACY_SECTIONS} /><AfterStormLinks /></div>;
}

function Support() {
  return (
    <div>
      <PageHero overline="AfterStorm · Support" title="AfterStorm Support" subtitle="Help with quests, progress, permissions, iCloud sync, widgets, and the 1.0 iPhone release." />
      <section className="max-w-3xl mx-auto px-6 pb-24 space-y-6">
        <div className="glass rounded-3xl p-7"><Wrench className="w-7 h-7 text-storm-blue" /><h2 className="font-display text-xl font-bold text-white mt-4">Before contacting support</h2><ol className="mt-4 space-y-3 text-storm-silver/75 list-decimal pl-5"><li>Confirm the iPhone is running a supported iOS version.</li><li>Quit and reopen AfterStorm if a quest or widget appears stale.</li><li>For camera, microphone, speech, or photo issues, check the related permission in iOS Settings.</li><li>For iCloud progress, confirm iCloud is signed in and available on the device.</li><li>Include the app version, iPhone model, iOS version, and a short description of what happened when you contact us.</li></ol></div>
        <div className="glass rounded-3xl p-7"><h2 className="font-display text-xl font-bold text-white">Need more help?</h2><p className="text-storm-silver/70 mt-3">Use the Storm & Me Official contact page and mention <strong className="text-white">AfterStorm</strong> in your message. Do not send passwords, Apple ID credentials, authentication codes, or sensitive photos.</p><div className="mt-5"><Link to="/contact"><GlowButton>Contact Storm & Me</GlowButton></Link></div></div>
        <div className="glass rounded-3xl p-7"><h2 className="font-display text-xl font-bold text-white">Privacy</h2><p className="text-storm-silver/70 mt-3">Read how AfterStorm handles local progress, iCloud sync, optional camera and voice features, and Apple system intelligence.</p><div className="mt-5"><Link className="text-storm-blue hover:text-white" to="/afterstorm/privacy">Read the AfterStorm Privacy Policy →</Link></div></div>
      </section>
      <AfterStormLinks />
    </div>
  );
}

export default function AfterStormLegalPage({ slug = "overview" }) {
  if (slug === "privacy") return <Privacy />;
  if (slug === "support") return <Support />;
  return <Overview />;
}
