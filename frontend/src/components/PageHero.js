import React from "react";
import { Overline } from "./shared";

export default function PageHero({ overline, title, subtitle, children }) {
  return (
    <section className="relative pt-36 pb-12 sm:pb-16" data-testid="page-hero">
      <div className="absolute inset-0 -z-0 bg-gradient-to-b from-storm-blue/5 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6">
        {overline && <Overline className="mb-4">{overline}</Overline>}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.03] tracking-tight max-w-4xl">{title}</h1>
        {subtitle && <p className="mt-5 text-storm-silver/70 text-base sm:text-lg max-w-2xl leading-relaxed font-light">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
