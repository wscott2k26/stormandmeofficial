import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  Sparkles,
  Smartphone,
} from "lucide-react";
import registry from "../data/iamPrototypeScreens.json";

const DEMO_ITEMS = {
  onboarding: ["Clear adult consent", "Visible AI boundaries", "User-controlled personalization"],
  home: ["One useful move", "Recent progress", "Discreet support access"],
  talk: ["Text or voice", "Save only by choice", "Turn insight into action"],
  plan: ["Editable steps", "Flexible timing", "Progress without guilt"],
  career: ["Use verified experience", "Show evidence gaps", "Never invent qualifications"],
  relationships: ["Prepare the conversation", "Set personal boundaries", "Notice concerning patterns"],
  wellness: ["Name the moment", "Choose a gentle reset", "Bring real people in"],
  "confidence-style": ["Work with real preferences", "Respect budget and maintenance", "Label shopping relationships"],
  safety: ["Check immediate danger", "Use verified resources", "Never promise erased traces"],
  community: ["Adults only", "Moderated participation", "No direct messages"],
  memory: ["See every memory", "Know why it was saved", "Edit, pause, or delete"],
  "profile-subscription": ["Control privacy", "Manage accessibility", "Restore or manage purchase"],
  "admin-support": ["Least-privilege review", "Verified resource lifecycle", "Auditable incident response"],
};

