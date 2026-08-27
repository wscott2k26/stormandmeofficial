import React, { useEffect, useMemo } from "react";
import { ArrowUpRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";

const PRODUCT_URL = "https://storm-and-me-official.printify.me/product/31143739";
const PRODUCT_IMAGE_FRONT =
  "https://images-api.printify.com/mockup/6a876990aa9cea471b08e022/79048/98445/broken-pieces-still-breathing-streetwear-tee.jpg?camera_label=front";
const PRODUCT_IMAGE_BACK =
  "https://images-api.printify.com/mockup/6a876990aa9cea471b08e022/79048/98445/broken-pieces-still-breathing-streetwear-tee.jpg?camera_label=back";

function buildTrackedProductUrl() {
  if (typeof window === "undefined") return PRODUCT_URL;

  const incoming = new URLSearchParams(window.location.search);
  const outgoing = new URLSearchParams();

  outgoing.set("utm_source", incoming.get("utm_source") || "stormandmeofficial");
  outgoing.set("utm_medium", incoming.get("utm_medium") || "referral");
  outgoing.set("utm_campaign", incoming.get("utm_campaign") || "broken_pieces_launch");
  outgoing.set("utm_content", incoming.get("utm_content") || "still_breathing_landing");

  const term = incoming.get("utm_term");
  if (term) outgoing.set("utm_term", term);

  return `${PRODUCT_URL}?${outgoing.toString()}`;
}

export default function StillBreathingLanding() {
  const trackedProductUrl = useMemo(() => buildTrackedProductUrl(), []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Broken Pieces — Still Breathing | Storm And Me";

    let meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content");

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute(
      "content",
      "Broken Pieces — Still Breathing by Storm And Me. Wear what you survived."
    );

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null && previousDescription !== undefined) {
        meta.setAttribute("content", previousDescription);
      }
    };
  }, []);

  const trackShopClick = () => {
    if (typeof window === "undefined") return;

    if (typeof window.gtag === "function") {
      window.gtag("event", "select_item", {
        item_list_name: "Broken Pieces Launch",
        item_name: "Still Breathing Streetwear Tee",
      });
    }

    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", "StillBreathingShopClick", {
        product: "Still Breathing Streetwear Tee",
      });
    }
  };

  return (
    <main className="sb-page">
      <style>{`
        .sb-page {
          --sb-bg: #090b10;
          --sb-panel: rgba(18, 22, 30, .86);
          --sb-line: rgba(215, 180, 97, .24);
          --sb-gold: #d7b461;
          --sb-cream: #f7f1e5;
          --sb-muted: rgba(247, 241, 229, .67);
          min-height: 100vh;
          color: var(--sb-cream);
          background:
            radial-gradient(circle at 18% 8%, rgba(71, 105, 160, .19), transparent 30%),
            radial-gradient(circle at 82% 13%, rgba(215, 180, 97, .12), transparent 28%),
            linear-gradient(155deg, #0c1018 0%, #090a0d 56%, #040506 100%);
          overflow: hidden;
        }
        .sb-page * { box-sizing: border-box; }
        .sb-wrap { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 54px 0 80px; }
        .sb-kicker {
          display: inline-flex; align-items: center; gap: 9px;
          color: var(--sb-gold); font-size: 11px; font-weight: 900;
          letter-spacing: .18em; text-transform: uppercase;
        }
        .sb-hero {
          display: grid; grid-template-columns: minmax(0, .9fr) minmax(320px, 1.1fr);
          gap: 44px; align-items: center; margin-top: 20px;
          padding: 38px; border: 1px solid var(--sb-line); border-radius: 30px;
          background: linear-gradient(135deg, rgba(255,255,255,.045), rgba(255,255,255,.015));
          box-shadow: 0 32px 90px rgba(0,0,0,.42);
          backdrop-filter: blur(18px);
        }
        .sb-copy h1 {
          margin: 14px 0 0; font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(48px, 8vw, 92px); line-height: .88;
          letter-spacing: -.055em; font-weight: 700;
        }
        .sb-copy h1 span { display: block; color: var(--sb-gold); }
        .sb-lead {
          max-width: 610px; margin: 22px 0 0; color: var(--sb-muted);
          font-size: clamp(17px, 2vw, 20px); line-height: 1.65;
        }
        .sb-quote {
          margin: 22px 0 0; padding-left: 16px; border-left: 2px solid var(--sb-gold);
          color: rgba(247,241,229,.9); font-size: 14px; line-height: 1.55;
        }
        .sb-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
        .sb-buy, .sb-secondary {
          display: inline-flex; align-items: center; justify-content: center; gap: 9px;
          min-height: 52px; padding: 0 23px; border-radius: 999px;
          font-size: 14px; font-weight: 900; text-decoration: none;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }
        .sb-buy { background: var(--sb-gold); color: #111317; }
        .sb-buy:hover { transform: translateY(-2px); background: #e7ca82; box-shadow: 0 15px 32px rgba(0,0,0,.3); }
        .sb-secondary { border: 1px solid rgba(247,241,229,.18); color: var(--sb-cream); background: rgba(255,255,255,.035); }
        .sb-secondary:hover { transform: translateY(-2px); border-color: rgba(215,180,97,.5); }
        .sb-trust {
          display: flex; flex-wrap: wrap; gap: 12px 18px; margin-top: 22px;
          color: rgba(247,241,229,.58); font-size: 11px; font-weight: 800;
          text-transform: uppercase; letter-spacing: .08em;
        }
        .sb-trust span { display: inline-flex; align-items: center; gap: 7px; }
        .sb-product-stage {
          position: relative; min-height: 610px; display: grid; place-items: center;
        }
        .sb-product-stage::before {
          content: ""; position: absolute; width: 70%; aspect-ratio: 1;
          border-radius: 50%; background: radial-gradient(circle, rgba(82,125,194,.25), transparent 65%);
          filter: blur(12px);
        }
        .sb-product-grid {
          position: relative; z-index: 2; display: grid; grid-template-columns: 1.08fr .92fr;
          gap: 13px; width: 100%;
        }
        .sb-product-card {
          position: relative; overflow: hidden; border-radius: 24px;
          border: 1px solid rgba(255,255,255,.13); background: #e9e8e5;
          box-shadow: 0 24px 62px rgba(0,0,0,.35);
        }
        .sb-product-card:first-child { transform: translateY(-10px); }
        .sb-product-card:last-child { transform: translateY(34px); }
        .sb-product-card img { display: block; width: 100%; aspect-ratio: 1 / 1.12; object-fit: cover; }
        .sb-image-label {
          position: absolute; top: 14px; left: 14px; padding: 7px 10px;
          border-radius: 999px; background: rgba(9,11,16,.84); color: #fff;
          font-size: 9px; font-weight: 900; letter-spacing: .13em; text-transform: uppercase;
        }
        .sb-price-chip {
          position: absolute; right: 14px; bottom: 14px; padding: 9px 12px;
          border-radius: 999px; background: var(--sb-gold); color: #111317;
          font-size: 13px; font-weight: 900;
        }
        .sb-section { padding: 68px 0 0; }
        .sb-section-head { max-width: 720px; }
        .sb-section-head h2 {
          margin: 10px 0 0; font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(34px, 5vw, 58px); line-height: 1; letter-spacing: -.035em;
        }
        .sb-section-head p { margin: 15px 0 0; color: var(--sb-muted); line-height: 1.65; }
        .sb-reasons { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 26px; }
        .sb-reason {
          min-height: 190px; padding: 24px; border: 1px solid rgba(255,255,255,.1);
          border-radius: 22px; background: var(--sb-panel);
        }
        .sb-reason svg { color: var(--sb-gold); }
        .sb-reason h3 { margin: 18px 0 8px; font-size: 18px; }
        .sb-reason p { margin: 0; color: var(--sb-muted); font-size: 14px; line-height: 1.6; }
        .sb-final {
          margin-top: 58px; padding: 34px; border-radius: 26px; text-align: center;
          border: 1px solid var(--sb-line);
          background: linear-gradient(135deg, rgba(215,180,97,.11), rgba(79,115,177,.09));
        }
        .sb-final h2 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(30px, 4vw, 48px); }
        .sb-final p { margin: 12px auto 22px; max-width: 650px; color: var(--sb-muted); line-height: 1.6; }
        .sb-fineprint { margin-top: 18px; color: rgba(247,241,229,.43); font-size: 11px; line-height: 1.5; }
        @media (max-width: 900px) {
          .sb-hero { grid-template-columns: 1fr; padding: 28px; }
          .sb-product-stage { min-height: 0; }
          .sb-product-grid { max-width: 650px; margin: 8px auto 22px; }
          .sb-reasons { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .sb-wrap { width: min(100% - 22px, 520px); padding-top: 30px; }
          .sb-hero { padding: 20px; border-radius: 24px; }
          .sb-product-grid { grid-template-columns: 1fr; }
          .sb-product-card:first-child, .sb-product-card:last-child { transform: none; }
          .sb-product-card:last-child { display: none; }
          .sb-actions { flex-direction: column; }
          .sb-buy, .sb-secondary { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-buy, .sb-secondary { transition: none; }
        }
      `}</style>

      <div className="sb-wrap">
        <section className="sb-hero">
          <div className="sb-copy">
            <div className="sb-kicker"><Sparkles size={15} aria-hidden="true" /> Broken Pieces Collection</div>
            <h1>BROKEN PIECES.<span>STILL BREATHING.</span></h1>
            <p className="sb-lead">
              Not a shirt for perfect seasons. A wearable reminder for the people who got hit,
              got tired, got changed — and kept going.
            </p>
            <p className="sb-quote">“The storm does not get the final word.” — Storm And Me</p>

            <div className="sb-actions">
              <a
                className="sb-buy"
                href={trackedProductUrl}
                target="_blank"
                rel="noreferrer"
                onClick={trackShopClick}
              >
                Shop the tee — $35.99 <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <a className="sb-secondary" href="/#merch">See the full collection</a>
            </div>

            <div className="sb-trust">
              <span><BadgeCheck size={15} aria-hidden="true" /> Official Storm And Me</span>
              <span><ShieldCheck size={15} aria-hidden="true" /> Secure Printify checkout</span>
            </div>
          </div>

          <div className="sb-product-stage" aria-label="Still Breathing product mockups">
            <div className="sb-product-grid">
              <figure className="sb-product-card">
                <span className="sb-image-label">Front</span>
                <img src={PRODUCT_IMAGE_FRONT} alt="Broken Pieces — Still Breathing Streetwear Tee front mockup" />
                <span className="sb-price-chip">$35.99</span>
              </figure>
              <figure className="sb-product-card">
                <span className="sb-image-label">Back</span>
                <img src={PRODUCT_IMAGE_BACK} alt="Broken Pieces — Still Breathing Streetwear Tee back mockup" loading="lazy" />
              </figure>
            </div>
          </div>
        </section>

        <section className="sb-section">
          <div className="sb-section-head">
            <div className="sb-kicker">Wear what you survived</div>
            <h2>The message is the point.</h2>
            <p>
              Broken Pieces is built around one idea: damage is part of the story, not the ending.
              Still Breathing is the loudest version of that message.
            </p>
          </div>

          <div className="sb-reasons">
            <article className="sb-reason">
              <Sparkles size={22} aria-hidden="true" />
              <h3>Made to be seen</h3>
              <p>Oversized distressed typography puts BROKEN PIECES first, then lands on the words that matter: STILL BREATHING.</p>
            </article>
            <article className="sb-reason">
              <BadgeCheck size={22} aria-hidden="true" />
              <h3>Storm And Me original</h3>
              <p>An official piece from the Broken Pieces collection — built around survival, rebuilding, and the courage to keep becoming.</p>
            </article>
            <article className="sb-reason">
              <ShieldCheck size={22} aria-hidden="true" />
              <h3>Official checkout</h3>
              <p>The purchase completes through the official Storm And Me Printify storefront for payment, production, and fulfillment.</p>
            </article>
          </div>
        </section>

        <section className="sb-final">
          <h2>If you are still breathing, the story is still moving.</h2>
          <p>One piece. One message. No complicated catalog decision. Start with the shirt that says exactly what the collection means.</p>
          <a
            className="sb-buy"
            href={trackedProductUrl}
            target="_blank"
            rel="noreferrer"
            onClick={trackShopClick}
          >
            Get Still Breathing <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <div className="sb-fineprint">Official Storm And Me merchandise. Product pricing and availability are controlled by the live Printify storefront.</div>
        </section>
      </div>
    </main>
  );
}
