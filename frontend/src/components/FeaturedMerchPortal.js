import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

const SHOP_URL = "https://storm-and-me-official.printify.me";

const PRODUCTS = [
  {
    id: "broken-pieces-masterpieces",
    title: "God Makes Masterpieces From Broken Pieces — Cracked Heart Tee",
    price: "$33.99",
    kind: "image",
    image: "https://images-api.printify.com/mockup/6a7bd33e44cf7ff645047bd3/78888/98445/god-makes-masterpieces-from-broken-pieces-cracked-heart-tee.jpg?camera_label=front&revision=1786500190017&s=2048",
    url: "https://storm-and-me-official.printify.me/product/30876182",
    accent: "#b7944c",
    colors: ["#111111", "#f4d7df", "#6f7462"],
  },
  {
    id: "god-builds-masterpieces",
    title: "God Builds Masterpieces Out of Broken Pieces — Cracked Heart Tee",
    price: "$33.99",
    kind: "image",
    image: "https://images-api.printify.com/mockup/6a7bd78b62d856b0f700a290/78888/98445/god-builds-masterpieces-out-of-broken-pieces-cracked-heart-tee.jpg?camera_label=front&revision=1786502519400&s=2048",
    url: "https://storm-and-me-official.printify.me/product/30877072",
    accent: "#b7944c",
    colors: ["#111111", "#f4d7df", "#6f7462"],
  },
];