function ScreenPreview({ area, screen, lane, onPrimary, onSecondary }) {
  const items = DEMO_ITEMS[area.id] || [];
  const progressPercent = Math.max(
    18,
    Math.round(((area.screens.indexOf(screen) + 1) / area.screens.length) * 100)
  );

  return (
    <div className="relative mx-auto w-full max-w-[390px] overflow-hidden rounded-[2.6rem] border border-white/15 bg-[#090b13] shadow-2xl shadow-black/70">
      <div className="flex items-center justify-between border-b border-white/10 px-6 pb-3 pt-4 text-[10px] tracking-[0.18em] text-white/45">
        <span>9:41</span>
        <span className="flex items-center gap-1.5"><LockKeyhole aria-hidden="true" className="h-3 w-3" /> PRIVATE</span>
        <span>100%</span>
      </div>

      <div className="min-h-[690px] bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.17),_transparent_38%),linear-gradient(180deg,#101522_0%,#090b13_65%)] px-5 pb-6 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-300/75">{screen.eyebrow}</p>
            <p className="mt-1 text-xs text-white/45">{lane.label} lane · synthetic review data</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-300/25 bg-sky-300/10">
            {screen.safetyPath ? <ShieldCheck aria-hidden="true" className="h-5 w-5 text-sky-200" /> : <Sparkles aria-hidden="true" className="h-5 w-5 text-sky-200" />}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-3xl font-bold leading-tight text-white">{screen.title}</h2>
          <p className="mt-4 text-sm leading-6 text-white/65">{screen.summary}</p>
        </div>

        {screen.safetyPath && (
          <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100/80">
            <div className="flex gap-2">
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>This experience is not emergency response or real-time monitoring. Quick exit cannot erase device, browser, network, or account traces.</span>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {items.map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xs font-bold text-sky-200">{index + 1}</div>
              <span className="text-sm text-white/75">{item}</span>
              <ChevronRight aria-hidden="true" className="ml-auto h-4 w-4 text-white/25" />
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-3xl border border-white/10 bg-black/25 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Prototype interaction</span>
            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-emerald-200">Connected</span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label={`${area.label} screen progress`}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progressPercent}
          >
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="mt-7 space-y-3">
          <button type="button" onClick={onPrimary} className="w-full rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">
            {screen.primaryAction}
          </button>
          {screen.secondaryAction && (
            <button type="button" onClick={onSecondary} className="w-full rounded-2xl border border-white/12 bg-white/[0.035] px-5 py-3.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">
              {screen.secondaryAction}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-[10px] leading-4 text-white/30">I AM is an AI-assisted planning product. It may be wrong and does not replace qualified professional or emergency help.</p>
      </div>
    </div>
  );
}

function ExitDemo({ onReturn }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#eef3f8] p-6 text-slate-900" role="dialog" aria-modal="true" aria-labelledby="quick-exit-title">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100"><LogOut aria-hidden="true" className="h-6 w-6 text-sky-700" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Quick-exit demonstration</p>
            <h2 id="quick-exit-title" className="mt-1 text-2xl font-bold">Weather & Notes</h2>
          </div>
        </div>
        <p className="mt-6 leading-7 text-slate-600">A production quick exit would open a neutral destination chosen during safety design. It cannot guarantee that app, browser, device, router, carrier, notification, or account history is removed.</p>
        <button type="button" onClick={onReturn} autoFocus className="mt-7 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">Return to internal review</button>
      </div>
    </div>
  );
}

export default function IamPrototype() {
  const [activeAreaId, setActiveAreaId] = useState("home");
  const [screenIndex, setScreenIndex] = useState(0);
  const [laneId, setLaneId] = useState("becoming");
  const [exitDemo, setExitDemo] = useState(false);

  const activeArea = useMemo(
    () => registry.areas.find((area) => area.id === activeAreaId) || registry.areas[0],
    [activeAreaId]
  );
  const currentScreen = activeArea.screens[Math.min(screenIndex, activeArea.screens.length - 1)];
  const activeLane = registry.lanes.find((lane) => lane.id === laneId) || registry.lanes[0];
  const totalScreens = registry.areas.reduce((sum, area) => sum + area.screens.length, 0);

  const chooseArea = (areaId, targetIndex = 0) => {
    setActiveAreaId(areaId);
    setScreenIndex(targetIndex);
  };

  const move = (direction) => {
    const next = screenIndex + direction;
    if (next >= 0 && next < activeArea.screens.length) {
      setScreenIndex(next);
      return;
    }

    const areaPosition = registry.areas.findIndex((area) => area.id === activeArea.id);
    const nextAreaPosition = areaPosition + direction;
    if (nextAreaPosition >= 0 && nextAreaPosition < registry.areas.length) {
      const nextArea = registry.areas[nextAreaPosition];
      chooseArea(nextArea.id, direction > 0 ? 0 : nextArea.screens.length - 1);
      return;
    }

    if (direction > 0) {
      chooseArea(registry.areas[0].id, 0);
    }
  };

  const handlePrimary = () => {
    if (currentScreen.safetyPath && activeArea.id !== "safety") {
      chooseArea("safety", 0);
      return;
    }
    if (currentScreen.id === "safety-quick-exit") {
      setExitDemo(true);
      return;
    }
    move(1);
  };

  const handleSecondary = () => {
    if ((currentScreen.secondaryAction || "").toLowerCase().includes("quick exit")) {
      setExitDemo(true);
      return;
    }
    move(-1);
  };

  return (
    <div className="min-h-screen bg-[#06080d] pb-24 pt-28 text-white">
      {exitDemo && <ExitDemo onReturn={() => setExitDemo(false)} />}

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.07] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <p className="text-sm font-bold text-amber-100">Internal concept review · noindex</p>
              <p className="mt-1 text-sm leading-6 text-amber-100/65">I AM is a working title under domain and trademark review. This synthetic prototype is not a public launch, medical product, emergency service, or live user environment.</p>
            </div>
          </div>
          <div className="mt-4 whitespace-nowrap rounded-full border border-amber-200/20 px-4 py-2 text-xs font-semibold text-amber-100 sm:mt-0">{registry.meta.version}</div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-sky-300/70"><Smartphone aria-hidden="true" className="h-4 w-4" /> Storm And Me LLC</div>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[0.98] sm:text-7xl">A whole life, turned into the next honest move.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">Review the complete Release 1.0 experience screen by screen. Change lanes, jump between product areas, click primary actions, test Safety access, and inspect every room before native build authorization.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-3xl font-bold">{registry.areas.length}</p><p className="mt-1 text-xs uppercase tracking-wider text-white/40">Product areas</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-3xl font-bold">{totalScreens}</p><p className="mt-1 text-xs uppercase tracking-wider text-white/40">Review screens</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-3xl font-bold">3</p><p className="mt-1 text-xs uppercase tracking-wider text-white/40">Support lanes</p></div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Companion lane selector">
          {registry.lanes.map((lane) => (
            <button key={lane.id} type="button" aria-pressed={lane.id === laneId} onClick={() => setLaneId(lane.id)} className={`rounded-full border px-4 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${lane.id === laneId ? "border-sky-300/50 bg-sky-300/15 text-white" : "border-white/10 bg-white/[0.025] text-white/50 hover:text-white"}`}>
              {lane.label}
            </button>
          ))}
          <span className="flex items-center px-3 text-xs text-white/35">{activeLane.description}</span>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-[1500px] px-4 sm:px-7">
        <div className="overflow-x-auto pb-3">
          <div className="flex min-w-max gap-2" role="tablist" aria-label="I AM product areas">
            {registry.areas.map((area) => (
              <button key={area.id} type="button" role="tab" aria-selected={area.id === activeArea.id} onClick={() => chooseArea(area.id)} className={`rounded-2xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${area.id === activeArea.id ? "border-sky-300/40 bg-sky-300/12 text-white" : "border-white/8 bg-white/[0.025] text-white/45 hover:border-white/15 hover:text-white"}`}>
                <span className="block text-sm font-semibold">{area.label}</span>
                <span className="mt-1 block text-[10px] uppercase tracking-wider opacity-60">{area.screens.length} screens</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-7 xl:grid-cols-[300px_minmax(390px,510px)_minmax(300px,1fr)] xl:items-start xl:justify-center">
          <aside className="order-2 rounded-3xl border border-white/10 bg-white/[0.025] p-4 xl:order-1 xl:sticky xl:top-24">
            <div className="flex items-center justify-between px-2 pb-4">
              <div><p className="text-xs uppercase tracking-[0.22em] text-white/35">Current area</p><h2 className="mt-1 text-xl font-bold">{activeArea.label}</h2></div>
              <LayoutGrid aria-hidden="true" className="h-5 w-5 text-sky-300/65" />
            </div>
            <p className="px-2 pb-4 text-sm leading-6 text-white/45">{activeArea.description}</p>
            <div className="max-h-[590px] space-y-1 overflow-y-auto pr-1" aria-label={`${activeArea.label} screens`}>
              {activeArea.screens.map((screen, index) => (
                <button key={screen.id} type="button" aria-current={index === screenIndex ? "step" : undefined} onClick={() => setScreenIndex(index)} className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${index === screenIndex ? "bg-white/10 text-white" : "text-white/45 hover:bg-white/[0.05] hover:text-white/80"}`}>
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${index === screenIndex ? "bg-sky-300 text-slate-950" : "bg-white/5"}`}>{index + 1}</span>
                  <span className="text-sm leading-5">{screen.title}</span>
                </button>
              ))}
            </div>
          </aside>

          <main className="order-1 xl:order-2">
            <ScreenPreview area={activeArea} screen={currentScreen} lane={activeLane} onPrimary={handlePrimary} onSecondary={handleSecondary} />
            <div className="mx-auto mt-5 flex max-w-[390px] items-center justify-between gap-3">
              <button type="button" onClick={() => move(-1)} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/55 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Previous</button>
              <span className="text-xs text-white/35" aria-live="polite">{screenIndex + 1} / {activeArea.screens.length}</span>
              <button type="button" onClick={() => move(1)} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/55 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">Next <ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
            </div>
          </main>

          <aside className="order-3 space-y-5 xl:sticky xl:top-24">
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300/65">Screen contract</p>
              <dl className="mt-5 space-y-4 text-sm">
                <div><dt className="text-white/35">Stable ID</dt><dd className="mt-1 font-mono text-xs text-white/75">{currentScreen.id}</dd></div>
                <div><dt className="text-white/35">Access</dt><dd className="mt-1 text-white/75">{currentScreen.premium ? "Premium workflow; safety remains free" : "Core access"}</dd></div>
                <div><dt className="text-white/35">Primary result</dt><dd className="mt-1 text-white/75">{currentScreen.primaryAction}</dd></div>
                <div><dt className="text-white/35">Safety routing</dt><dd className="mt-1 text-white/75">{currentScreen.safetyPath ? "Routes into Safety Path" : "Standard product safeguards"}</dd></div>
              </dl>
            </div>

            <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.055] p-6">
              <div className="flex items-center gap-3"><CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-300" /><h3 className="font-bold">No empty rooms</h3></div>
              <p className="mt-3 text-sm leading-6 text-white/55">Only Release 1.0 workflows appear here. Deferred marketplaces, minors, romantic roleplay, direct messages, passive monitoring, and automated high-risk actions are intentionally absent.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">Live policy routes</p>
              <div className="mt-4 space-y-2 text-sm">
                {[
                  ["Privacy", "/iam/privacy"],
                  ["Terms", "/iam/terms"],
                  ["Safety", "/iam/safety"],
                  ["Support", "/iam/support"],
                  ["Delete account", "/iam/delete-account"],
                ].map(([label, to]) => (
                  <Link key={to} to={to} className="flex items-center justify-between rounded-xl border border-white/8 px-4 py-3 text-white/55 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">
                    {label}<ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}