import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Pause, ArrowLeft, ShoppingBag, Share2 } from "lucide-react";
import { toast } from "sonner";
import { getMusicItem, getMusic } from "../lib/api";
import { GlowButton, Overline, NewsletterSection } from "../components/shared";
import { StreamLinks } from "./Music";

export default function MusicDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [all, setAll] = useState([]);
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    getMusicItem(id).then(setItem).catch(() => setItem(false));
    getMusic().then(setAll).catch(() => {});
  }, [id]);

  if (item === false) return <div className="pt-40 pb-40 text-center text-storm-silver/60">Not found. <Link to="/music" className="text-storm-blue">Back to music</Link></div>;
  if (!item) return <div className="pt-40 pb-40 text-center text-storm-silver/50">Loading...</div>;

  const toggle = () => { if (ref.current.paused) { ref.current.play(); setPlaying(true); } else { ref.current.pause(); setPlaying(false); } };
  const related = all.filter((m) => m.id !== item.id).slice(0, 3);

  return (
    <div>
      <div className="pt-28 max-w-7xl mx-auto px-6">
        <Link to="/music" className="inline-flex items-center gap-2 text-sm text-storm-silver/60 hover:text-white mb-8" data-testid="back-to-music"><ArrowLeft className="w-4 h-4" /> All Music</Link>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="relative">
            <div className="absolute -inset-6 bg-storm-blue/15 blur-[80px] rounded-full" />
            <img src={item.cover} alt={item.title} className="relative rounded-2xl w-full max-w-md mx-auto border border-white/10 shadow-2xl" />
          </div>
          <div>
            <span className="text-xs tracking-[0.25em] uppercase text-storm-gold/90">{item.type}</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mt-2" data-testid="music-detail-title">{item.title}</h1>
            <p className="mt-2 text-storm-silver/60">{item.artist} · {new Date(item.release_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p className="mt-5 text-storm-silver/80 leading-relaxed font-light">{item.description}</p>

            <audio ref={ref} src={item.audio_preview} onEnded={() => setPlaying(false)} preload="none" />
            <div className="mt-6 flex items-center gap-3">
              <button onClick={toggle} data-testid="music-detail-play"
                className="inline-flex items-center gap-2 rounded-full bg-storm-blue text-white px-6 py-3 font-semibold shadow-[0_0_18px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />} Preview
              </button>
              <GlowButton href="#" variant="gold" data-testid="music-buy"><ShoppingBag className="w-4 h-4" /> Buy {item.type === "album" ? "Album" : "Song"}</GlowButton>
            </div>

            <div className="mt-8">
              <p className="text-xs tracking-widest uppercase text-storm-silver/50 mb-3">Stream & Purchase</p>
              <StreamLinks streaming={item.streaming} />
            </div>
          </div>
        </div>

        {/* Story + video */}
        <div className="grid lg:grid-cols-3 gap-10 mt-20">
          <div className="lg:col-span-2">
            {item.story && (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-4">Behind the Song</h2>
                <p className="text-storm-silver/75 leading-relaxed font-light">{item.story}</p>
              </>
            )}
            {item.lyrics && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-bold text-white mb-4">Lyrics</h2>
                <pre className="text-storm-silver/70 font-body font-light whitespace-pre-wrap leading-relaxed glass rounded-2xl p-6">{item.lyrics}</pre>
              </div>
            )}
          </div>
          {item.video_url && (
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-4">Music Video</h2>
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
                <iframe title="Music video" className="w-full h-full" src={item.video_url} allowFullScreen />
              </div>
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <Overline className="mb-3">Keep Listening</Overline>
            <h2 className="font-display text-2xl font-bold text-white mb-6">Related Releases</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((m) => (
                <Link key={m.id} to={`/music/${m.id}`} className="glass rounded-2xl overflow-hidden hover:border-white/25 transition-colors" data-testid={`related-music-${m.id}`}>
                  <img src={m.cover} alt={m.title} className="w-full aspect-square object-cover" />
                  <div className="p-4"><p className="font-display font-semibold text-white">{m.title}</p><p className="text-xs text-storm-silver/50 uppercase tracking-widest mt-1">{m.type}</p></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-20"><NewsletterSection /></div>
    </div>
  );
}
