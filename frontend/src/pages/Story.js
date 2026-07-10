import React from "react";
import PageHero from "../components/PageHero";
import { NewsletterSection, Reveal, GlowButton } from "../components/shared";
import { ASSETS, BRAND } from "../lib/assets";

const SECTIONS = [
  { h: "Where the journey began", p: "It didn't start with a plan. It started with a season I didn't choose and couldn't fix. The kind of season where you stop performing and start being honest, mostly because you're too tired to pretend." },
  { h: "Life changes", p: "Everything I thought was stable turned out to be balanced on things I couldn't control. When they moved, I moved with them—whether I wanted to or not." },
  { h: "Career struggles", p: "There was a version of me measured entirely by a title and a paycheck. When that was gone, I had to find out who I was without the résumé." },
  { h: "Personal setbacks", p: "Some of the storms were public. Most of them were quiet—the ones you carry to work with a straight face and unpack alone at 2 a.m." },
  { h: "Mental and emotional battles", p: "I learned that strength isn't never falling apart. Sometimes it's falling apart in a safe place and choosing to get back up in the morning." },
  { h: "Starting over", p: "Starting over is unglamorous. It's small, boring, faithful choices repeated until they add up to a new direction. Nobody claps. You just keep going." },
  { h: "Becoming an author", p: "I started writing the words I needed to hear. Then I realized someone else needed them too. That's when the books stopped being therapy and became a mission." },
  { h: "Becoming a songwriter", p: "Some feelings refused to sit still on a page. They wanted rhythm. So I gave them one." },
  { h: "Building websites and apps", p: "I'm a technology professional too. So I built the home you're standing in—this site—brick by brick, in between everything else." },
  { h: "Creating content", p: "Videos, posts, songs, stories—different doors into the same house. However you found me, I'm glad you're here." },
  { h: "Helping other people feel less alone", p: "If there's a point to all of it, it's this: so the next person in the rain knows the storm doesn't get the final word." },
  { h: "What comes next", p: "More books. More music. More reminders. The story isn't finished—and neither are you." },
];

export default function Story() {
  return (
    <div>
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={ASSETS.hero} alt="Storm breaking into light" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-storm-base via-storm-base/70 to-storm-base/20" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 pb-16">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
            I Didn't Choose Every Storm. <span className="text-storm-blue text-glow-blue italic">But I Chose What I Built Inside It.</span>
          </h1>
          <p className="mt-6 text-storm-silver/80 max-w-2xl font-light text-lg">The honest story behind {BRAND.name}.</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-20 space-y-14">
        {SECTIONS.map((s, i) => (
          <Reveal key={i} delay={0.02 * (i % 4)}>
            <article>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">{s.h}</h2>
              <p className="mt-4 text-storm-silver/80 leading-relaxed font-light text-lg">{s.p}</p>
            </article>
          </Reveal>
        ))}
        <div className="pt-6 text-center">
          <p className="font-display italic text-2xl text-storm-gold/90">"{BRAND.message}"</p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <GlowButton to="/books" data-testid="story-explore-books">Explore the Books</GlowButton>
            <GlowButton to="/music" variant="secondary" data-testid="story-hear-music">Hear the Music</GlowButton>
          </div>
        </div>
      </section>
      <NewsletterSection />
    </div>
  );
}
