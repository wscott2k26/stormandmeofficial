import React, { useEffect, useState } from "react";
import { Play, Youtube } from "lucide-react";
import { getVideos } from "../lib/api";
import PageHero from "../components/PageHero";
import { GlowButton, Overline, NewsletterSection, Reveal } from "../components/shared";

const TYPES = ["All", "Music Videos", "Book Trailers", "Lyric Videos", "Behind-the-Scenes", "Personal Messages"];

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [active, setActive] = useState("All");
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(6);

  useEffect(() => { getVideos().then((v) => { setVideos(v); setCurrent(v.find((x) => x.featured) || v[0]); }).catch(() => {}); }, []);

  const filtered = active === "All" ? videos : videos.filter((v) => v.type === active);

  return (
    <div>
      <PageHero overline="The Video Library" title="Watch the Story Unfold"
        subtitle="Behind every book and every song is a story. Step behind the scenes, watch the videos, and follow the journey as new ideas come alive." />

      <section className="max-w-7xl mx-auto px-6 pb-8">
        {current && (
          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-white/10 glass" data-testid="featured-video">
              <div className="aspect-video">
                <iframe title={current.title} className="w-full h-full" src={`https://www.youtube.com/embed/${current.youtube_id}`} allowFullScreen />
              </div>
              <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-storm-blue/80">{current.type}</span>
                  <h3 className="font-display text-2xl font-bold text-white mt-1">{current.title}</h3>
                </div>
                <GlowButton href="https://youtube.com" variant="gold" data-testid="videos-subscribe"><Youtube className="w-4 h-4" /> Subscribe on YouTube</GlowButton>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-wrap gap-2.5 mb-8" data-testid="video-filters">
          {TYPES.map((t) => (
            <button key={t} onClick={() => { setActive(t); setVisible(6); }} data-testid={`video-filter-${t.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${active === t ? "bg-storm-blue text-white border-storm-blue shadow-[0_0_16px_rgba(59,130,246,0.5)]" : "border-white/15 text-storm-silver/70 hover:text-white hover:border-white/30"}`}>{t}</button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="videos-grid">
          {filtered.slice(0, visible).map((v) => (
            <button key={v.id} onClick={() => { setCurrent(v); window.scrollTo({ top: 0, behavior: "smooth" }); }} data-testid={`video-thumb-${v.id}`}
              className="group text-left glass rounded-2xl overflow-hidden hover:border-white/25 hover:-translate-y-1 transition-all">
              <div className="relative aspect-video">
                <img src={v.thumbnail} alt={v.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-storm-blue/90 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]"><Play className="w-6 h-6 text-white ml-1" /></span>
                </div>
              </div>
              <div className="p-4">
                <span className="text-[10px] uppercase tracking-widest text-storm-blue/80">{v.type}</span>
                <h4 className="font-medium text-white mt-1 leading-snug">{v.title}</h4>
              </div>
            </button>
          ))}
        </div>
        {visible < filtered.length && (
          <div className="text-center mt-10"><GlowButton onClick={() => setVisible((v) => v + 6)} variant="secondary" data-testid="videos-load-more">Load More</GlowButton></div>
        )}
      </section>

      <NewsletterSection />
    </div>
  );
}
