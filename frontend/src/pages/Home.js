import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { BookOpen, Music, Play, ShoppingBag, ArrowRight, Youtube, Users } from "lucide-react";
import { getBooks, getMusic, getVideos, getProducts } from "../lib/api";
import { ASSETS, BRAND } from "../lib/assets";
import { SectionHeading, GlowButton, Overline, NewsletterSection, SocialIcons, Reveal } from "../components/shared";
import { BookCard, ProductCard } from "../components/cards";

const HERO_MESSAGES = [
  { lead: "The Storm Doesn't Get the", accent: "Final Word." },
  { lead: "Broken Is Not Your", accent: "Final Chapter." },
  { lead: "Keep Walking. The Sun Is", accent: "Still Coming." },
  { lead: "Pain Can Become", accent: "Purpose." },
  { lead: "You Are Still Here. That Means", accent: "Something." },
];

// Hero backdrop is portaled OUT of the sealed .app-shell layer into .grain,
// so the fixed rain canvas paints above it while the hero content stays readable.
function HeroBackdrop() {
  const [container, setContainer] = useState(null);
  useEffect(() => {
    setContainer(document.querySelector(".grain") || document.body);
  }, []);
  if (!container) return null;
  return createPortal(
    <div className="pointer-events-none absolute top-0 left-0 w-full h-screen" style={{ zIndex: 0 }} aria-hidden="true" data-testid="hero-backdrop">
      <img src={ASSETS.hero} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-storm-base via-storm-base/80 to-storm-base/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-storm-base via-transparent to-storm-base/40" />
    </div>,
    container
  );
}

