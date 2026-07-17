import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { BRAND } from "../lib/assets";

const FEATURED_ITEMS = [
  {
    name: "Can’t Break Me Tee",
    price: "$39.97",
    kind: "tee",
    words: ["CAN’T", "BREAK", "ME"],
    query: "Can't Break Me Tee",
  },
  {
    name: "Some Things Aren’t Worth It… But You Are",
    price: "$50.28",
    kind: "halfzip",
    words: ["STORM", "& ME"],
    query: "Embroidered Half-Zip Pullover",
  },
  {
    name: "The Storm & Me Hoodie",
    price: "$45.53",
    kind: "hoodie",
    words: ["The Storm", "& Me"],
    query: "The Storm & Me Hoodie",
  },
  {
    name: "Built Through It Tee",
    price: "$39.97",
    kind: "tee",
    words: ["BUILT", "THROUGH", "IT"],
    query: "The Storm Tee Built Through It",
  },
];

function GarmentArt({ kind, words }) {
  const isDark = kind === "halfzip";
  const fill = isDark ? "#a9aaad" : "#f4f3ef";
  const ink = isDark ? "#202126" : "#17181d";

  return (
    <svg viewBox="0 0 320 320" role="img" aria-label={`${words.join(" ")} apparel preview`} className="h-full w-full">
      <defs>
        <linearGradient id={`fabric-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={fill} />
          <stop offset="1" stopColor={isDark ? "#7d7f83" : "#deddd8"} />
        </linearGradient>
        <filter id={`shadow-${kind}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="13" stdDeviation="9" floodColor="#000" floodOpacity="0.34" />
        </filter>
      </defs>

      <g filter={`url(#shadow-${kind})`}>
        {kind === "tee" && (
          <path d="M102 59 70 76 35 112l35 39 25-19v124c0 9 7 16 16 16h98c9 0 16-7 16-16V132l25 19 35-39-35-36-32-17-22 23h-72l-22-23Z" fill={`url(#fabric-${kind})`} stroke="#c8c6c0" strokeWidth="3" />
        )}
        {kind === "hoodie" && (
          <>
            <path d="M107 77 75 91 43 122l30 36 24-17v116c0 9 7 15 16 15h94c9 0 16-6 16-15V141l24 17 30-36-32-31-32-14-18 20h-70l-18-20Z" fill={`url(#fabric-${kind})`} stroke="#c8c6c0" strokeWidth="3" />
            <path d="M117 85c8-34 78-34 86 0l-17 29h-52l-17-29Z" fill="#e5e3dd" stroke="#c8c6c0" strokeWidth="3" />
            <path d="M119 217h82l-11 34h-60l-11-34Z" fill="#e8e6e0" stroke="#cbc9c3" strokeWidth="2" />
          </>
        )}
        {kind === "halfzip" && (
          <>
            <path d="M104 58 70 76 38 112l33 39 25-19v124c0 9 7 16 16 16h96c9 0 16-7 16-16V132l25 19 33-39-32-36-34-18-18 22h-76l-18-22Z" fill={`url(#fabric-${kind})`} stroke="#77797e" strokeWidth="3" />
            <path d="M126 61h68v48h-68z" fill="#888a8f" stroke="#6f7176" strokeWidth="3" />
            <path d="M160 61v74" stroke="#3e4045" strokeWidth="4" />
          </>
        )}
      </g>

      <g fill={ink} textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700">
        {words.map((word, index) => (
          <text key={word} x="160" y={kind === "hoodie" ? 144 + index * 27 : 132 + index * 31} fontSize={words.length > 2 ? 25 : 23}>
            {word}
          </text>
        ))}
      </g>
      <path d="M146 220h28" stroke="#d9a947" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function FeaturedCard({ item }) {
  const href = `${BRAND.shop}/search?q=${encodeURIComponent(item.query)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25 transition-all duration-300 hover:-translate-y-1 hover:border-storm-blue/45 hover:shadow-[0_20px_55px_rgba(0,0,0,0.38)]"
    >
      <div className="aspect-square overflow-hidden bg-gradient-to-b from-white/[0.08] to-black/20 p-3 sm:p-5">
        <GarmentArt kind={item.kind} words={item.words} />
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
