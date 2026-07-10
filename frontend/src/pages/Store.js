import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../lib/api";
import PageHero from "../components/PageHero";
import { ProductCard } from "../components/cards";
import { NewsletterSection, Reveal } from "../components/shared";

const CATS = ["All", "Clothing", "Books", "Music", "Home and Office", "Accessories", "Limited Edition", "Bundles", "New Arrivals"];

export default function Store() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [params] = useSearchParams();
  const q = (params.get("q") || "").toLowerCase();

  useEffect(() => { getProducts().then(setProducts).catch(() => {}); }, []);

  let filtered = active === "All" ? products : products.filter((p) => (p.categories || []).includes(active));
  if (q) filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));

  return (
    <div>
      <PageHero overline="The Storm Collection" title="Shop the Storm Collection"
        subtitle="Wearable reminders and creative goods for people who are still standing. Every piece says the same thing: the storm does not get the final word." />
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {q && <p className="mb-6 text-storm-silver/60 text-sm">Showing results for "<span className="text-white">{q}</span>"</p>}
        <div className="flex flex-wrap gap-2.5 mb-10" data-testid="product-filters">
          {CATS.map((c) => (
            <button key={c} onClick={() => setActive(c)} data-testid={`product-filter-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${active === c ? "bg-storm-blue text-white border-storm-blue shadow-[0_0_16px_rgba(59,130,246,0.5)]" : "border-white/15 text-storm-silver/70 hover:text-white hover:border-white/30"}`}>{c}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="text-storm-silver/50 py-20 text-center">Nothing here yet. New drops are on the way.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" data-testid="products-grid">
            {filtered.map((p, i) => (<Reveal key={p.id} delay={(i % 4) * 0.05}><ProductCard product={p} /></Reveal>))}
          </div>
        )}
      </section>
      <NewsletterSection />
    </div>
  );
}
