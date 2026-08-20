import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { ASSETS } from "../lib/assets";

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

const RULES_DONT_EXIST_PRODUCTS = [
  {
    id: "rules-white-tee",
    title: "Obama 2028 — White Statement Tee",
    garment: "tee",
    garmentColor: "#f7f5ef",
    ink: "#11264a",
    secondary: "#b52a2f",
    label: "White tee",
  },
  {
    id: "rules-black-tee",
    title: "Obama 2028 — Vintage Black Statement Tee",
    garment: "tee",
    garmentColor: "#17191e",
    ink: "#f5f0e6",
    secondary: "#d9494d",
    label: "Washed black",
  },
  {
    id: "rules-hoodie",
    title: "Obama 2028 — Statement Hoodie",
    garment: "hoodie",
    garmentColor: "#e9e6de",
    ink: "#11264a",
    secondary: "#b52a2f",
    label: "Premium hoodie",
  },
];

function CampaignPrint({ ink, secondary }) {
  return (
    <g textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900">
      <text x="210" y="143" fontSize="30" fill={ink} letterSpacing="1.5">OBAMA</text>
      <text x="210" y="181" fontSize="42" fill={ink} letterSpacing="2">2028</text>
      <path d="M144 194h132" stroke={secondary} strokeWidth="5" />
      <path d="M156 203h108" stroke={ink} strokeWidth="3" />
      <text x="210" y="225" fontSize="15" fill={ink} letterSpacing="2.5">SINCE</text>
      <text x="210" y="251" fontSize="18" fill={secondary} letterSpacing=".5">RULES DON’T</text>
      <text x="210" y="274" fontSize="15" fill={ink} letterSpacing=".4">EXIST ANYMORE</text>
      <text x="137" y="180" fontSize="17" fill={secondary}>★</text>
      <text x="283" y="180" fontSize="17" fill={secondary}>★</text>
    </g>
  );
}

function RulesMockup({ item }) {
  const isHoodie = item.garment === "hoodie";

  return (
    <div className="rules-mockup" aria-label={item.title}>
      <svg className="rules-garment" viewBox="0 0 420 340" role="img" aria-label={item.title}>
        <defs>
          <filter id={`rules-shadow-${item.id}`} x="-25%" y="-25%" width="150%" height="170%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#06101f" floodOpacity=".28" />
          </filter>
          <linearGradient id={`rules-fabric-${item.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={item.garmentColor} />
            <stop offset=".52" stopColor={item.garmentColor} stopOpacity=".9" />
            <stop offset="1" stopColor={item.garmentColor} stopOpacity=".74" />
          </linearGradient>
        </defs>

        {isHoodie ? (
          <>
            <path d="M160 73c7-29 24-44 50-44s43 15 50 44l-20 35h-60l-20-35Z" fill={item.garmentColor} opacity=".95" />
            <path
              filter={`url(#rules-shadow-${item.id})`}
              d="M145 75h130l62 38 43 142-50 17-31-91v120H121V181l-31 91-50-17 43-142 62-38Z"
              fill={`url(#rules-fabric-${item.id})`}
              stroke="rgba(255,255,255,.2)"
              strokeWidth="2"
            />
            <path d="M167 77c8 22 22 33 43 33s35-11 43-33" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth="5" />
            <path d="M155 265h110l-14 32h-82l-14-32Z" fill="rgba(0,0,0,.06)" />
          </>
        ) : (
          <>
            <path
              filter={`url(#rules-shadow-${item.id})`}
              d="M145 52c17 17 38 25 65 25s48-8 65-25l77 34 43 75-57 36-31-35v137H113V162l-31 35-57-36 43-75 77-34Z"
              fill={`url(#rules-fabric-${item.id})`}
              stroke="rgba(255,255,255,.18)"
              strokeWidth="2"
            />
            <path d="M167 57c7 18 22 27 43 27s36-9 43-27" fill="none" stroke="rgba(0,0,0,.15)" strokeWidth="7" strokeLinecap="round" />
          </>
        )}

        <CampaignPrint ink={item.ink} secondary={item.secondary} />
      </svg>

      <div className="rules-brand-chip" title="Official Storm And Me mark">
        <img src={ASSETS.logo} alt="Storm And Me official logo" loading="lazy" />
      </div>
    </div>
  );
}

