import React from "react";
import PageHero from "../components/PageHero";
import { NewsletterSection, Reveal, GlowButton } from "../components/shared";
import { ASSETS, BRAND } from "../lib/assets";

const SECTIONS = [
  { h: "Why this place exists", p: "StormAndMeOfficial was built for the people nobody sees struggling—the ones holding it together at work, then unpacking the weight alone at night. It exists so that no one has to face a hard season without something in their corner." },
  { h: "For the ones starting over", p: "Starting over is quiet and unglamorous. It is small, faithful choices repeated until they add up to a new direction. These books, songs, and messages are here to keep company on that long, ordinary climb." },
  { h: "For the hurting and the healing", p: "Heartbreak, loss, depression, regret, loneliness—real life does not always resolve neatly. Nothing here pretends it does. Instead, it offers honesty, comfort, and the reminder that pain can slowly become purpose." },
  { h: "For the still-standing", p: "Some days, simply still being here is the whole victory. This community celebrates that. Whatever storm brought someone to this page, the message is the same: you are more than what happened to you." },
  { h: "Books created to help", p: "From gentle children's stories about big feelings to honest books about setbacks and second chances, each title is written to meet readers where they are and walk beside them toward hope." },
  { h: "Music created to connect", p: "Songs for the drive home, the sleepless nights, and the mornings of choosing to keep going—music made to help listeners feel understood, encouraged, and a little less alone." },
  { h: "Messages you can carry", p: "The merchandise is not about a brand. It is wearable encouragement—reminders of strength, faith, healing, and survival, for the wearer and for the next person who needs to see them." },
  { h: "What comes next", p: "More books. More music. More reminders. The story is still being written—and so is yours. Some storms change the road. They do not have to end the journey." },
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
            Built From the Storm—<span className="text-storm-blue text-glow-blue italic">For Everyone Still In One.</span>
          </h1>
          <p className="mt-6 text-storm-silver/80 max-w-2xl font-light text-lg">The mission behind {BRAND.name}.</p>
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
          <p className="font-display italic text-2xl text-storm-gold/90">"{BRAND.line}"</p>
          <p className="mt-4 text-storm-silver/60 font-light">Created by author, songwriter, and storyteller {BRAND.creator}.</p>
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
