import React from "react";
import { ExternalLink, HeartHandshake, Newspaper, Sprout, Ticket, Clock3, BadgeCheck } from "lucide-react";
import PageHero from "../components/PageHero";
import { GlowButton, Overline, Reveal } from "../components/shared";

const PROJECTS = [
  {
    name: "StillAble Care",
    type: "Caregiving & accessibility",
    description: "A practical Windows app designed to help older adults and caregivers handle everyday technology with more confidence and less frustration.",
    status: "Awaiting Microsoft certification",
    icon: HeartHandshake,
    url: "",
  },
  {
    name: "YardWise",
    type: "Home & lawn care",
    description: "Helpful lawn and yard guidance built to turn confusing outdoor projects into clear, manageable next steps.",
    status: "Available on Microsoft Store",
    icon: Sprout,
    url: "",
  },
  {
    name: "SeatSavvy",
    type: "Travel planning",
    description: "A travel companion focused on helping people make smarter, more comfortable seating decisions before they go.",
    status: "Available on Microsoft Store",
    icon: Ticket,
    url: "",
  },
  {
    name: "Viral Laundry",
    type: "Entertainment & culture",
    description: "A fast-moving entertainment destination for trending stories, music, sports, celebrity culture, and the conversations people are already having.",
    status: "Live now",
    icon: Newspaper,
    url: "https://www.virallaundry.com",
  },
];

export default function Projects() {
  return (
    <div>
      <PageHero
        overline="Beyond the Storm"
        title="Useful Ideas Built for Real Life"
        subtitle="Storm & Me is more than a storefront. It is a growing family of books, music, tools, and projects created to encourage, inform, simplify, and help people move forward."
      />

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {PROJECTS.map((project, index) => {
            const Icon = project.icon;
            const isLive = Boolean(project.url);
            return (
              <Reveal key={project.name} delay={(index % 2) * 0.08}>
                <article className="wet-glass h-full rounded-3xl border border-white/10 p-7 sm:p-9">
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <Icon className="h-7 w-7 text-storm-blue" />
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-storm-silver/70">
                      {isLive ? <BadgeCheck className="h-3.5 w-3.5 text-storm-gold" /> : <Clock3 className="h-3.5 w-3.5 text-storm-blue" />}
                      {project.status}
                    </span>
                  </div>

                  <Overline className="mt-7 mb-3">{project.type}</Overline>
                  <h2 className="font-display text-3xl font-bold text-white">{project.name}</h2>
                  <p className="mt-4 text-storm-silver/72 leading-relaxed font-light">{project.description}</p>

                  <div className="mt-8">
                    {isLive ? (
                      <GlowButton href={project.url} data-testid={`project-${project.name.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                        Visit {project.name} <ExternalLink className="h-4 w-4" />
                      </GlowButton>
                    ) : (
                      <p className="text-sm text-storm-gold/80">Official download link will be added here as soon as the store listing is ready.</p>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}
