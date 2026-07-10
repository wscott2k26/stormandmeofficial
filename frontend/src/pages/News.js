import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../lib/api";
import PageHero from "../components/PageHero";
import { GlowButton, NewsletterSection, Reveal } from "../components/shared";

export default function News() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { getPosts().then(setPosts).catch(() => {}); }, []);

  return (
    <div>
      <PageHero overline="News & Updates" title="From Behind the Storm"
        subtitle="New books, music releases, videos, merch launches, personal updates, and creative journey posts." />
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="news-grid">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.05}>
              <article className="group glass rounded-2xl overflow-hidden flex flex-col h-full hover:border-white/25 hover:-translate-y-1 transition-all" data-testid={`post-card-${p.id}`}>
                <Link to={`/news/${p.id}`} className="block aspect-video overflow-hidden">
                  <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-storm-blue/80 uppercase tracking-widest">{p.category}</span>
                    <span className="text-storm-silver/40">{new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mt-2 leading-tight">{p.title}</h3>
                  <p className="text-storm-silver/70 text-sm mt-3 font-light flex-1">{p.preview}</p>
                  <Link to={`/news/${p.id}`} className="mt-4 text-storm-blue text-sm font-semibold hover:text-storm-blue/80" data-testid={`read-more-${p.id}`}>Read More →</Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <NewsletterSection />
    </div>
  );
}