function ProductArt({ product }) {
  if (product.kind === "image") {
    return <img className="sam-product-photo" src={product.image} alt={product.title} loading="lazy" />;
  }

  const safeId = product.id.replace(/[^a-z0-9-]/gi, "");

  if (product.kind === "hoodie") {
    return (
      <svg className="sam-art" viewBox="0 0 420 340" role="img" aria-label="Light gray pullover hoodie">
        <defs>
          <linearGradient id={`hoodie-${safeId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#e7e8e8" />
            <stop offset="1" stopColor="#c9cccd" />
          </linearGradient>
          <filter id={`shadow-${safeId}`} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#111" floodOpacity="0.16" />
          </filter>
        </defs>
        <path d="M158 82c7-31 25-48 52-48s45 17 52 48l-21 33h-62l-21-33Z" fill="#d7d9da" stroke="#c4c7c8" strokeWidth="2" />
        <path
          filter={`url(#shadow-${safeId})`}
          d="M143 82h134l63 38 43 142-53 17-31-92v115H121V187l-31 92-53-17 43-142 63-38Z"
          fill={`url(#hoodie-${safeId})`}
          stroke="#c8cbcc"
          strokeWidth="2"
        />
        <path d="M167 80c8 23 22 35 43 35s35-12 43-35" fill="none" stroke="#c3c6c7" strokeWidth="5" />
        <path d="M154 232h112l-15 51h-82l-15-51Z" fill="#dde0e1" stroke="#c7cacc" strokeWidth="2" />
        <path d="M177 113l10 63M243 113l-10 63" stroke="#b9bdbe" strokeWidth="3" strokeLinecap="round" />
        <circle cx="210" cy="164" r="4" fill={product.accent} />
        <path d="M193 176h34" stroke={product.accent} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className="sam-art" viewBox="0 0 420 340" role="img" aria-label="Black graphic T-shirt">
      <defs>
        <linearGradient id={`tee-${safeId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a2a2a" />
          <stop offset="0.5" stopColor="#101010" />
          <stop offset="1" stopColor="#252525" />
        </linearGradient>
        <filter id={`shadow-${safeId}`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#111" floodOpacity="0.19" />
        </filter>
      </defs>
      <path
        filter={`url(#shadow-${safeId})`}
        d="M145 54c17 17 38 25 65 25s48-8 65-25l77 34 44 75-58 37-31-35v129H113V165l-31 35-58-37 44-75 77-34Z"
        fill={`url(#tee-${safeId})`}
        stroke="#383838"
        strokeWidth="2"
      />
      <path d="M167 58c7 19 22 29 43 29s36-10 43-29" fill="none" stroke="#424242" strokeWidth="8" strokeLinecap="round" />
      <circle cx="210" cy="174" r="4" fill={product.accent} />
      <path d="M185 189h50" stroke={product.accent} strokeWidth="2" strokeLinecap="round" />
      <path d="M194 198h32" stroke="#d9d5cd" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

function ProductCard({ product }) {
  return (
    <a className="sam-card" href={product.url || SHOP_URL} target="_blank" rel="noreferrer" aria-label={`Shop ${product.title}`}>
      <div className="sam-image">
        <span className="sam-badge">Official product</span>
        <ProductArt product={product} />
      </div>
      <div className="sam-info">
        <div className="sam-title-row">
          <h3>{product.title}</h3>
          <ArrowUpRight size={18} aria-hidden="true" />
        </div>
        <div className="sam-meta">
          <div className="sam-swatches" aria-label="Available color choices">
            {product.colors.map((color) => (
              <span key={color} className="sam-swatch" style={{ backgroundColor: color }} />
            ))}
            <span className="sam-more">+2</span>
          </div>
          <strong>{product.price}</strong>
        </div>
      </div>
    </a>
  );
}

export default function FeaturedMerchPortal() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let frameId;
    let originals = [];

    const locate = () => {
      const node = document.querySelector('[data-testid="home-merch-section"]');
      if (!node) {
        frameId = window.requestAnimationFrame(locate);
        return;
      }

      originals = Array.from(node.children);
      originals.forEach((child) => {
        child.dataset.samOriginalDisplay = child.style.display || "";
        child.style.display = "none";
      });
      setTarget(node);
    };

    locate();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      originals.forEach((child) => {
        child.style.display = child.dataset.samOriginalDisplay || "";
        delete child.dataset.samOriginalDisplay;
      });
    };
  }, []);

  if (!target) return null;

  return createPortal(
    <section className="sam-store" aria-labelledby="sam-store-title">
      <style>{`
        .sam-store {
          width: min(1240px, calc(100% - 32px));
          margin: 0 auto;
          padding: 68px 0 78px;
          color: #f8f4ec;
        }
        .sam-store * { box-sizing: border-box; }
        .sam-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
          gap: 28px;
          margin-bottom: 28px;
        }
        .sam-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 10px;
          color: #78a9ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .17em;
          text-transform: uppercase;
        }
        .sam-store h2 {
          margin: 0;
          max-width: 720px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(35px, 5vw, 60px);
          line-height: .98;
          letter-spacing: -.035em;
        }
        .sam-intro {
          max-width: 650px;
          margin: 15px 0 0;
          color: rgba(248, 244, 236, .68);
          font-size: 16px;
          line-height: 1.62;
        }
        .sam-shop,
        .sam-shop-bottom {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 48px;
          padding: 0 21px;
          border: 1px solid rgba(215, 180, 97, .55);
          border-radius: 999px;
          background: #d7b461;
          color: #10141b;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }
        .sam-shop:hover,
        .sam-shop-bottom:hover {
          transform: translateY(-2px);
          background: #e6ca7c;
          box-shadow: 0 12px 28px rgba(0, 0, 0, .24);
        }
        .sam-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .sam-card {
          overflow: hidden;
          min-width: 0;
          border: 1px solid rgba(255, 255, 255, .13);
          border-radius: 17px;
          background: rgba(9, 14, 22, .9);
          color: inherit;
          text-decoration: none;
          box-shadow: 0 18px 48px rgba(0, 0, 0, .23);
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
        }
        .sam-card:hover {
          transform: translateY(-6px);
          border-color: rgba(120, 169, 255, .52);
          box-shadow: 0 24px 58px rgba(0, 0, 0, .34);
        }
        .sam-image {
          position: relative;
          display: grid;
          place-items: center;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: radial-gradient(circle at 50% 25%, #fff 0%, #f3f0eb 42%, #e3ded7 100%);
        }
        .sam-image::after {
          content: "";
          position: absolute;
          z-index: 0;
          left: 10%;
          right: 10%;
          bottom: 7%;
          height: 18px;
          border-radius: 50%;
          background: rgba(22, 24, 27, .14);
          filter: blur(9px);
        }
        .sam-badge {
          position: absolute;
          z-index: 3;
          top: 13px;
          left: 13px;
          padding: 6px 9px;
          border: 1px solid rgba(11, 20, 32, .13);
          border-radius: 999px;
          background: rgba(255, 255, 255, .78);
          color: #17202a;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .13em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }
        .sam-art {
          position: relative;
          z-index: 1;
          width: 90%;
          height: 90%;
          transition: transform 220ms ease;
        }
        .sam-card:hover .sam-art { transform: scale(1.035); }
        .sam-product-photo {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 220ms ease;
        }
        .sam-card:hover .sam-product-photo { transform: scale(1.035); }
        .sam-info { padding: 18px 17px 19px; }
        .sam-title-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: start;
        }
        .sam-title-row h3 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          line-height: 1.3;
          letter-spacing: -.014em;
        }
        .sam-title-row svg {
          margin-top: 2px;
          color: rgba(248, 244, 236, .5);
          transition: color 180ms ease, transform 180ms ease;
        }
        .sam-card:hover .sam-title-row svg {
          color: #78a9ff;
          transform: translate(2px, -2px);
        }
        .sam-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-top: 18px;
        }
        .sam-meta strong {
          color: #d7b461;
          font-size: 15px;
          white-space: nowrap;
        }
        .sam-swatches { display: flex; align-items: center; gap: 6px; }
        .sam-swatch {
          width: 14px;
          height: 14px;
          border: 1px solid rgba(255, 255, 255, .31);
          border-radius: 50%;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, .23);
        }
        .sam-more {
          color: rgba(248, 244, 236, .58);
          font-size: 11px;
          font-weight: 700;
        }
        .sam-bottom-wrap { display: none; justify-content: center; margin-top: 28px; }
        @media (max-width: 1040px) {
          .sam-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 720px) {
          .sam-store { width: min(100% - 24px, 560px); padding: 52px 0 64px; }
          .sam-head { grid-template-columns: 1fr; margin-bottom: 24px; }
          .sam-head .sam-shop { display: none; }
          .sam-bottom-wrap { display: flex; }
        }
        @media (max-width: 540px) {
          .sam-grid { grid-template-columns: 1fr; }
          .sam-image { aspect-ratio: 1.12 / 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sam-card, .sam-art, .sam-product-photo, .sam-shop, .sam-shop-bottom, .sam-title-row svg { transition: none; }
        }
      `}</style>

      <div className="sam-head">
        <div>
          <p className="sam-eyebrow"><ShoppingBag size={15} aria-hidden="true" /> Official Storm &amp; Me products</p>
          <h2 id="sam-store-title">Wear what you survived.</h2>
          <p className="sam-intro">The live Storm & Me collection—real product photos, accurate prices, and secure checkout through our official Printify store.</p>
        </div>
        <a className="sam-shop" href={SHOP_URL} target="_blank" rel="noreferrer">Shop all products <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>

      <div className="sam-grid">
        {PRODUCTS.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      <div className="sam-bottom-wrap">
        <a className="sam-shop-bottom" href={SHOP_URL} target="_blank" rel="noreferrer">Shop all products <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </section>,
    target,
  );
}
