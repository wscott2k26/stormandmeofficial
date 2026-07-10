import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Music, Play, ShoppingBag, ArrowRight, Youtube, Users } from "lucide-react";
import { getBooks, getMusic, getVideos, getProducts } from "../lib/api";
import { ASSETS, BRAND } from "../lib/assets";
import { SectionHeading, GlowButton, Overline, NewsletterSection, SocialIcons, Reveal } from "../components/shared";
import { BookCard, ProductCard } from "../components/cards";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [music, setMusic] = useState([]);
  const [videos, setVideos] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getBooks().then(setBooks).catch(() => {});
    getMusic().then(setMusic).catch(() => {});
    getVideos().then(setVideos).catch(() => {});
    getProducts().then(setProducts).catch(() => {});
  }, []);

  const featuredAlbum = music.find((m) => m.type === "album") || music[0];
  const featuredVideo = videos.find((v) => v.featured) || videos[0];

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={ASSETS.hero} alt="A lone figure walking a wet street toward light breaking through storm clouds" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-storm-base via-storm-base/85 to-storm-base/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-storm-base via-transparent to-storm-base/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full pt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-3xl">
            <Overline className="mb-6">Welcome to {BRAND.domain}</Overline>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.02] tracking-tight">
              Some people run from the storm.{" "}
              <span className="text-glow-blue text-storm-blue italic">I learned how to create inside it.</span>
            </h1>
            <p className="mt-7 text-storm-silver/80 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
              The official home of {BRAND.creator}, where real-life struggles become books, music, stories, videos, and reminders that the storm does not get the final word.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <GlowButton to="/books" data-testid="hero-explore-books"><BookOpen className="w-4 h-4" /> Explore the Books</GlowButton>
              <GlowButton to="/music" variant="secondary" data-testid="hero-hear-music"><Music className="w-4 h-4" /> Hear the Music</GlowButton>
              <GlowButton to="/shop" variant="secondary" data-testid="hero-shop-collection"><ShoppingBag className="w-4 h-4" /> Shop the Collection</GlowButton>
            </div>
            <p className="mt-10 text-xs tracking-[0.4em] uppercase text-storm-silver/50">Books. Music. Stories. Survival.</p>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator" aria-hidden="true"><span /></div>
      </section>

      {/* WELCOME */}
      <section className="relative py-24 sm:py-32" data-testid="welcome-section">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <Overline className="mb-4">Welcome to StormAndMeOfficial</Overline>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.05]">More than a website. A creative home.</h2>
            <p className="mt-6 text-storm-silver/75 leading-relaxed font-light">
              StormAndMeOfficial is the story of what can happen when life gets heavy, the sky turns dark, and a person decides to keep building anyway.
            </p>
            <p className="mt-4 text-storm-silver/75 leading-relaxed font-light">
              Through books, music, videos, and wearable messages, {BRAND.creator} turns real emotions into art for people who are still standing—even when they are standing in the rain.
            </p>
            <div className="mt-8"><GlowButton to="/story" data-testid="welcome-discover-story">Discover the Story <ArrowRight className="w-4 h-4" /></GlowButton></div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-4 bg-storm-blue/10 blur-3xl rounded-full" />
              <div className="relative rounded-3xl overflow-hidden border border-white/10 glass">
                <img src={ASSETS.portrait} alt={`Portrait of ${BRAND.creator}`} className="w-full h-[520px] object-cover" />
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="font-display text-2xl text-white">{BRAND.creator}</p>
                  <p className="text-storm-blue/90 text-sm tracking-wide">Author · Songwriter · Storyteller</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section className="relative py-16 sm:py-20" data-testid="home-books-section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal><SectionHeading overline="The Bookstore" title="Stories Born in the Storm"
            subtitle="Every book begins with a feeling, a memory, a lesson, or a moment that refused to be forgotten. Explore stories created to comfort, challenge, inspire, and remind readers that healing is still possible." /></Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12">
            {books.slice(0, 8).map((b, i) => (
              <Reveal key={b.id} delay={(i % 4) * 0.05}><BookCard book={b} /></Reveal>
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
              <Overline className="mb-4">Music Born in the Storm</Overline>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">{featuredAlbum.title}</h2>
              <p className="mt-5 text-storm-silver/75 leading-relaxed font-light">
                Some feelings cannot be explained in a conversation. Sometimes they have to become a song—stories about love, faith, regret, survival, heartbreak, and getting back up.
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
              <div className="mt-8"><GlowButton href="https://youtube.com" variant="gold" data-testid="home-visit-channel"><Youtube className="w-4 h-4" /> Visit the Official Music Channel</GlowButton></div>
            </div>
            <div className="relative min-h-[280px] bg-black/40">
              {featuredVideo && (
                <iframe title={featuredVideo.title} className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${featuredVideo.youtube_id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MERCH */}
      <section className="relative py-16 sm:py-20" data-testid="home-merch-section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal><SectionHeading overline="The Storm Collection" title="Wear the Reminder"
            subtitle="Wearable messages for people who are still standing. Every piece is a quiet declaration: the storm does not get the final word." /></Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12">
            {products.slice(0, 4).map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.05}><ProductCard product={p} /></Reveal>
            ))}
          </div>
          <div className="text-center mt-12"><GlowButton to="/shop" data-testid="home-shop-storm">Shop the Storm Collection <ArrowRight className="w-4 h-4" /></GlowButton></div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="relative py-24 sm:py-28" data-testid="home-about-section">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Reveal>
            <Overline className="mb-5">Meet the Creator</Overline>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.05]">The Storm Was Real. So Was the Comeback.</h2>
            <p className="mt-6 text-storm-silver/75 max-w-2xl mx-auto leading-relaxed font-light">
              {BRAND.creator} is an author, songwriter, storyteller, content creator, and technology professional who creates for people navigating real life—people who have questioned themselves, lost something, started over, or wondered if their best days were behind them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <GlowButton to="/about" data-testid="home-meet-willy"><Users className="w-4 h-4" /> Meet Willy Will</GlowButton>
              <GlowButton to="/story" variant="secondary" data-testid="home-enter-storm">Enter the Storm</GlowButton>
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
        <p className="mt-10 font-display italic text-lg text-storm-gold/80 max-w-xl mx-auto px-6">"{BRAND.message}"</p>
      </section>
    </div>
  );
}