export default function Home() {
  const [books, setBooks] = useState([]);
  const [music, setMusic] = useState([]);
  const [videos, setVideos] = useState([]);
  const [products, setProducts] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    getBooks().then(setBooks).catch(() => {});
    getMusic().then(setMusic).catch(() => {});
    getVideos().then(setVideos).catch(() => {});
    getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_MESSAGES.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const featuredAlbum = music.find((m) => m.type === "album") || music[0];
  const featuredVideo = videos.find((v) => v.featured) || videos[0];
  const heroMessage = HERO_MESSAGES[heroIndex];

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
        <HeroBackdrop />

        <div className="relative max-w-7xl mx-auto px-6 w-full pt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-3xl">
            <Overline className="mb-6">Welcome to {BRAND.domain}</Overline>
            <motion.h1
              key={heroIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.02] tracking-tight min-h-[2.05em]"
              aria-live="polite"
            >
              {heroMessage.lead}{" "}
              <span className="text-glow-blue text-storm-blue italic">{heroMessage.accent}</span>
            </motion.h1>
            <p className="mt-7 text-storm-silver/80 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
              StormAndMeOfficial is a home for books, music, stories, and meaningful creations made for people walking through real-life storms—and still searching for hope, healing, laughter, faith, and a way forward.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <GlowButton to="/books" data-testid="hero-explore-books"><BookOpen className="w-4 h-4" /> Explore the Books</GlowButton>
              <GlowButton to="/music" variant="secondary" data-testid="hero-hear-music"><Music className="w-4 h-4" /> Hear the Music</GlowButton>
              <GlowButton to="/shop" variant="secondary" data-testid="hero-shop-collection"><ShoppingBag className="w-4 h-4" /> Shop the Collection</GlowButton>
            </div>
            <p className="mt-10 text-sm sm:text-base text-storm-silver/70 max-w-xl font-light">
              Whatever storm brought you here, you do not have to walk through it alone.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator" aria-hidden="true"><span /></div>
      </section>

      {/* WELCOME */}
      <section className="relative py-24 sm:py-32" data-testid="welcome-section">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <Overline className="mb-4">Created for people, not applause</Overline>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.05]">A Place for People Still Standing</h2>
            <p className="mt-6 text-storm-silver/75 leading-relaxed font-light">
              StormAndMeOfficial was created for people facing real life—heartbreak, loss, setbacks, uncertainty, new beginnings, and the quiet battles nobody else can see. Through books, music, videos, and meaningful merchandise, this community exists to remind people that pain can become purpose and storms do not last forever.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GlowButton to="/books" data-testid="welcome-explore"><ArrowRight className="w-4 h-4" /> Find What Speaks to You</GlowButton>
              <GlowButton to="/about" variant="secondary" data-testid="welcome-about">About the Mission</GlowButton>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative space-y-4">
              <div className="absolute -inset-6 bg-storm-blue/10 blur-3xl rounded-full" />
              {[
                "You are more than what happened to you.",
                "Some storms change the road. They do not have to end the journey.",
                "Created for the hurting, the healing, the rebuilding, and the still-standing.",
              ].map((message, index) => (
                <div key={message} data-testid={`welcome-message-${index}`} className="relative wet-glass rounded-2xl border border-white/10 p-6 sm:p-7">
                  <p className="font-display text-xl sm:text-2xl text-white leading-snug">{message}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ENCOURAGEMENT BAND */}
      <section className="relative py-6" data-testid="home-encouragement-band">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="font-display italic text-2xl sm:text-3xl text-storm-gold/90 leading-snug">
            “Books, music, and messages for people finding their way through the rain.”
          </p>
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section className="relative py-16 sm:py-20" data-testid="home-books-section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal><SectionHeading overline="The Bookstore" title="Books That Walk With You"
            subtitle="Every title is created to comfort, encourage, and remind you that healing is still possible—books for the hurting, the healing, the rebuilding, and the still-standing. Find the one that meets you where you are." /></Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12">
            {books.slice(0, 8).map((book, index) => (
              <Reveal key={book.id} delay={(index % 4) * 0.05}><BookCard book={book} /></Reveal>
            ))}
          </div>
          <div className="text-center mt-12"><GlowButton to="/books" data-testid="home-shop-all-books">Shop All Books <ArrowRight className="w-4 h-4" /></GlowButton></div>
        </div>
      </section>

      {/* MUSIC */}
      {featuredAlbum && (
        <section className="relative py-24 sm:py-28" data-testid="home-music-section">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
            <Reveal>
              <div className="relative">
                <div className="absolute -inset-6 bg-storm-blue/15 blur-[80px] rounded-full" />
                <img src={featuredAlbum.cover} alt={featuredAlbum.title} className="relative rounded-2xl w-full max-w-md mx-auto border border-white/10 shadow-2xl" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <Overline className="mb-4">Music for the Journey</Overline>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">{featuredAlbum.title}</h2>
              <p className="mt-5 text-storm-silver/75 leading-relaxed font-light">
                Songs for the drive home, the sleepless nights, and the mornings you choose to keep going. Music made to help you feel understood, encouraged, and a little less alone—through the heartbreak, the healing, and the getting back up.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <GlowButton to={`/music/${featuredAlbum.id}`} data-testid="home-listen-now"><Play className="w-4 h-4" /> Listen Now</GlowButton>
                <GlowButton to="/music" variant="secondary" data-testid="home-explore-music">Explore the Catalog</GlowButton>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* YOUTUBE CHANNEL */}
      <section className="relative py-20" data-testid="home-youtube-section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="wet-glass rounded-3xl border border-white/10 overflow-hidden grid lg:grid-cols-2">
            <div className="p-10 sm:p-14 flex flex-col justify-center">
              <Overline className="mb-4">Official Music Channel</Overline>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">Watch. Listen. Feel the Story.</h2>
              <p className="mt-5 text-storm-silver/75 font-light leading-relaxed">
                Subscribe for new songs, music videos, lyric videos, behind-the-scenes stories, studio moments, and creative releases.
              </p>
              <div className="mt-8">
                {BRAND.youtube ? (
                  <GlowButton href={BRAND.youtube} variant="gold" data-testid="home-visit-channel"><Youtube className="w-4 h-4" /> Visit the Official Music Channel</GlowButton>
                ) : (
                  <p className="text-sm text-storm-gold/80">Official channel link coming next—no fake destination, no dead button.</p>
                )}
              </div>
            </div>
            <div className="relative min-h-[280px] bg-black/40">
              {featuredVideo ? (
                <iframe title={featuredVideo.title} className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${featuredVideo.youtube_id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-storm-silver/50 text-sm px-8 text-center">Official videos will appear here as they are connected.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MERCH */}
      <section className="relative py-16 sm:py-20" data-testid="home-merch-section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal><SectionHeading overline="The Storm Collection" title="Wearable Reminders"
            subtitle="Wearable reminders of strength, healing, faith, perseverance, and survival. Every piece is a quiet encouragement—for you, and for the next person who needs to see that the storm does not get the final word." /></Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12">
            {products.slice(0, 4).map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 0.05}><ProductCard product={product} /></Reveal>
            ))}
          </div>
          <div className="text-center mt-12"><GlowButton to="/shop" data-testid="home-shop-storm">Shop the Storm Collection <ArrowRight className="w-4 h-4" /></GlowButton></div>
        </div>
      </section>

      {/* CREATOR */}
      <section className="relative py-20 sm:py-24" data-testid="home-about-section">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <div className="wet-glass rounded-3xl border border-white/10 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
              <img src={ASSETS.portrait} alt="Willy Will" className="w-28 h-28 rounded-2xl object-cover border border-white/10 shrink-0" />
              <div>
                <Overline className="mb-3">Behind the Mission</Overline>
                <p className="text-storm-silver/80 leading-relaxed font-light">
                  Created by author, songwriter, and storyteller Willy Will—turning real-life storms into books, music, and messages built to help others feel seen, understood, and encouraged to keep going.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                  <GlowButton to="/about" data-testid="home-meet-willy"><Users className="w-4 h-4" /> Meet Willy Will</GlowButton>
                  <GlowButton to="/story" variant="secondary" data-testid="home-read-story">The Story Behind the Storm</GlowButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <NewsletterSection />

      {/* SOCIAL */}
      <section className="relative py-20 text-center" data-testid="home-social-section">
        <Overline className="mb-5">Follow the Journey</Overline>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-8">Walk With Us</h2>
        <div className="flex justify-center"><SocialIcons /></div>
        <p className="mt-10 font-display italic text-lg text-storm-gold/80 max-w-xl mx-auto px-6">“Whatever storm brought you here, you do not have to walk through it alone.”</p>
      </section>
    </div>
  );
}
