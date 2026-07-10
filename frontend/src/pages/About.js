import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Music, Code, Sparkles } from "lucide-react";
import PageHero from "../components/PageHero";
import { GlowButton, Overline, NewsletterSection, SocialIcons, Reveal } from "../components/shared";
import { ASSETS, BRAND } from "../lib/assets";

const TIMELINE = [
  { year: "The Beginning", text: "Long nights, big questions, and the first pages written just to survive them." },
  { year: "The Layoff", text: "A career ending became the door to a life that finally fit." },
  { year: "The First Book", text: "Turning private pain into something that could comfort a stranger." },
  { year: "The Music", text: "The feelings that wouldn't fit on a page became songs instead." },
  { year: "The Build", text: "Websites, apps, and this creative home—built in the middle of the storm." },
  { year: "What Comes Next", text: "More books, more music, more reminders that no one walks the storm alone." },
];

const JOURNEYS = [
  { Icon: BookOpen, title: "Author Journey", text: "From private journals to a growing library of books for children and adults navigating real life." },
  { Icon: Music, title: "Music Journey", text: "Songs about love, faith, regret, survival, and getting back up—released one honest track at a time." },
  { Icon: Code, title: "Technology & Career", text: "A technology professional who builds the platforms that carry the message to more people." },
  { Icon: Sparkles, title: "Future Vision", text: "A creative universe where books, music, videos, and merch all tell one story: keep building." },
];

export default function About() {
  return (
    <div>
      <PageHero overline="Meet the Creator" title="The Storm Was Real. So Was the Comeback."
        subtitle={`${BRAND.creator} is an author, songwriter, storyteller, content creator, and technology professional who creates for people navigating real life.`} />

      <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center pb-16">
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-4 bg-storm-blue/10 blur-3xl rounded-full" />
            <img src={ASSETS.portraitAlt} alt={BRAND.creator} className="relative rounded-3xl w-full h-[520px] object-cover border border-white/10" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-storm-silver/80 leading-relaxed font-light">
            His work speaks to people who have questioned themselves, lost something important, faced setbacks, lived through heartbreak, started over, or wondered whether their best days were already behind them.
          </p>
          <p className="mt-4 text-storm-silver/80 leading-relaxed font-light">
            His books and music do not pretend that life is always easy. They remind people that darkness can still produce wisdom, songs, stories, faith, laughter, healing, and a new beginning.
          </p>
          <div className="mt-8"><GlowButton to="/story" data-testid="about-read-story">Read the Full Story</GlowButton></div>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <Overline className="mb-3">The Path</Overline>
        <h2 className="font-display text-3xl font-bold text-white mb-10">Four Journeys, One Story</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {JOURNEYS.map((j, i) => (
            <Reveal key={j.title} delay={i * 0.05}>
              <div className="glass rounded-2xl p-7 h-full">
                <j.Icon className="w-7 h-7 text-storm-blue" />
                <h3 className="font-display text-xl font-bold text-white mt-4">{j.title}</h3>
                <p className="text-storm-silver/70 mt-2 font-light leading-relaxed">{j.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <Overline className="mb-3">Milestones</Overline>
        <h2 className="font-display text-3xl font-bold text-white mb-10">A Timeline of Creating in the Rain</h2>
        <div className="relative border-l border-white/15 pl-8 space-y-8">
          {TIMELINE.map((t, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="relative">
                <span className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-storm-blue shadow-[0_0_14px_rgba(59,130,246,0.7)]" />
                <p className="font-display text-lg font-semibold text-white">{t.year}</p>
                <p className="text-storm-silver/70 font-light mt-1">{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-12 text-center">
        <Overline className="mb-5">Follow the Journey</Overline>
        <div className="flex justify-center"><SocialIcons /></div>
      </section>
      <NewsletterSection />
    </div>
  );
}
