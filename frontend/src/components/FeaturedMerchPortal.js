import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ShoppingBag, Sparkles, Zap, Flower2 } from "lucide-react";

const PRINTIFY_STORE = "https://stormandme.printify.me";

const FEATURED_ITEMS = [
  {
    id: "built-through-the-storm",
    name: "Built Through the Storm Tee",
    price: "$32.99",
    message: "The pressure did not finish you. It built you.",
    accent: "blue",
  },
  {
    id: "faith-over-fear",
    name: "Faith Over Fear Tee",
    price: "$32.99",
    message: "Move with faith even when fear gets loud.",
    accent: "gold",
  },
  {
    id: "rise-through-the-pain",
    name: "Rise Through the Pain Tee",
    price: "$32.99",
    message: "Pain may shape the chapter, but it does not write the ending.",
    accent: "red",
  },
];

function ShirtArt({ item }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#07090d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.13),transparent_46%)]" />
      <div className="relative h-[82%] w-[82%]">
        <div className="absolute left-1/2 top-[7%] h-[13%] w-[24%] -translate-x-1/2 rounded-b-[50%] border-b border-white/10 bg-[#050505]" />
        <div className="absolute inset-x-[17%] bottom-[2%] top-[6%] rounded-b-2xl bg-gradient-to-b from-[#171717] to-[#090909] shadow-[0_28px_65px_rgba(0,0,0,0.75)] ring-1 ring-white/10" />
        <div className="absolute left-[4%] top-[12%] h-[34%] w-[27%] -rotate-[19deg] rounded-l-2xl bg-gradient-to-b from-[#161616] to-[#090909] ring-1 ring-white/10" />
        <div className="absolute right-[4%] top-[12%] h-[34%] w-[27%] rotate-[19deg] rounded-r-2xl bg-gradient-to-b from-[#161616] to-[#090909] ring-1 ring-white/10" />

        <div className="absolute inset-x-[22%] top-[22%] z-10 flex flex-col items-center text-center">
          {item.id === "built-through-the-storm" && (
            <>
              <span className="font-display text-[clamp(1.2rem,3vw,2.4rem)] font-black uppercase leading-[0.9] tracking-tight text-white">Built</span>
              <span className="mt-1 text-[clamp(.52rem,1.15vw,.9rem)] font-bold uppercase tracking-[0.1em] text-white/85">Through the</span>
              <Zap className="my-2 h-10 w-10 fill-storm-blue text-storm-blue" />
              <span className="font-display text-[clamp(1.2rem,3vw,2.4rem)] font-black uppercase leading-[0.9] tracking-tight text-white">Storm</span>
            </>
          )}

          {item.id === "faith-over-fear" && (
            <>
              <span className="font-display text-[clamp(1.05rem,2.7vw,2.15rem)] font-black uppercase leading-[0.92] text-white">Faith</span>
              <span className="my-1 -rotate-3 font-display text-[clamp(.9rem,2.3vw,1.8rem)] font-black uppercase italic text-storm-gold">Over</span>
              <span className="font-display text-[clamp(1.05rem,2.7vw,2.15rem)] font-black uppercase leading-[0.92] text-white">Fear</span>
              <div className="mt-3 h-px w-16 bg-storm-gold/80" />
            </>
          )}

          {item.id === "rise-through-the-pain" && (
            <>
              <Flower2 className="mb-1 h-9 w-9 text-red-500" />
              <span className="font-display text-[clamp(.95rem,2.45vw,1.95rem)] font-black uppercase leading-[0.95] text-white">Rise</span>
              <span className="my-1 text-[clamp(.48rem,1.1vw,.82rem)] font-bold uppercase tracking-[0.13em] text-white/75">Through the</span>
              <span className="-rotate-3 font-display text-[clamp(1.05rem,2.8vw,2.2rem)] font-black uppercase italic leading-[0.9] text-red-500">Pain</span>
            </>
          )}

          <span className="mt-4 text-[8px] font-bold uppercase tracking-[0.23em] text-white/70">Storm &amp; Me</span>
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ item }) {
  return (
    <a
      href={PRINTIFY_STORE}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25 transition-all duration-300 hover:-translate-y-1 hover:border-storm-blue/45 hover:shadow-[0_20px_55px_rgba(0,0,0,0.38)]"
      data-testid="featured-merch-card"
    >
      <div className="relative aspect-square overflow-hidden">
        <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-storm-blue/30 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-storm-blue backdrop-blur">
          <Sparkles className="h-3 w-3" /> New Drop
        </div>
        <ShirtArt item={item} />
      </div>
      <div className="border-t border-white/10 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold leading-snug text-white transition-colors group-hover:text-storm-blue sm:text-lg">
            {item.name}
          </h3>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-storm-silver/45 group-hover:text-storm-blue" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-storm-silver/60">{item.message}</p>
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
      <div className="mb-7 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-storm-blue/25 bg-storm-blue/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-storm-blue">
          <Sparkles className="h-4 w-4" /> Three New Storm &amp; Me Tees
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-storm-silver/65 sm:text-base">
          Bold reminders for the days when surviving is the victory.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6" data-testid="live-featured-merch">
        {FEATURED_ITEMS.map((item) => (
          <FeaturedCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href={PRINTIFY_STORE}
          className="inline-flex items-center gap-2 rounded-full bg-storm-gold px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
          data-testid="browse-new-storm-shirts"
        >
          <ShoppingBag className="h-4 w-4" /> Shop the New Drop
        </a>
      </div>
    </>,
    target,
  );
}
