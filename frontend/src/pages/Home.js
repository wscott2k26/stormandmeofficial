import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { BookOpen, Music, Play, ShoppingBag, ArrowRight, Youtube } from "lucide-react";
import { getBooks, getMusic, getVideos, getProducts } from "../lib/api";
import { ASSETS, BRAND } from "../lib/assets";
import { SectionHeading, GlowButton, Overline, NewsletterSection, SocialIcons, Reveal } from "../components/shared";
import { BookCard, ProductCard } from "../components/cards";
import CinematicClouds from "../components/CinematicClouds";
import FeaturedMerchPortal from "../components/FeaturedMerchPortal";

const HERO_MESSAGE_LIBRARY = [
  { lead: "The Storm Doesn't Get the", accent: "Final Word." },
  { lead: "Broken Is Not Your", accent: "Final Chapter." },
  { lead: "Keep Walking. The Sun Is", accent: "Still Coming." },
  { lead: "Pain Can Become", accent: "Purpose." },
  { lead: "You Are Still Here. That Means", accent: "Something." },
  { lead: "A Hard Season Is Not a", accent: "Hopeless Life." },
  { lead: "The Rain May Be Heavy, but You Are", accent: "Still Standing." },
  { lead: "What Hurt You Does Not Get to", accent: "Name You." },
  { lead: "Healing Is Slow, but It Is Still", accent: "Happening." },
  { lead: "Your Comeback Can Start", accent: "Quietly." },
  { lead: "You Have Survived Every Day You Thought You", accent: "Couldn't." },
  { lead: "Even Here, Hope Is Still", accent: "Breathing." },
  { lead: "Some Endings Are Really", accent: "New Roads." },
  { lead: "You Do Not Have to Be Fearless to", accent: "Move Forward." },
  { lead: "The Night Is Long, but Morning Still", accent: "Knows Your Name." },
  { lead: "Rest Is Not Quitting. It Is Part of", accent: "Rebuilding." },
  { lead: "Your Scars Are Proof the Storm Did Not", accent: "Win." },
  { lead: "It Is Okay to Begin Again, Even From", accent: "Here." },
  { lead: "The Weight You Carry Is Not All You", accent: "Are." },
  { lead: "One Small Step Can Still Change the", accent: "Whole Road." },
  { lead: "You Are Allowed to Outgrow What Once", accent: "Broke You." },
  { lead: "The Chapter Is Heavy, but the Story Is", accent: "Not Over." },
  { lead: "Courage Sometimes Looks Like Getting Up", accent: "Again." },
  { lead: "Your Life Can Bloom After the", accent: "Rain." },
  { lead: "You Don't Need All the Answers to Take the", accent: "Next Step." },
  { lead: "The Storm Changed You, but It Did Not", accent: "Finish You." },
  { lead: "There Is Strength in Choosing to Stay", accent: "Soft." },
  { lead: "A Setback Is Not the Same as the", accent: "End." },
  { lead: "You Can Miss What Was and Still Build What", accent: "Comes Next." },
  { lead: "Grace Meets You Right Where You", accent: "Are." },
  { lead: "The Door Closed, but Your Purpose Did", accent: "Not." },
  { lead: "You Are Not Behind. You Are Still", accent: "Becoming." },
  { lead: "Peace Can Find You Before Everything Is", accent: "Fixed." },
  { lead: "The Strongest Thing You May Do Today Is", accent: "Keep Going." },
  { lead: "The Clouds Cannot Cancel the", accent: "Sunrise." },
  { lead: "Your Future Is Bigger Than This", accent: "Moment." },
  { lead: "Some Days, Surviving Is More Than", accent: "Enough." },
  { lead: "You Can Be Tired and Still Be", accent: "Hopeful." },
  { lead: "The Road Bent. Your Story Did", accent: "Not Break." },
  { lead: "There Is Still Something Beautiful Waiting", accent: "Ahead." },
];

function getLocalDayNumber(date = new Date()) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

