import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { BRAND } from "../lib/assets";

const SHOP = "https://shop.stormandmeofficial.com";

const FEATURED_ITEMS = [
  {
    name: "Can’t Break Me Tee",
    price: "$39.97",
    image: `${SHOP}/cdn/shop/files/9591691430292853654_2048.jpg?v=1774658636&width=800`,
    href: `${SHOP}/products/can-t-break-me-tee-bold-resilience-streetwear-motivational-graphic-t-shirt`,
  },
  {
    name: "Some Things Aren’t Worth It… But You Are",
    price: "$50.28",
    image: `${SHOP}/cdn/shop/files/7289716964872697818_2048.jpg?v=1775672977&width=800`,
    href: `${SHOP}/products/embroidered-half-zip-pullover-some-things-aren-t-worth-it-but-you-are`,
  },
  {
    name: "The Storm Hoodie — Making It Thru",
    price: "$40.00",
    image: `${SHOP}/cdn/shop/files/12102032306623654724_2048.jpg?v=1773887855&width=800`,
    href: `${SHOP}/products/hoodie-the-storm-graphic-cloud-lightning-pullover`,
  },
  {
    name: "The Storm Made Me Tee",
    price: "$39.97",
    image: `${SHOP}/cdn/shop/files/2768370264072581962_2048.jpg?v=1774660006&width=800`,
    href: `${SHOP}/products/resilient-storm-graphic-tee-the-storm-made-me-motivational-t-shirt`,
  },
];

function FeaturedCard({ item }) {
  return (
    <a
      href={item.href}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25 transition-all duration-300 hover:-translate-y-1 hover:border-storm-blue/45 hover:shadow-[0_20px_55px_rgba(0,0,0,0.38)]"
      data-testid="featured-merch-card"
    >
      <div className="aspect-square overflow-hidden bg-white">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="border-t border-white/10 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base sm:text-lg font-semibold leading-snug text-white transition-colors group-hover:text-storm-blue">
            {item.name}
          </h3>
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

    const reconcile = () => {
      const section = document.querySelector('[data-testid="home-merch-section"]');

      if (!section) {
        if (portalRoot && !portalRoot.isConnected) {
          portalRoot = null;
          originalGrid = null;
          setTarget(null);
        }
        return;
      }

      if (portalRoot?.isConnected) return;

      const container = section.querySelector(".max-w-7xl");
      const nextGrid = section.querySelector(".grid.grid-cols-2");
      if (!container || !nextGrid) return;

      originalGrid = nextGrid;
      portalRoot = document.createElement("div");
      portalRoot.dataset.featuredMerchPortal = "true";
      portalRoot.className = "mt-12";
      container.insertBefore(portalRoot, originalGrid);
      originalGrid.style.display = "none";
      setTarget(portalRoot);
    };

    reconcile();
    const observer = new MutationObserver(reconcile);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      setTarget(null);
      if (originalGrid?.isConnected) originalGrid.style.display = "";
      if (portalRoot?.parentNode) portalRoot.parentNode.removeChild(portalRoot);
    };
  }, []);

  if (!target) return null;

  return createPortal(
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" data-testid="live-featured-merch">
        {FEATURED_ITEMS.map((item) => (
          <FeaturedCard key={item.name} item={item} />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a href={`${SHOP}/search?q=hoodie`} className="rounded-full border border-white/15 px-5 py-2 text-sm text-storm-silver/75 transition hover:border-storm-blue/50 hover:text-white">
          Hoodies
        </a>
        <a href={`${SHOP}/search?q=tee`} className="rounded-full border border-white/15 px-5 py-2 text-sm text-storm-silver/75 transition hover:border-storm-blue/50 hover:text-white">
          Tees
        </a>
        <a href={BRAND.shopCatalog} className="inline-flex items-center gap-2 rounded-full bg-storm-gold px-5 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5">
          <ShoppingBag className="h-4 w-4" /> Browse All Live Items
        </a>
      </div>
    </>,
    target,
  );
}
