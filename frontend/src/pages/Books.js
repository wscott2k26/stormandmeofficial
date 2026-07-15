import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookHeart, BriefcaseBusiness, Rocket, Sparkles } from "lucide-react";
import { getBooks } from "../lib/api";
import PageHero from "../components/PageHero";
import { BookCard } from "../components/cards";
import { GlowButton, NewsletterSection, Overline, Reveal } from "../components/shared";

const SHELVES = [
  {
    id: "healing",
    overline: "Walk Through the Storm",
    title: "Healing, Faith & Personal Growth",
    subtitle: "Honest books for the hurting, the rebuilding, and the still-standing.",
    Icon: BookHeart,
    test: (book) =>
      book.status !== "coming_soon" &&
      !book.categories?.includes("Children's Books") &&
      !book.categories?.includes("Science Fiction") &&
      !book.categories?.includes("Career & Life"),
  },
  {
    id: "young-hearts",
    overline: "For Young Hearts",
    title: "Children's Stories That Make Room for Feelings",
    subtitle: "Gentle stories that never pretend the hurt was not real.",
    Icon: Sparkles,
    test: (book) => book.status !== "coming_soon" && book.categories?.includes("Children's Books"),
  },
  {
    id: "career-life",
    overline: "Begin Again",
    title: "Career & Life",
    subtitle: "Grounded help for the day the plan changes and a new road has to begin.",
    Icon: BriefcaseBusiness,
    test: (book) => book.status !== "coming_soon" && book.categories?.includes("Career & Life"),
  },
  {
    id: "fiction",
    overline: "Beyond the Storm",
    title: "Science Fiction & Adventure",
    subtitle: "Survival, mystery, impossible questions, and worlds bigger than they first appear.",
    Icon: Rocket,
    test: (book) => book.status !== "coming_soon" && book.categories?.includes("Science Fiction"),
  },
  {
    id: "coming-soon",
    overline: "The Next Chapter",
    title: "Coming Soon",
    subtitle: "Stories still being shaped with care—not rushed just to fill a shelf.",
    Icon: Sparkles,
    test: (book) => book.status === "coming_soon",
  },
];

function Shelf({ shelf, books }) {
  if (!books.length) return null;
  const Icon = shelf.Icon;
  return (
    <section id={shelf.id} className="relative py-14 sm:py-18 scroll-mt-28" data-testid={`book-shelf-${shelf.id}`}>
      <Reveal>
        <div className="flex items-start gap-4 mb-8">
          <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Icon className="h-5 w-5 text-storm-blue" />
          </div>
          <div>
            <Overline className="mb-2">{shelf.overline}</Overline>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">{shelf.title}</h2>
            <p className="mt-3 max-w-2xl text-storm-silver/70 font-light leading-relaxed">{shelf.subtitle}</p>
          </div>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {books.map((book, index) => (
          <Reveal key={book.id} delay={(index % 4) * 0.05}>
            <BookCard book={book} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getBooks().then(setBooks).catch(() => {});
  }, []);

  const featured = books.find((book) => book.id === "the-storm-in-me") || books.find((book) => book.status === "featured");
  const shelfBooks = useMemo(
    () => SHELVES.map((shelf) => ({ ...shelf, books: books.filter(shelf.test) })),
    [books]
  );

  return (
    <div>
      <PageHero
        overline="The Bookstore"
        title="Books That Walk With You"
        subtitle="Browse by the kind of road you are walking—healing, young hearts, career and life, science fiction, or what is coming next."
      />

      <section className="max-w-7xl mx-auto px-6 pb-6">
        <nav className="flex flex-wrap gap-2" aria-label="Bookstore shelves">
          {SHELVES.map((shelf) => (
            <a
              key={shelf.id}
              href={`#${shelf.id}`}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-storm-silver/75 transition hover:border-storm-blue/60 hover:text-white"
            >
              {shelf.title}
            </a>
          ))}
        </nav>
      </section>

      {featured && (
        <section className="max-w-7xl mx-auto px-6 py-10" data-testid="featured-book-banner">
          <Reveal>
            <div className="wet-glass relative overflow-hidden rounded-3xl border border-white/10 p-7 sm:p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-storm-blue/15 blur-3xl" />
              <div className="relative grid items-center gap-8 md:grid-cols-[220px_1fr]">
                <img src={featured.cover} alt={featured.title} className="mx-auto w-full max-w-[220px] rounded-2xl border border-white/10 shadow-2xl" />
                <div>
                  <Overline className="mb-3">The Heart of the Mission</Overline>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">{featured.title}</h2>
                  {featured.subtitle && <p className="mt-1 text-lg italic text-storm-blue">{featured.subtitle}</p>}
                  <p className="mt-5 max-w-2xl text-storm-silver/80 leading-relaxed font-light">{featured.summary}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <GlowButton to={`/books/${featured.id}`}>Enter the Story <ArrowRight className="h-4 w-4" /></GlowButton>
                    {featured.amazon_link && <GlowButton href={featured.amazon_link} variant="gold">Buy on Amazon</GlowButton>}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {shelfBooks.map((shelf) => <Shelf key={shelf.id} shelf={shelf} books={shelf.books} />)}

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="font-display text-2xl text-white">Not sure where to begin?</p>
          <p className="mx-auto mt-3 max-w-xl text-storm-silver/70">Start with the story that sounds most like the season you are in. There is no wrong shelf when you are looking for a way forward.</p>
          <Link to="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-storm-blue hover:text-white">Ask for a recommendation <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>

      <NewsletterSection />
    </div>
  );
}
