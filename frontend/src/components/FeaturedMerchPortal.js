import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { ASSETS } from "../lib/assets";
import rulesProductData from "../data/rules-products.generated.json";

const SHOP_URL = "https://storm-and-me-official.printify.me";

const PRODUCTS = [
  {
    id: "broken-pieces-masterpieces",
    title: "God Makes Masterpieces From Broken Pieces — Cracked Heart Tee",
    price: "$33.99",
    image: "https://images-api.printify.com/mockup/6a7bd33e44cf7ff645047bd3/78888/98445/god-makes-masterpieces-from-broken-pieces-cracked-heart-tee.jpg?camera_label=front&revision=1786500190017&s=2048",
    url: "https://storm-and-me-official.printify.me/product/30876182",
    colors: ["#111111", "#f4d7df", "#6f7462"],
  },
  {
    id: "god-builds-masterpieces",
    title: "God Builds Masterpieces Out of Broken Pieces — Cracked Heart Tee",
    price: "$33.99",
    image: "https://images-api.printify.com/mockup/6a7bd78b62d856b0f700a290/79048/98445/god-builds-masterpieces-out-of-broken-pieces-cracked-heart-tee.jpg?camera_label=front&revision=1786502519400&s=2048",
    url: "https://storm-and-me-official.printify.me/product/30877072",
    colors: ["#111111", "#f4d7df", "#6f7462"],
  },
];

const RULES_DONT_EXIST_PRODUCTS = rulesProductData.products;

