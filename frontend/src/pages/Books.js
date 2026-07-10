import React, { useEffect, useState } from "react";
import { getBooks } from "../lib/api";
import PageHero from "../components/PageHero";
import { BookCard } from "../components/cards";
import { NewsletterSection, Reveal } from "../components/shared";

const CATEGORIES = ["All", "Children's Books", "Emotional Healing", "Inspirational", "Personal Growth", "Career and Life", "Faith and Perseverance", "Fiction", "New Releases", "Coming Soon"];

export default function Books() {
  const [books, setBooks] = useState([]);
  const [active, setActive] = useState("All");

  useEffect(() => { getBooks().then(setBooks).catch(() => {}); }, []);

  const filtered = active === "All"
    ? books
    : active === "New Releases"
    ? books.filter((b) => b.status === "new")
    : active === "Coming Soon"
    ? books.filter((b) => b.status === "coming_soon")
    : books.filter((b) => (b.categories || []).includes(active));

  return (
    <div>
      <PageHero overline="The Bookstore" title="Stories Born in the Storm"
        subtitle="Explore stories created to comfort, challenge, inspire, and remind readers that healing is still possible." />
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-wrap gap-2.5 mb-10" data-testid="book-category-filters">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setActive(c)} data-testid={`book-filter-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${active === c ? "bg-storm-blue text-white border-storm-blue shadow-[0_0_16px_rgba(59,130,246,0.5)]" : "border-white/15 text-storm-silver/70 hover:text-white hover:border-white/30"}`}>
              {c}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="text-storm-silver/50 py-20 text-center">No books in this category yet. New stories are on the way.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" data-testid="books-grid">
            {filtered.map((b, i) => (<Reveal key={b.id} delay={(i % 4) * 0.05}><BookCard book={b} /></Reveal>))}
          </div>
        )}
      </section>
      <NewsletterSection />
    </div>
  );
}
