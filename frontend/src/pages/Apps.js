import React from "react";
import { Brain, Gamepad2, GraduationCap, ShieldCheck, Smartphone, Sparkles, Trophy } from "lucide-react";
import { Overline, Reveal } from "../components/shared";

const HOLDWISE_FEATURES = [
  { Icon: Gamepad2, title: "21 complete card games", body: "Play full tables across poker, blackjack, solitaire, trick-taking, rummy, and family classics." },
  { Icon: GraduationCap, title: "Guided Card Academy", body: "Learn rules and table flow through structured tutorials backed by the same engines used in full play." },
  { Icon: Brain, title: "Coach Ace", body: "Get strategy guidance, practice decisions, and understand the why behind the move." },
  { Icon: Trophy, title: "Practice & mastery", body: "Build reps with daily challenges, progress tracking, streaks, and mastery XP." },
];

export default function Apps() {
  return (
    <div className="relative pt-28 pb-24 min-h-screen" data-testid="apps-page">
      <section className="max-w-7xl mx-auto px-6">
        <Reveal>
          <Overline className="mb-4">Storm And Me Apps</Overline>
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.02]">
              Useful tools. Real play. <span className="text-storm-blue italic">Built with purpose.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-storm-silver/75 max-w-3xl font-light">
              Storm And Me creates apps that turn ideas into something you can actually use—experiences for learning, practice, encouragement, and everyday life.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-6 mt-14" aria-labelledby="holdwise-title">
        <Reveal delay={0.08}>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-storm-blue/5 to-amber-300/10 pointer-events-none" />
            <div className="relative p-6 sm:p-9 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
                    <Sparkles className="w-3.5 h-3.5" /> Featured App
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-900 via-slate-950 to-amber-950 flex items-center justify-center shadow-xl">
                      <span className="font-display text-2xl font-black text-amber-200">HW</span>
                    </div>
                    <div>
                      <h2 id="holdwise-title" className="font-display text-4xl sm:text-5xl font-black text-white">HoldWise AI</h2>
                      <p className="mt-1 text-storm-silver/60">Play · Learn · Practice · Master</p>
                    </div>
                  </div>
                  <p className="mt-6 text-storm-silver/80 leading-relaxed text-base sm:text-lg font-light">
                    A premium card-game learning and practice experience that puts full games, real rules, guided lessons, strategy training, and Coach Ace in one polished place. HoldWise is built for people who want to play more—and understand more with every hand.
                  </p>
                </div>

                <div className="lg:w-72 shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-2 text-emerald-200 font-bold"><ShieldCheck className="w-5 h-5" /> Release status</div>
                  <p className="mt-3 text-white text-lg font-bold">Google Play listing in progress</p>
                  <p className="mt-2 text-sm leading-relaxed text-storm-silver/60">Android release testing and store assets are being finalized now.</p>
                  <div className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-storm-silver/55" aria-disabled="true">
                    Google Play · Coming Soon
                  </div>
                </div>
              </div>

              <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {HOLDWISE_FEATURES.map(({ Icon, title, body }) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                    <Icon className="w-5 h-5 text-amber-200" />
                    <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-storm-silver/60">{body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-9 rounded-2xl border border-storm-blue/20 bg-storm-blue/[0.06] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-storm-blue" />
                  <div>
                    <p className="font-bold text-white">Real Android screenshots are being verified.</p>
                    <p className="text-sm text-storm-silver/55">They will appear here as soon as the final packaged-app capture passes visual QA.</p>
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.16em] text-storm-blue/80 font-bold whitespace-nowrap">No mockups</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
