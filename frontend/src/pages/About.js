import React from "react";
import { BookOpen, Music, Code, Sparkles, Library, HeartHandshake, CloudSun } from "lucide-react";
import PageHero from "../components/PageHero";
import { GlowButton, Overline, NewsletterSection, SocialIcons, Reveal } from "../components/shared";
import { ASSETS, BRAND } from "../lib/assets";

const TIMELINE = [
  { year: "The Questions", text: "Long nights, private battles, and pages first written to make sense of what life was doing." },
  { year: "The Setbacks", text: "Career changes, heartbreak, uncertainty, and the quiet work of learning how to begin again." },
  { year: "The Books", text: "Personal pain, faith, imagination, and hard-earned lessons became stories that could walk beside somebody else." },
  { year: "The Music", text: "The feelings that would not fit on a page found rhythm, melody, humor, confession, and hope." },
  { year: "The Build", text: "Websites, apps, channels, and Storm & Me Official were built while the story was still unfolding." },
  { year: "What Comes Next", text: "More honest work, more creative risks, and more reminders that the storm does not get the final word." },
];

const JOURNEYS = [
  { Icon: BookOpen, title: "Will Scott — The Author", text: "A growing library spanning healing, faith, career and life, children's emotional stories, and science fiction." },
  { Icon: Music, title: "Willy Will — The Artist", text: "Songs about love, faith, regret, social media, grief, survival, laughter, and getting back up." },
  { Icon: Code, title: "The Builder", text: "A systems administrator and technology creator who builds the platforms that carry the work into the world." },
  { Icon: Sparkles, title: "The Vision", text: "One creative universe where books, music, videos, technology, and meaningful products all carry the same heartbeat." },
];

const VALUES = [
  { Icon: HeartHandshake, title: "People Before Applause", text: "Create something useful, honest, comforting, or unforgettable—not merely something polished." },
  { Icon: CloudSun, title: "Hope Without Pretending", text: "Make room for pain and still leave a window open for light." },
  { Icon: Library, title: "Build a Body of Work", text: "One book, one song, and one brave idea at a time. Legacy is built, not announced." },
];

export default function About() {
  return (
    <div>
      <PageHero
        overline="Meet the Creator"
        title="Will Scott on the Page. Willy Will on the Record."
        subtitle="Author, songwriter, storyteller, content creator, systems administrator, and builder of Storm & Me Official."
      />

      <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center pb-16">
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-4 bg-storm-blue/10 blur-3xl rounded-full" />
            <img src={ASSETS.portraitAlt} alt={`${BRAND.creator}, author Will Scott`} className="relative rounded-3xl w-full h-[520px] object-cover border border-white/10" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Overline className="mb-4">The man behind the storm</Overline>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">Creating From Real Life—not Above It</h2>
          <p className="mt-6 text-storm-silver/80 leading-relaxed font-light">
            Will Scott writes for people who have questioned themselves, lost something important, faced setbacks, lived through heartbreak, started over, or wondered whether their best days were already behind them.
          </p>
          <p className="mt-4 text-storm-silver/80 leading-relaxed font-light">
            As Willy Will, those same experiences become songs—sometimes deep, sometimes funny, sometimes spiritual, but always built around a feeling somebody else might recognize.
          </p>
          <p className="mt-4 text-storm-silver/80 leading-relaxed font-light">
            The work never claims life is easy. It says something quieter and stronger: pain can still produce wisdom, faith, laughter, stories, music, and a new beginning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GlowButton to="/story" data-testid="about-read-story">Read the Full Story</GlowButton>
            <GlowButton to="/books" variant="secondary">Explore the Books</GlowButton>
          </div>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ["10", "Published books connected"],
            ["2", "Creative names, one mission"],
            ["∞", "Ideas still in the storm"],
          ].map(([number, label]) => (
            <Reveal key={label}>
              <div className="glass rounded-2xl p-6 text-center">
                <p className="font-display text-4xl font-black text-storm-blue">{number}</p>
                <p className="mt-2 text-sm text-storm-silver/65">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <Overline className="mb-3">The Creative Life</Overline>
        <h2 className="font-display text-3xl font-bold text-white mb-10">Four Journeys, One Story</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {JOURNEYS.map((journey, index) => (
            <Reveal key={journey.title} delay={index * 0.05}>
              <div className="glass rounded-2xl p-7 h-full">
                <journey.Icon className="w-7 h-7 text-storm-blue" />
                <h3 className="font-display text-xl font-bold text-white mt-4">{journey.title}</h3>
                <p className="text-storm-silver/70 mt-2 font-light leading-relaxed">{journey.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <Overline className="mb-3">What guides the work</Overline>
        <h2 className="font-display text-3xl font-bold text-white mb-10">The Storm & Me Standard</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.06}>
              <div className="wet-glass rounded-2xl border border-white/10 p-7 h-full">
                <value.Icon className="h-7 w-7 text-storm-gold" />
                <h3 className="mt-4 font-display text-xl font-bold text-white">{value.title}</h3>
                <p className="mt-3 text-storm-silver/70 leading-relaxed font-light">{value.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <Overline className="mb-3">Milestones</Overline>
        <h2 className="font-display text-3xl font-bold text-white mb-10">A Timeline of Creating in the Rain</h2>
        <div className="relative border-l border-white/15 pl-8 space-y-8">
          {TIMELINE.map((item, index) => (
            <Reveal key={item.year} delay={index * 0.05}>
              <div className="relative">
                <span className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-storm-blue shadow-[0_0_14px_rgba(59,130,246,0.7)]" />
                <p className="font-display text-lg font-semibold text-white">{item.year}</p>
                <p className="text-storm-silver/70 font-light mt-1">{item.text}</p>
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
