import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { BRAND } from "../lib/assets";

const REAL_MOCKUPS = {
  cant: "data:image/jpeg;base64,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",
  halfzip: "data:image/jpeg;base64,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",
  hoodie: "data:image/jpeg;base64,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",
  built: "data:image/jpeg;base64,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"
};

const FEATURED_ITEMS = [
  { name: "Can’t Break Me Tee", price: "$39.97", image: REAL_MOCKUPS.cant, query: "Can't Break Me Tee" },
  { name: "Some Things Aren’t Worth It… But You Are", price: "$50.28", image: REAL_MOCKUPS.halfzip, query: "Embroidered Half-Zip Pullover" },
  { name: "The Storm & Me Hoodie", price: "$45.53", image: REAL_MOCKUPS.hoodie, query: "The Storm & Me Hoodie" },
  { name: "Built Through It Tee", price: "$39.97", image: REAL_MOCKUPS.built, query: "The Storm Tee Built Through It" },
];

function FeaturedCard({ item }) {
  const href = `${BRAND.shop}/search?q=${encodeURIComponent(item.query)}`;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25 transition-all duration-300 hover:-translate-y-1 hover:border-storm-blue/45 hover:shadow-[0_20px_55px_rgba(0,0,0,0.38)]">
      <div className="aspect-square overflow-hidden bg-white">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="border-t border-white/10 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base sm:text-lg font-semibold leading-snug text-white group-hover:text-storm-blue transition-colors">{item.name}</h3>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-storm-silver/45 group-hover:text-storm-blue" />
        </div>
        <p className="mt-3 text-sm font-semibold text-storm-gold">{item.price}</p>
      </div>
    </a>
  );
}

export default function FeaturedMerchPortal() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let originalGrid = null;
    let portalRoot = null;

    const mount = () => {
      const section = document.querySelector('[data-testid="home-merch-section"]');
      if (!section || portalRoot) return;
      const container = section.querySelector(".max-w-7xl");
      originalGrid = section.querySelector(".grid.grid-cols-2");
      if (!container || !originalGrid) return;

      portalRoot = document.createElement("div");
      portalRoot.dataset.featuredMerchPortal = "true";
      portalRoot.className = "mt-12";
      container.insertBefore(portalRoot, originalGrid);
      originalGrid.style.display = "none";
      setTarget(portalRoot);
    };

    mount();
    const observer = new MutationObserver(mount);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      setTarget(null);
      if (originalGrid) originalGrid.style.display = "";
      if (portalRoot?.parentNode) portalRoot.parentNode.removeChild(portalRoot);
    };
  }, []);

  if (!target) return null;

  return createPortal(
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" data-testid="live-featured-merch">
        {FEATURED_ITEMS.map((item) => <FeaturedCard key={item.name} item={item} />)}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a href={`${BRAND.shop}/search?q=hoodie`} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-5 py-2 text-sm text-storm-silver/75 transition hover:border-storm-blue/50 hover:text-white">Hoodies</a>
        <a href={`${BRAND.shop}/search?q=tee`} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-5 py-2 text-sm text-storm-silver/75 transition hover:border-storm-blue/50 hover:text-white">Tees</a>
        <a href={BRAND.shopCatalog} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-storm-gold px-5 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5">
          <ShoppingBag className="h-4 w-4" /> Browse All Live Items
        </a>
      </div>
    </>,
    target,
  );
}
