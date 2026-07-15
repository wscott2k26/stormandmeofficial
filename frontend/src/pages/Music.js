import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, Youtube, Music2, Music4, Apple, ArrowRight, Headphones, Sparkles } from "lucide-react";
import { getMusic } from "../lib/api";
import PageHero from "../components/PageHero";
import { GlowButton, Overline, NewsletterSection, Reveal } from "../components/shared";
import { BRAND } from "../lib/assets";

function AudioButton({ src, id }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  if (!src) return null;

  const toggle = async () => {
    document.querySelectorAll("audio").forEach((audio) => {
      if (audio !== ref.current) audio.pause();
    });

    if (ref.current.paused) {
      try {
        await ref.current.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      ref.current.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={ref} src={src} onEnded={() => setPlaying(false)} preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause preview" : "Play preview"}
        data-testid={`audio-preview-${id}`}
        className="w-12 h-12 rounded-full bg-storm-blue text-white flex items-center justify-center shadow-[0_0_18px_rgba(59,130,246,0.5)] hover:scale-105 transition-transform"
      >
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
  ].filter(({ key }) => streaming?.[key] && streaming[key] !== "#");

  if (!items.length) return <span className="text-xs text-storm-silver/45">Official streaming links being connected.</span>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={streaming[key]}
          target="_blank"
          rel="noreferrer"
          data-testid={`stream-${key}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full glass text-xs text-storm-silver hover:text-white hover:border-storm-blue/50 transition-colors"
        >
          <Icon className="w-3.5 h-3.5" /> {label}
        </a>
      ))}
    </div>
  );
};

export default function Music() {
  const [music, setMusic] = useState([]);

  useEffect(() => {
    getMusic().then(setMusic).catch(() => setMusic([]));
  }, []);

  const featuredSingle = music.find((item) => item.type === "single" && item.status === "new") || music.find((item) => item.type === "single");
  const featuredAlbum = music.find((item) => item.type === "album");

  return (
    <div>
      <PageHero
        overline="Music for the Journey"
        title="Songs for the Way Through"
        subtitle="Music to help you feel understood, encouraged, and less alone—for the heartbreak, the healing, the laughter, and the mornings you choose to keep going."
      />

      {!music.length ? (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <Reveal>
            <div className="wet-glass relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12 text-center">
              <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-storm-blue/20 blur-[90px]" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Headphones className="h-8 w-8 text-storm-blue" />
                </div>
                <Overline className="mt-7 mb-4">The official catalog is next</Overline>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">No Placeholder Music. Only the Real Records.</h2>
                <p className="mx-auto mt-5 max-w-2xl text-storm-silver/70 leading-relaxed font-light">
                  The Willy Will catalog is being connected with verified cover art, release information, stories behind the songs, and official streaming destinations. Random preview music has been removed.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <GlowButton to="/contact"><Sparkles className="h-4 w-4" /> Ask About the Music</GlowButton>
                  {BRAND.youtube && <GlowButton href={BRAND.youtube} variant="gold"><Youtube className="h-4 w-4" /> Official Channel</GlowButton>}
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      ) : (
        <>
          <section className="max-w-7xl mx-auto px-6 pb-8 grid lg:grid-cols-2 gap-6">
            {[featuredAlbum, featuredSingle].filter(Boolean).map((item) => (
              <Reveal key={item.id}>
                <div className="glass rounded-3xl overflow-hidden flex flex-col sm:flex-row" data-testid={`featured-music-${item.id}`}>
                  <img src={item.cover} alt={item.title} className="w-full sm:w-52 h-52 object-cover" />
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-storm-gold/90">Featured {item.type}</span>
                    <h3 className="font-display text-2xl font-bold text-white mt-1">{item.title}</h3>
                    {item.release_date && <p className="text-storm-silver/60 text-sm mt-1">{new Date(item.release_date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</p>}
                    <p className="text-storm-silver/70 text-sm mt-3 line-clamp-2 font-light flex-1">{item.description}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <AudioButton src={item.audio_preview} id={item.id} />
                      <GlowButton to={`/music/${item.id}`} className="!px-5 !py-2.5">Explore <ArrowRight className="w-4 h-4" /></GlowButton>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </section>

          <section className="max-w-7xl mx-auto px-6 py-12">
            <Overline className="mb-3">The Catalog</Overline>
            <h2 className="font-display text-3xl font-bold text-white mb-8">Every Song, Every Story</h2>
            <div className="grid md:grid-cols-2 gap-5" data-testid="music-catalog">
              {music.map((item) => (
                <div key={item.id} className="glass rounded-2xl p-5 flex items-center gap-4 hover:border-white/25 transition-colors" data-testid={`music-row-${item.id}`}>
                  <img src={item.cover} alt={item.title} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-storm-blue/80">{item.type}</span>
                    <Link to={`/music/${item.id}`} className="font-display text-lg font-semibold text-white hover:text-storm-blue transition-colors block truncate">{item.title}</Link>
                    <div className="mt-3"><StreamLinks streaming={item.streaming} /></div>
                  </div>
                  <AudioButton src={item.audio_preview} id={`row-${item.id}`} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="wet-glass rounded-3xl border border-white/10 p-10 sm:p-14 text-center">
          <Overline className="mb-4">Official Music Channel</Overline>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Watch. Listen. Feel the Story.</h2>
          <p className="mt-4 text-storm-silver/70 max-w-xl mx-auto font-light">The verified Willy Will channel will be linked here with music videos, lyric videos, and behind-the-scenes stories.</p>
          {BRAND.youtube ? (
            <div className="mt-8 flex justify-center"><GlowButton href={BRAND.youtube} variant="gold" data-testid="music-visit-channel"><Youtube className="w-4 h-4" /> Visit the Official Music Channel</GlowButton></div>
          ) : (
            <p className="mt-6 text-sm text-storm-gold/75">Channel verification in progress.</p>
          )}
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}
