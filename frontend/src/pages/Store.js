import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { getProducts } from "../lib/api";
import PageHero from "../components/PageHero";
import { ProductCard } from "../components/cards";
import { NewsletterSection, Overline, Reveal } from "../components/shared";

const CATEGORIES = ["All", "Clothing", "Books", "Music", "Home and Office", "Accessories", "Limited Edition", "Bundles", "New Arrivals"];

export default function Store() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [params] = useSearchParams();
  const query = (params.get("q") || "").toLowerCase();

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  let filtered = active === "All" ? products : products.filter((product) => (product.categories || []).includes(active));
  if (query) filtered = filtered.filter((product) => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query));

  return (
    <div>
      <PageHero
        overline="The Storm Collection"
        title="A Collection Being Built With Purpose"
        subtitle="Wearable reminders and creative goods are being designed carefully. This page is a preview until real products, fulfillment, policies, and secure checkout are connected."
      />

      <section className="max-w-7xl mx-auto px-6 pb-24">
        {!products.length ? (
          <Reveal>
            <div className="wet-glass relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12 text-center">
              <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-storm-blue/20 blur-[90px]" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <PackageOpen className="h-8 w-8 text-storm-blue" />
                </div>
                <Overline className="mt-7 mb-4">Designed before it is sold</Overline>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">The Collection Is Still Taking Shape</h2>
                <p className="mx-auto mt-5 max-w-2xl text-storm-silver/70 leading-relaxed font-light">
                  There is no active cart or checkout yet. Real product photography, sizes, pricing, shipping, returns, and fulfillment details will be published before the first item can be ordered.
                </p>
              </div>
            </div>
          </Reveal>
        ) : (
          <>
            {query && <p className="mb-6 text-storm-silver/60 text-sm">Showing results for “<span className="text-white">{query}</span>”</p>}
            <div className="flex flex-wrap gap-2.5 mb-10" data-testid="product-filters">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActive(category)}
                  data-testid={`product-filter-${category.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${active === category ? "bg-storm-blue text-white border-storm-blue shadow-[0_0_16px_rgba(59,130,246,0.5)]" : "border-white/15 text-storm-silver/70 hover:text-white hover:border-white/30"}`}
                >
                  {category}
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <p className="text-storm-silver/50 py-20 text-center">Nothing matches that search yet.</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" data-testid="products-grid">
                {filtered.map((product, index) => <Reveal key={product.id} delay={(index % 4) * 0.05}><ProductCard product={product} /></Reveal>)}
              </div>
            )}
          </>
        )}
      </section>
      <NewsletterSection />
    </div>
  );
}
