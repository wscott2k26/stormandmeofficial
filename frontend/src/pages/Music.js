import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, Youtube, Music2, Music4, Apple, ShoppingBag, ArrowRight } from "lucide-react";
import { getMusic } from "../lib/api";
import PageHero from "../components/PageHero";
import { GlowButton, Overline, NewsletterSection, Reveal } from "../components/shared";

function AudioButton({ src, id }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    document.querySelectorAll("audio").forEach((a) => { if (a !== ref.current) a.pause(); });
    if (ref.current.paused) { ref.current.play(); setPlaying(true); } else { ref.current.pause(); setPlaying(false); }
  };
  return (
    <>
      <audio ref={ref} src={src} onEnded={() => setPlaying(false)} preload="none" />
      <button onClick={toggle} data-testid={`audio-preview-${id}`}
        className="w-12 h-12 rounded-full bg-storm-blue text-white flex items-center justify-center shadow-[0_0_18px_rgba(59,130,246,0.5)] hover:scale-105 transition-transform">
        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>
    </>
  );
}

export const StreamLinks = ({ streaming }) => {
  const items = [
    { key: "youtube", label: "YouTube", Icon: Youtube },
    { key: "youtube_music", label: "YT Music", Icon: Youtube },
    { key: "spotify", label: "Spotify", Icon: Music2 },
    { key: "apple", label: "Apple Music", Icon: Apple },
    { key: "amazon_music", label: "Amazon Music", Icon: Music4 },
    { key: "tiktok", label: "TikTok", Icon: Music4 },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ key, label, Icon }) => (
        <a key={key} href={streaming?.[key] || "#"} target="_blank" rel="noreferrer" data-testid={`stream-${key}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full glass text-xs text-storm-silver hover:text-white hover:border-storm-blue/50 transition-colors">
          <Icon className="w-3.5 h-3.5" /> {label}
        </a>
      ))}
    </div>
  );
};

export default function Music() {
  const [music, setMusic] = useState([]);
  useEffect(() => { getMusic().then(setMusic).catch(() => {}); }, []);

  const featuredSingle = music.find((m) => m.type === "single" && m.status === "new") || music.find((m) => m.type === "single");
  const featuredAlbum = music.find((m) => m.type === "album");

  return (
    <div>
      <PageHero overline="Music Born in the Storm" title="Some feelings become a song."
        subtitle="Explore music from Willy Will—stories about love, faith, regret, survival, laughter, heartbreak, mistakes, healing, and getting back up." />

      <section className="max-w-7xl mx-auto px-6 pb-8 grid lg:grid-cols-2 gap-6">
        {[featuredAlbum, featuredSingle].filter(Boolean).map((m) => (
          <Reveal key={m.id}>
            <div className="glass rounded-3xl overflow-hidden flex flex-col sm:flex-row" data-testid={`featured-music-${m.id}`}>
              <img src={m.cover} alt={m.title} className="w-full sm:w-52 h-52 object-cover" />
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[10px] tracking-[0.25em] uppercase text-storm-gold/90">Featured {m.type}</span>
                <h3 className="font-display text-2xl font-bold text-white mt-1">{m.title}</h3>
                <p className="text-storm-silver/60 text-sm mt-1">{new Date(m.release_date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</p>
                <p className="text-storm-silver/70 text-sm mt-3 line-clamp-2 font-light flex-1">{m.description}</p>
                <div className="flex items-center gap-3 mt-4">
                  <AudioButton src={m.audio_preview} id={m.id} />
                  <GlowButton to={`/music/${m.id}`} className="!px-5 !py-2.5">Listen Now <ArrowRight className="w-4 h-4" /></GlowButton>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Catalog */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <Overline className="mb-3">The Catalog</Overline>
        <h2 className="font-display text-3xl font-bold text-white mb-8">Every Song, Every Story</h2>
        <div className="grid md:grid-cols-2 gap-5" data-testid="music-catalog">
          {music.map((m) => (
            <div key={m.id} className="glass rounded-2xl p-5 flex items-center gap-4 hover:border-white/25 transition-colors" data-testid={`music-row-${m.id}`}>
              <img src={m.cover} alt={m.title} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-storm-blue/80">{m.type}</span>
                </div>
                <Link to={`/music/${m.id}`} className="font-display text-lg font-semibold text-white hover:text-storm-blue transition-colors block truncate">{m.title}</Link>
                <div className="mt-3"><StreamLinks streaming={m.streaming} /></div>
              </div>
              <AudioButton src={m.audio_preview} id={`row-${m.id}`} />
            </div>
          ))}
        </div>
      </section>

      {/* YouTube channel */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="wet-glass rounded-3xl border border-white/10 p-10 sm:p-14 text-center">
          <Overline className="mb-4">Official Music Channel</Overline>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Watch. Listen. Feel the Story.</h2>
          <p className="mt-4 text-storm-silver/70 max-w-xl mx-auto font-light">New songs, music videos, lyric videos, behind-the-scenes stories, and studio moments.</p>
          <div className="mt-8 flex justify-center"><GlowButton href="https://youtube.com" variant="gold" data-testid="music-visit-channel"><Youtube className="w-4 h-4" /> Visit the Official Music Channel</GlowButton></div>
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}
