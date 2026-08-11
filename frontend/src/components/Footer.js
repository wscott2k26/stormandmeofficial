import React from "react";
import { Link } from "react-router-dom";
import { ASSETS, BRAND } from "../lib/assets";
import { SocialIcons } from "./shared";

const COLS = [
  { title: "Explore", links: [["Books", "/books"], ["Music", "/music"], ["Videos", "/videos"], ["Shop", "/shop"]] },
  { title: "Discover", links: [["Projects", "/projects"], ["About", "/about"], ["The Story", "/story"], ["News", "/news"]] },
  { title: "Support", links: [["FAQ", "/faq"], ["Shipping Policy", "/shipping"], ["Returns & Refunds", "/returns"], ["Accessibility", "/accessibility"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms & Conditions", "/terms"], ["Contact", "/contact"], ["Official Store", "/shop"]] },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 glass-strong" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <img src={ASSETS.logo} alt="STORM & ME OFFICIAL" className="h-12 w-12 object-contain" />
              <div className="leading-none">
                <div className="font-display text-base font-bold tracking-[0.15em] text-white">STORM &amp; ME OFFICIAL</div>
                <div className="text-[10px] tracking-[0.35em] text-storm-blue/80 mt-1">{BRAND.domain}</div>
              </div>
            </Link>
            <p className="text-storm-silver/60 text-sm leading-relaxed max-w-xs font-light">
              Books. Music. Stories. Useful projects. Proof that the storm does not get the final word.
            </p>
            <div className="mt-6"><SocialIcons /></div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-sm font-semibold tracking-widest uppercase text-white/90 mb-4">{c.title}</h4>
              <ul className="space-y-3">
                {c.links.map(([label, to]) => (
                  <li key={`${label}-${to}`}>
                    <Link to={to} className="text-sm text-storm-silver/60 hover:text-storm-blue transition-colors" data-testid={`footer-link-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-storm-silver/50 text-center sm:text-left">© 2026 Storm And Me LLC. All rights reserved. StormAndMeOfficial.com is owned and operated by Storm And Me LLC.</p>
          <p className="font-display italic text-sm text-storm-gold/80">"{BRAND.line}"</p>
        </div>
        <p className="mt-5 text-center text-[10px] leading-relaxed text-storm-silver/35">
          Ambient piano: “Gymnopédie No. 1” by Kevin MacLeod, based on the composition by Erik Satie. Used under the{" "}
          <a
            href="https://incompetech.com/music/royalty-free/licenses/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-storm-silver/60"
          >
            Creative Commons attribution license
          </a>.
        </p>
      </div>
    </footer>
  );
}