function RulesCard({ item }) {
  return (
    <a
      className="rules-card"
      href={item.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Shop ${item.title}`}
    >
      <div className="rules-card-top">
        <span className="rules-live-badge">Live product</span>
        <img
          className="rules-product-photo"
          src={item.image}
          alt={`${item.title} — real Printify back-view product mockup`}
          loading="lazy"
        />
      </div>
      <div className="rules-card-copy">
        <span className="rules-label">{item.label}</span>
        <h4>{item.title}</h4>
        <p>{item.description}</p>
        <div className="rules-price-row">
          <strong className="rules-price">{item.price}</strong>
          <span className="rules-view">View product <ArrowUpRight size={15} aria-hidden="true" /></span>
        </div>
      </div>
    </a>
  );
}

function ProductCard({ product }) {
  return (
    <a className="sam-card" href={product.url || SHOP_URL} target="_blank" rel="noreferrer" aria-label={`Shop ${product.title}`}>
      <div className="sam-image">
        <span className="sam-badge">Official product</span>
        <img className="sam-product-photo" src={product.image} alt={product.title} loading="lazy" />
      </div>
      <div className="sam-info">
        <div className="sam-title-row">
          <h3>{product.title}</h3>
          <ArrowUpRight size={18} aria-hidden="true" />
        </div>
        <div className="sam-meta">
          <div className="sam-swatches" aria-label="Available color choices">
            {product.colors.map((color) => <span key={color} className="sam-swatch" style={{ backgroundColor: color }} />)}
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
        .sam-store { width:min(1240px,calc(100% - 32px)); margin:0 auto; padding:64px 0 78px; color:#f8f4ec; }
        .sam-store * { box-sizing:border-box; }
        .sam-head { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:end; gap:28px; margin-bottom:28px; }
        .sam-eyebrow { display:inline-flex; align-items:center; gap:8px; margin:0 0 10px; color:#78a9ff; font-size:12px; font-weight:800; letter-spacing:.17em; text-transform:uppercase; }
        .sam-store h2 { margin:0; max-width:790px; font-family:Georgia,"Times New Roman",serif; font-size:clamp(35px,5vw,60px); line-height:.98; letter-spacing:-.035em; }
        .sam-intro { max-width:690px; margin:15px 0 0; color:rgba(248,244,236,.68); font-size:16px; line-height:1.62; }
        .sam-shop,.sam-shop-bottom,.rules-cta { display:inline-flex; align-items:center; justify-content:center; gap:9px; min-height:48px; padding:0 21px; border:1px solid rgba(215,180,97,.55); border-radius:999px; background:#d7b461; color:#10141b; font-size:14px; font-weight:800; text-decoration:none; transition:transform 180ms ease,box-shadow 180ms ease,background 180ms ease; }
        .sam-shop:hover,.sam-shop-bottom:hover,.rules-cta:hover { transform:translateY(-2px); background:#e6ca7c; box-shadow:0 12px 28px rgba(0,0,0,.24); }

        .rules-shell { position:relative; overflow:hidden; margin:34px 0 42px; border:1px solid rgba(255,255,255,.13); border-radius:28px; background:linear-gradient(135deg,#f7f2e8 0%,#eee7dc 58%,#dbe3ed 100%); color:#101a2c; box-shadow:0 28px 70px rgba(0,0,0,.28); }
        .rules-shell::before { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 10% 0%,rgba(181,42,47,.12),transparent 32%),radial-gradient(circle at 90% 5%,rgba(17,38,74,.15),transparent 36%); }
        .rules-hero { position:relative; display:grid; grid-template-columns:minmax(0,1.2fr) minmax(230px,.65fr); gap:28px; align-items:center; padding:38px 40px 26px; }
        .rules-overline { margin:0 0 10px; color:#b52a2f; font-size:11px; font-weight:900; letter-spacing:.19em; text-transform:uppercase; }
        .rules-hero h3 { margin:0; max-width:760px; font-family:Arial Black,Arial,sans-serif; font-size:clamp(38px,5vw,70px); line-height:.9; letter-spacing:-.045em; color:#11264a; }
        .rules-hero-copy { margin:17px 0 0; max-width:700px; color:rgba(16,26,44,.72); font-size:16px; line-height:1.62; }
        .rules-disclaimer { margin:11px 0 0; font-size:12px; color:rgba(16,26,44,.56); }
        .rules-logo-panel { justify-self:end; display:flex; flex-direction:column; align-items:center; gap:10px; width:min(235px,100%); padding:20px; border:1px solid rgba(17,38,74,.12); border-radius:22px; background:rgba(255,255,255,.58); box-shadow:inset 0 1px 0 rgba(255,255,255,.8); backdrop-filter:blur(10px); }
        .rules-logo-panel img { width:min(170px,100%); height:auto; object-fit:contain; filter:drop-shadow(0 8px 18px rgba(17,38,74,.18)); }
        .rules-logo-panel span { color:rgba(17,38,74,.68); font-size:10px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; text-align:center; }

        .rules-grid { position:relative; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; padding:18px 22px 26px; }
        .rules-card { overflow:hidden; min-width:0; border:1px solid rgba(17,38,74,.13); border-radius:20px; background:rgba(255,255,255,.84); color:#101a2c; text-decoration:none; box-shadow:0 15px 34px rgba(17,38,74,.13); transition:transform 180ms ease,box-shadow 180ms ease,border-color 180ms ease; }
        .rules-card:hover { transform:translateY(-5px); border-color:rgba(181,42,47,.34); box-shadow:0 22px 46px rgba(17,38,74,.2); }
        .rules-card-top { position:relative; display:grid; place-items:center; aspect-ratio:1/1.04; overflow:hidden; background:linear-gradient(145deg,#eef2f6 0%,#dbe2ea 100%); }
        .rules-live-badge { position:absolute; z-index:3; top:13px; left:13px; padding:7px 10px; border-radius:999px; background:#11264a; color:#fff; font-size:8px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; box-shadow:0 6px 18px rgba(17,38,74,.2); }
        .rules-product-photo { width:100%; height:100%; object-fit:cover; object-position:center; display:block; transition:transform 230ms ease; }
        .rules-card:hover .rules-product-photo { transform:scale(1.025); }
        .rules-card-copy { padding:17px 17px 18px; }
        .rules-label { color:#b52a2f; font-size:9px; font-weight:900; letter-spacing:.15em; text-transform:uppercase; }
        .rules-card-copy h4 { margin:7px 0 8px; font-family:Georgia,"Times New Roman",serif; font-size:clamp(17px,1.8vw,21px); line-height:1.22; color:#111a2a; }
        .rules-card-copy p { margin:0; min-height:39px; color:rgba(16,26,44,.62); font-size:12px; line-height:1.5; }
        .rules-price-row { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:15px; padding-top:14px; border-top:1px solid rgba(17,38,74,.09); }
        .rules-price { color:#0d1f3e; font-size:20px; letter-spacing:-.02em; }
        .rules-view { display:inline-flex; align-items:center; gap:5px; color:#11264a; font-size:11px; font-weight:900; white-space:nowrap; }
        .rules-footer { position:relative; display:flex; align-items:center; justify-content:space-between; gap:18px; padding:0 40px 34px; }
        .rules-footer p { margin:0; color:rgba(16,26,44,.61); font-size:12px; line-height:1.5; }

        .sam-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
        .sam-card { overflow:hidden; min-width:0; border:1px solid rgba(255,255,255,.13); border-radius:17px; background:rgba(9,14,22,.9); color:inherit; text-decoration:none; box-shadow:0 18px 48px rgba(0,0,0,.23); transition:transform 180ms ease,border-color 180ms ease,box-shadow 180ms ease; }
        .sam-card:hover { transform:translateY(-6px); border-color:rgba(120,169,255,.52); box-shadow:0 24px 58px rgba(0,0,0,.34); }
        .sam-image { position:relative; display:grid; place-items:center; aspect-ratio:1/1; overflow:hidden; border-bottom:1px solid rgba(215,180,97,.3); background:radial-gradient(circle at 72% 16%,rgba(120,169,255,.55),transparent 25%),radial-gradient(circle at 48% 40%,rgba(245,248,252,.92) 0%,rgba(190,203,220,.84) 48%,rgba(41,57,79,.96) 100%),linear-gradient(145deg,#172436,#526885 58%,#090f18); }
        .sam-badge { position:absolute; z-index:3; top:13px; left:13px; padding:6px 9px; border-radius:999px; background:rgba(255,255,255,.84); color:#17202a; font-size:9px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
        .sam-product-photo { width:100%; height:100%; object-fit:cover; mix-blend-mode:multiply; filter:contrast(1.04) saturate(1.08); transition:transform 220ms ease; }
        .sam-card:hover .sam-product-photo { transform:scale(1.035); }
        .sam-info { padding:18px 17px 19px; }
        .sam-title-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:12px; align-items:start; }
        .sam-title-row h3 { margin:0; font-family:Georgia,"Times New Roman",serif; font-size:17px; line-height:1.3; }
        .sam-title-row svg { margin-top:2px; color:rgba(248,244,236,.5); }
        .sam-meta { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-top:18px; }
        .sam-meta strong { color:#d7b461; font-size:15px; white-space:nowrap; }
        .sam-swatches { display:flex; align-items:center; gap:6px; }
        .sam-swatch { width:14px; height:14px; border:1px solid rgba(255,255,255,.31); border-radius:50%; box-shadow:0 0 0 1px rgba(0,0,0,.23); }
        .sam-bottom-wrap { display:none; justify-content:center; margin-top:28px; }

        @media (max-width:940px) {
          .rules-hero { grid-template-columns:1fr; }
          .rules-logo-panel { justify-self:start; width:205px; }
          .rules-grid { grid-template-columns:1fr 1fr; }
          .rules-card:last-child { grid-column:1/-1; width:min(50%,430px); justify-self:center; }
        }
        @media (max-width:720px) {
          .sam-store { width:min(100% - 24px,560px); padding:52px 0 64px; }
          .sam-head { grid-template-columns:1fr; margin-bottom:24px; }
          .sam-head .sam-shop { display:none; }
          .sam-bottom-wrap { display:flex; }
          .rules-shell { border-radius:22px; }
          .rules-hero { padding:29px 22px 16px; }
          .rules-hero h3 { font-size:clamp(36px,11vw,52px); }
          .rules-logo-panel { width:175px; padding:15px; }
          .rules-grid { grid-template-columns:1fr; padding:12px 13px 18px; gap:16px; }
          .rules-card:last-child { grid-column:auto; width:100%; }
          .rules-card { display:grid; grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr); align-items:stretch; }
          .rules-card-top { aspect-ratio:auto; min-height:255px; }
          .rules-card-copy { display:flex; flex-direction:column; justify-content:center; padding:16px 14px; }
          .rules-card-copy h4 { font-size:17px; }
          .rules-card-copy p { min-height:0; font-size:11px; }
          .rules-price-row { align-items:flex-start; flex-direction:column; gap:7px; }
          .rules-footer { flex-direction:column; align-items:flex-start; padding:5px 22px 28px; }
        }
        @media (max-width:470px) {
          .rules-card { grid-template-columns:1fr; }
          .rules-card-top { min-height:330px; }
          .rules-product-photo { object-fit:cover; }
          .rules-card-copy { padding:17px; }
          .rules-price-row { flex-direction:row; align-items:center; }
          .sam-grid { grid-template-columns:1fr; }
        }
        @media (prefers-reduced-motion:reduce) {
          .sam-card,.sam-product-photo,.sam-shop,.sam-shop-bottom,.rules-card,.rules-product-photo,.rules-cta { transition:none; }
        }
      `}</style>

      <div className="sam-head">
        <div>
          <p className="sam-eyebrow"><ShoppingBag size={15} aria-hidden="true" /> Official Storm And Me products</p>
          <h2 id="sam-store-title">Wear what you survived. Wear what made you laugh.</h2>
          <p className="sam-intro">Real Storm And Me products, real garment mockups, and secure checkout through our official Printify storefront.</p>
        </div>
        <a className="sam-shop" href={SHOP_URL} target="_blank" rel="noreferrer">Shop all products <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>

      <section className="rules-shell" data-testid="rules-dont-exist-collection" aria-labelledby="rules-collection-title">
        <div className="rules-hero">
          <div>
            <p className="rules-overline">Rules Don’t Exist Anymore collection</p>
            <h3 id="rules-collection-title">RULES DON’T EXIST ANYMORE</h3>
            <p className="rules-hero-copy">The straight-face joke is now a real collection: <strong>OBAMA 2028</strong>, the punchline underneath, and the full official Storm And Me cloud-and-lightning mark worked into the actual garments.</p>
            <p className="rules-disclaimer">Satirical apparel. Not affiliated with, endorsed by, or connected to any political campaign.</p>
          </div>
          <div className="rules-logo-panel">
            <img src={ASSETS.logo} alt="Storm And Me official cloud and lightning logo" loading="lazy" />
            <span>Official Storm And Me brand mark</span>
          </div>
        </div>

        <div className="rules-grid">
          {RULES_DONT_EXIST_PRODUCTS.map((item) => <RulesCard key={item.id} item={item} />)}
        </div>

        <div className="rules-footer">
          <p>These cards use Printify’s real product mockups for the exact live products — no drawn garment placeholders.</p>
          <a className="rules-cta" href={SHOP_URL} target="_blank" rel="noreferrer">Shop the collection <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
      </section>

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