function getDailyHeroMessages(date = new Date()) {
  const shuffled = [...HERO_MESSAGE_LIBRARY];
  let state = (getLocalDayNumber(date) ^ 0x9e3779b9) >>> 0;

  const nextRandom = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4_294_967_296;
  };

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, 5);
}

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
  const [heroMessages, setHeroMessages] = useState(() => getDailyHeroMessages());
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    getBooks().then(setBooks).catch(() => {});
    getMusic().then(setMusic).catch(() => {});
    getVideos().then(setVideos).catch(() => {});
    getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroMessages.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [heroMessages.length]);

  useEffect(() => {
    let midnightTimer;

    const scheduleDailyRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      midnightTimer = window.setTimeout(() => {
        setHeroMessages(getDailyHeroMessages(new Date()));
        setHeroIndex(0);
        scheduleDailyRefresh();
      }, nextMidnight.getTime() - now.getTime() + 1000);
    };

    scheduleDailyRefresh();
    return () => window.clearTimeout(midnightTimer);
  }, []);

  const featuredAlbum = music.find((m) => m.type === "album") || music[0];
  const featuredVideo = videos.find((v) => v.featured) || videos[0];
  const heroMessage = heroMessages[heroIndex];

  return (
    <div>
      <FeaturedMerchPortal />
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
        <HeroBackdrop />
        <CinematicClouds />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-3xl">
            <Overline className="mb-6">Welcome to {BRAND.domain}</Overline>
            <motion.h1
              key={`${getLocalDayNumber()}-${heroIndex}`}
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

        <div className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 scroll-indicator" aria-hidden="true"><span /></div>
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
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden" data-testid="home-music-record-fallback">
                  <style>{`
                    @keyframes sam-record-spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                    .sam-record-disc {
                      animation: sam-record-spin 5s linear infinite;
                      transform-origin: 50% 50%;
                      will-change: transform;
                    }
                    @media (prefers-reduced-motion: reduce) {
                      .sam-record-disc { animation-duration: 18s; }
                    }
                  `}</style>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.24),transparent_62%)]" />
                  <div className="relative h-52 w-52 sm:h-60 sm:w-60">
                    <div className="absolute inset-1 rounded-full bg-black/80 shadow-[0_30px_90px_rgba(0,0,0,.62)]" />
                    <div className="sam-record-disc relative h-full w-full rounded-full border-4 border-white/10 shadow-2xl">
                      <img
                        src={ASSETS.logo}
                        alt="Storm & Me Official spinning record"
                        className="absolute inset-0 h-full w-full rounded-full object-cover"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 rounded-full opacity-45"
                        style={{ background: "repeating-radial-gradient(circle, transparent 0 8px, rgba(255,255,255,.20) 9px, transparent 10px 15px)" }}
                      />
                      <span className="pointer-events-none absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-storm-gold shadow-[0_0_16px_rgba(215,180,97,.95)]" />
                    </div>
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/40 bg-slate-950 shadow-inner" />
                  </div>
                </div>
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
      <section className="relative py-24 sm:py-32" data-testid="home-about-section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.88fr_1.12fr] gap-10 lg:gap-14 items-center">
            <Reveal>
              <div className="relative max-w-md mx-auto lg:mx-0">
                <div className="absolute -inset-6 rounded-[2rem] bg-storm-blue/12 blur-[70px]" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 p-2 shadow-2xl">
                  <img
                    src={ASSETS.portrait}
                    alt="Will Scott, author and creator of Storm & Me Official"
                    className="aspect-square w-full rounded-[1.65rem] object-cover object-[center_42%]"
                    data-testid="home-author-portrait"
                  />
                </div>
                <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/75 px-5 py-4 text-center backdrop-blur-md">
                  <p className="font-display text-xl font-semibold text-white">Will Scott</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-storm-blue/80">Author · Songwriter · Storyteller</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="pt-8 lg:pt-0 text-center lg:text-left">
                <Overline className="mb-4">The Man Behind Storm &amp; Me</Overline>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.06]">Meet Will Scott</h2>
                <p className="mt-6 text-storm-silver/80 leading-relaxed font-light">
                  Will Scott is an author and storyteller whose work explores healing, resilience, hope, and the courage to keep moving forward. His books range from gentle stories that help children and families navigate difficult emotions to imaginative fiction filled with suspense, survival, and unforgettable characters.
                </p>
                <p className="mt-5 text-storm-silver/75 leading-relaxed font-light">
                  As recording artist <span className="font-semibold text-white">Willy Will</span>, he turns many of those same real-life storms into music—sometimes deep, sometimes funny, always honest. Whether the message arrives through a book, a song, or a story, the mission stays the same: help people feel seen, understood, and a little less alone.
                </p>
                <p className="mt-6 font-display italic text-xl text-storm-gold/85">“The storm did not end me. It introduced me.”</p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                  <GlowButton to="/books" data-testid="home-author-books"><BookOpen className="w-4 h-4" /> Explore the Books</GlowButton>
                  <GlowButton to="/music" variant="secondary" data-testid="home-author-music"><Music className="w-4 h-4" /> Listen to the Music</GlowButton>
                </div>
              </div>
            </Reveal>
          </div>
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