function RulesCard({ item }) {
  return (
    <a className="rules-card" href={SHOP_URL} target="_blank" rel="noreferrer" aria-label={`Preview ${item.title} in the official Storm And Me shop`}>
      <div className="rules-card-top">
        <span className="rules-preview-badge">Collection preview</span>
        <RulesMockup item={item} />
      </div>
      <div className="rules-card-copy">
        <span>{item.label}</span>
        <h4>{item.title}</h4>
        <p>Official Storm And Me branding. Satirical statement design.</p>
        <strong>Preview collection <ArrowUpRight size={15} aria-hidden="true" /></strong>
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
        .sam-store h2 { margin:0; max-width:760px; font-family:Georgia,"Times New Roman",serif; font-size:clamp(35px,5vw,60px); line-height:.98; letter-spacing:-.035em; }
        .sam-intro { max-width:650px; margin:15px 0 0; color:rgba(248,244,236,.68); font-size:16px; line-height:1.62; }
        .sam-shop,.sam-shop-bottom,.rules-cta { display:inline-flex; align-items:center; justify-content:center; gap:9px; min-height:48px; padding:0 21px; border:1px solid rgba(215,180,97,.55); border-radius:999px; background:#d7b461; color:#10141b; font-size:14px; font-weight:800; text-decoration:none; transition:transform 180ms ease,box-shadow 180ms ease,background 180ms ease; }
        .sam-shop:hover,.sam-shop-bottom:hover,.rules-cta:hover { transform:translateY(-2px); background:#e6ca7c; box-shadow:0 12px 28px rgba(0,0,0,.24); }

        .rules-shell { position:relative; overflow:hidden; margin:34px 0 42px; border:1px solid rgba(255,255,255,.13); border-radius:26px; background:linear-gradient(135deg,#f4efe3 0%,#eee5d5 52%,#d9e0ea 100%); color:#101a2c; box-shadow:0 28px 70px rgba(0,0,0,.27); }
        .rules-shell::before { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 12% 0%,rgba(181,42,47,.13),transparent 32%),radial-gradient(circle at 88% 8%,rgba(17,38,74,.14),transparent 34%); }
        .rules-hero { position:relative; display:grid; grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr); gap:28px; align-items:center; padding:38px 40px 24px; }
        .rules-overline { margin:0 0 10px; color:#b52a2f; font-size:11px; font-weight:900; letter-spacing:.19em; text-transform:uppercase; }
        .rules-hero h3 { margin:0; max-width:720px; font-family:Arial Black,Arial,sans-serif; font-size:clamp(36px,5vw,68px); line-height:.9; letter-spacing:-.045em; color:#11264a; }
        .rules-hero-copy { margin:16px 0 0; max-width:690px; color:rgba(16,26,44,.72); font-size:16px; line-height:1.6; }
        .rules-disclaimer { margin:12px 0 0; font-size:12px; color:rgba(16,26,44,.55); }
        .rules-logo-panel { justify-self:end; display:flex; flex-direction:column; align-items:center; gap:10px; width:min(250px,100%); padding:22px; border:1px solid rgba(17,38,74,.12); border-radius:22px; background:rgba(255,255,255,.52); box-shadow:inset 0 1px 0 rgba(255,255,255,.6); backdrop-filter:blur(10px); }
        .rules-logo-panel img { width:min(180px,100%); height:auto; object-fit:contain; filter:drop-shadow(0 8px 18px rgba(17,38,74,.18)); }
        .rules-logo-panel span { color:rgba(17,38,74,.7); font-size:10px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; text-align:center; }
        .rules-grid { position:relative; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; padding:18px 22px 24px; }
        .rules-card { overflow:hidden; min-width:0; border:1px solid rgba(17,38,74,.13); border-radius:18px; background:rgba(255,255,255,.72); color:#101a2c; text-decoration:none; box-shadow:0 14px 32px rgba(17,38,74,.12); transition:transform 180ms ease,box-shadow 180ms ease,border-color 180ms ease; }
        .rules-card:hover { transform:translateY(-5px); border-color:rgba(181,42,47,.34); box-shadow:0 20px 42px rgba(17,38,74,.18); }
        .rules-card-top { position:relative; min-height:300px; display:grid; place-items:center; overflow:hidden; background:radial-gradient(circle at 50% 20%,#fff 0%,#dfe5ec 58%,#aab7c8 100%); }
        .rules-preview-badge { position:absolute; z-index:3; top:12px; left:12px; padding:6px 9px; border-radius:999px; background:#11264a; color:#fff; font-size:8px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
        .rules-mockup { position:relative; width:100%; height:100%; display:grid; place-items:center; }
        .rules-garment { width:96%; height:96%; transition:transform 220ms ease; }
        .rules-card:hover .rules-garment { transform:scale(1.035); }
        .rules-brand-chip { position:absolute; right:16px; bottom:14px; width:48px; height:48px; display:grid; place-items:center; overflow:hidden; padding:4px; border:1px solid rgba(255,255,255,.8); border-radius:50%; background:rgba(8,17,31,.9); box-shadow:0 8px 18px rgba(6,16,31,.24); }
        .rules-brand-chip img { width:100%; height:100%; object-fit:contain; }
        .rules-card-copy { padding:16px 16px 18px; }
        .rules-card-copy > span { color:#b52a2f; font-size:9px; font-weight:900; letter-spacing:.15em; text-transform:uppercase; }
        .rules-card-copy h4 { margin:6px 0 8px; font-family:Georgia,"Times New Roman",serif; font-size:18px; line-height:1.25; }
        .rules-card-copy p { margin:0; color:rgba(16,26,44,.62); font-size:12px; line-height:1.5; }
        .rules-card-copy strong { display:inline-flex; align-items:center; gap:5px; margin-top:13px; color:#11264a; font-size:12px; }
        .rules-footer { position:relative; display:flex; align-items:center; justify-content:space-between; gap:18px; padding:0 40px 34px; }
        .rules-footer p { margin:0; color:rgba(16,26,44,.6); font-size:12px; line-height:1.5; }

        .sam-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
        .sam-card { overflow:hidden; min-width:0; border:1px solid rgba(255,255,255,.13); border-radius:17px; background:rgba(9,14,22,.9); color:inherit; text-decoration:none; box-shadow:0 18px 48px rgba(0,0,0,.23); transition:transform 180ms ease,border-color 180ms ease,box-shadow 180ms ease; }
        .sam-card:hover { transform:translateY(-6px); border-color:rgba(120,169,255,.52); box-shadow:0 24px 58px rgba(0,0,0,.34); }
        .sam-image { position:relative; display:grid; place-items:center; aspect-ratio:1/1; overflow:hidden; border-bottom:1px solid rgba(215,180,97,.3); background:radial-gradient(circle at 72% 16%,rgba(120,169,255,.55),transparent 25%),radial-gradient(circle at 48% 40%,rgba(245,248,252,.92) 0%,rgba(190,203,220,.84) 48%,rgba(41,57,79,.96) 100%),linear-gradient(145deg,#172436,#526885 58%,#090f18); }
        .sam-badge { position:absolute; z-index:3; top:13px; left:13px; padding:6px 9px; border-radius:999px; background:rgba(255,255,255,.8); color:#17202a; font-size:9px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
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

        @media (max-width:900px) {
          .rules-hero { grid-template-columns:1fr; }
          .rules-logo-panel { justify-self:start; width:210px; }
          .rules-grid { grid-template-columns:1fr 1fr; }
          .rules-card:last-child { grid-column:1/-1; width:min(50%,420px); justify-self:center; }
        }
        @media (max-width:720px) {
          .sam-store { width:min(100% - 24px,560px); padding:52px 0 64px; }
          .sam-head { grid-template-columns:1fr; margin-bottom:24px; }
          .sam-head .sam-shop { display:none; }
          .sam-bottom-wrap { display:flex; }
          .rules-hero { padding:30px 24px 18px; }
          .rules-grid { grid-template-columns:1fr; padding:14px; }
          .rules-card:last-child { grid-column:auto; width:100%; }
          .rules-footer { flex-direction:column; align-items:flex-start; padding:4px 24px 28px; }
        }
        @media (max-width:540px) {
          .sam-grid { grid-template-columns:1fr; }
          .rules-card-top { min-height:280px; }
        }
        @media (prefers-reduced-motion:reduce) {
          .sam-card,.sam-product-photo,.sam-shop,.sam-shop-bottom,.rules-card,.rules-garment,.rules-cta { transition:none; }
        }
      `}</style>

      <div className="sam-head">
        <div>
          <p className="sam-eyebrow"><ShoppingBag size={15} aria-hidden="true" /> Official Storm And Me products</p>
          <h2 id="sam-store-title">Wear what you survived. Wear what made you laugh.</h2>
          <p className="sam-intro">Meaningful pieces, statement pieces, and the kind of shirt that makes somebody in the checkout line read it twice.</p>
        </div>
        <a className="sam-shop" href={SHOP_URL} target="_blank" rel="noreferrer">Shop all products <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>

      <section className="rules-shell" data-testid="rules-dont-exist-collection" aria-labelledby="rules-collection-title">
        <div className="rules-hero">
          <div>
            <p className="rules-overline">New satirical statement collection</p>
            <h3 id="rules-collection-title">RULES DON’T EXIST ANYMORE</h3>
            <p className="rules-hero-copy">The straight-face joke: <strong>OBAMA 2028</strong> up top, then the line that makes the whole thing hit. Built as a bold back print with the official Storm And Me mark kept clean and intentional.</p>
            <p className="rules-disclaimer">Satirical apparel concept. Not affiliated with, endorsed by, or connected to any political campaign.</p>
          </div>
          <div className="rules-logo-panel">
            <img src={ASSETS.logo} alt="Storm And Me official logo" loading="lazy" />
            <span>Official Storm And Me brand mark</span>
          </div>
        </div>

        <div className="rules-grid">
          {RULES_DONT_EXIST_PRODUCTS.map((item) => <RulesCard key={item.id} item={item} />)}
        </div>

        <div className="rules-footer">
          <p>Collection preview is live here first. Product checkout remains inside the official Storm And Me Printify storefront.</p>
          <a className="rules-cta" href={SHOP_URL} target="_blank" rel="noreferrer">Visit official shop <ArrowUpRight size={16} aria-hidden="true" /></a>
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
