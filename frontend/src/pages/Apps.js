import React from "react";
import {
  Brain,
  CheckCircle2,
  Dumbbell,
  Gamepad2,
  Heart,
  ListChecks,
  Megaphone,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Overline, Reveal } from "../components/shared";

const LIVE_APPS = [
  {
    name: "First Check",
    Icon: ListChecks,
    eyebrow: "Daily workflow",
    description:
      "Turn repeatable checks into a clear workflow with evidence, verification, and reporting built around getting the job done right.",
    status: "Available on Google Play",
  },
  {
    name: "HoldWise AI",
    Icon: Brain,
    eyebrow: "Play · Learn · Practice",
    description:
      "Learn and practice card games with guided rules, full-table play, strategy coaching, daily challenges, progression, and mastery.",
    status: "Available on Google Play",
  },
  {
    name: "Marketing Pro",
    Icon: Megaphone,
    eyebrow: "Marketing tools",
    description:
      "A practical marketing companion from Storm And Me, built to help turn ideas into organized action without burying the work in clutter.",
    status: "Available on Google Play",
  },
  {
    name: "PairPilot AI",
    Icon: Heart,
    eyebrow: "Connection tools",
    description:
      "A relationship-focused AI experience built around thoughtful communication, reflection, and everyday connection.",
    status: "Available on Google Play",
  },
];

const COMING_APPS = [
  {
    name: "RepPurpose",
    Icon: Dumbbell,
    eyebrow: "Fitness · Wellness",
    description:
      "A purpose-driven fitness and wellness experience built around practical guidance, daily movement, progress, and healthier routines.",
    status: "Coming soon",
  },
  {
    name: "SRG",
    Icon: Smartphone,
    eyebrow: "Rebuilt experience",
    description:
      "A refreshed Storm And Me mobile experience with a rebuilt foundation and an updated Android release on the way.",
    status: "New release coming",
  },
  {
    name: "Lumina",
    Icon: Gamepad2,
    eyebrow: "Puzzle arcade",
    description:
      "A premium puzzle arcade blending daily play, progression, challenges, polished game feel, and smart features into one place.",
    status: "In development",
  },
];

function StatusPill({ children, live = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${
        live
          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
          : "border-storm-blue/20 bg-storm-blue/10 text-storm-blue"
      }`}
    >
      {live ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

function AppCard({ app, live = false }) {
  const { Icon } = app;

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]">
      <div className="absolute inset-0 bg-gradient-to-br from-storm-blue/[0.08] via-transparent to-white/[0.02] opacity-70 pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-lg">
            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <StatusPill live={live}>{app.status}</StatusPill>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-storm-blue/80">{app.eyebrow}</p>
        <h3 className="mt-2 font-display text-2xl font-black text-white">{app.name}</h3>
        <p className="mt-4 text-sm leading-relaxed text-storm-silver/65">{app.description}</p>
      </div>
    </article>
  );
}

export default function Apps() {
  return (
    <div className="relative min-h-screen pb-24 pt-28" data-testid="apps-page">
      <section className="mx-auto max-w-7xl px-6">
        <Reveal>
          <Overline className="mb-4">Storm And Me Apps</Overline>
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl">
              Useful tools. Better experiences. <span className="italic text-storm-blue">Built with purpose.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-storm-silver/75 sm:text-lg">
              Storm And Me builds practical apps for everyday life—from productivity and learning to wellness,
              relationships, marketing, and play. Different lanes, same rule: make it useful, make it polished, and
              make it worth opening again.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-6" aria-labelledby="available-apps-title">
        <Reveal delay={0.06}>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">Available now</span>
              </div>
              <h2 id="available-apps-title" className="mt-2 font-display text-3xl font-black text-white">
                On Google Play
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-storm-silver/55">
              These Storm And Me apps have cleared the release line and are part of the live Android portfolio.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {LIVE_APPS.map((app) => (
              <AppCard key={app.name} app={app} live />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6" aria-labelledby="coming-apps-title">
        <Reveal delay={0.1}>
          <div className="mb-6">
            <div className="flex items-center gap-2 text-storm-blue">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">What&apos;s next</span>
            </div>
            <h2 id="coming-apps-title" className="mt-2 font-display text-3xl font-black text-white">
              In the pipeline
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-storm-silver/55">
              More releases are moving through final review, rebuild, and store-readiness work now.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {COMING_APPS.map((app) => (
              <AppCard key={app.name} app={app} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6">
        <Reveal delay={0.12}>
          <div className="relative overflow-hidden rounded-[2rem] border border-storm-blue/20 bg-storm-blue/[0.06] px-6 py-8 sm:px-9">
            <div className="absolute inset-0 bg-gradient-to-r from-storm-blue/[0.08] via-transparent to-emerald-400/[0.05] pointer-events-none" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-storm-blue">One studio · many lanes</p>
                <h2 className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">
                  Technology with a human reason behind it.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-storm-silver/65">
                  Every Storm And Me app starts with a simple question: can this make somebody&apos;s day easier,
                  clearer, healthier, more connected, or more fun? If the answer is yes, we build.
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-bold text-white">
                More launches ahead.
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
