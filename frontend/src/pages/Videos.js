import React, { useEffect, useState } from "react";
import { Play, Youtube, Video, Clapperboard } from "lucide-react";
import { getVideos } from "../lib/api";
import PageHero from "../components/PageHero";
import { GlowButton, Overline, NewsletterSection, Reveal } from "../components/shared";
import { BRAND } from "../lib/assets";

const TYPES = ["All", "Music Videos", "Book Trailers", "Lyric Videos", "Behind-the-Scenes", "Personal Messages"];

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [active, setActive] = useState("All");
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(6);

  useEffect(() => {
    getVideos()
      .then((items) => {
        setVideos(items);
        setCurrent(items.find((item) => item.featured) || items[0] || null);
      })
      .catch(() => {
        setVideos([]);
        setCurrent(null);
      });
  }, []);

  const filtered = active === "All" ? videos : videos.filter((video) => video.type === active);

  return (
    <div>
      <PageHero
        overline="The Video Library"
        title="Watch the Story Unfold"
        subtitle="Book trailers, music videos, lyric videos, creator stories, and behind-the-scenes moments will live here once their official uploads are verified."
      />

      {!videos.length ? (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <Reveal>
            <div className="wet-glass relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12 text-center">
              <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-storm-blue/20 blur-[90px]" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Clapperboard className="h-8 w-8 text-storm-blue" />
                </div>
                <Overline className="mt-7 mb-4">The cameras are warming up</Overline>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">No Stock Videos. No Fake Trailers.</h2>
                <p className="mx-auto mt-5 max-w-2xl text-storm-silver/70 leading-relaxed font-light">
                  The library has been cleared of demonstration videos. Official Willy Will uploads, real book trailers, personal messages, and behind-the-scenes stories will appear here as their verified YouTube links are connected.
                </p>
                {BRAND.youtube ? (
                  <div className="mt-8 flex justify-center"><GlowButton href={BRAND.youtube} variant="gold"><Youtube className="h-4 w-4" /> Visit the Official Channel</GlowButton></div>
                ) : (
                  <p className="mt-7 text-sm text-storm-gold/75">Official channel verification in progress.</p>
                )}
              </div>
            </div>
          </Reveal>
        </section>
      ) : (
        <>
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
                    {BRAND.youtube && <GlowButton href={BRAND.youtube} variant="gold" data-testid="videos-subscribe"><Youtube className="w-4 h-4" /> Subscribe on YouTube</GlowButton>}
                  </div>
                </div>
              </Reveal>
            )}
          </section>

          <section className="max-w-7xl mx-auto px-6 pb-24">
            <div className="flex flex-wrap gap-2.5 mb-8" data-testid="video-filters">
              {TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => { setActive(type); setVisible(6); }}
                  data-testid={`video-filter-${type.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${active === type ? "bg-storm-blue text-white border-storm-blue shadow-[0_0_16px_rgba(59,130,246,0.5)]" : "border-white/15 text-storm-silver/70 hover:text-white hover:border-white/30"}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="videos-grid">
              {filtered.slice(0, visible).map((video) => (
                <button
                  key={video.id}
                  onClick={() => { setCurrent(video); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  data-testid={`video-thumb-${video.id}`}
                  className="group text-left glass rounded-2xl overflow-hidden hover:border-white/25 hover:-translate-y-1 transition-all"
                >
                  <div className="relative aspect-video">
                    <img src={video.thumbnail} alt={video.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="w-14 h-14 rounded-full bg-storm-blue/90 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]"><Play className="w-6 h-6 text-white ml-1" /></span>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] uppercase tracking-widest text-storm-blue/80">{video.type}</span>
                    <h4 className="font-medium text-white mt-1 leading-snug">{video.title}</h4>
                  </div>
                </button>
              ))}
            </div>
            {visible < filtered.length && (
              <div className="text-center mt-10"><GlowButton onClick={() => setVisible((count) => count + 6)} variant="secondary" data-testid="videos-load-more">Load More</GlowButton></div>
            )}
          </section>
        </>
      )}

      <NewsletterSection />
    </div>
  );
}
