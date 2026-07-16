import React, { useEffect } from "react";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { BRAND } from "../lib/assets";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";

export default function Cart() {
  const destination = `${BRAND.shop}/cart`;

  useEffect(() => {
    const timer = window.setTimeout(() => window.location.replace(destination), 350);
    return () => window.clearTimeout(timer);
  }, [destination]);

  return (
    <div>
      <PageHero overline="Official Store" title="Opening Your Shopify Cart" subtitle="Your real merchandise cart and secure checkout live in the official Storm & Me store." />
      <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
        <div className="wet-glass rounded-3xl border border-white/10 p-9 sm:p-12">
          <ShoppingBag className="mx-auto h-10 w-10 text-storm-blue" />
          <p className="mt-5 text-storm-silver/70">Taking you to the secure Shopify cart.</p>
          <div className="mt-8"><GlowButton href={destination}>Open Cart <ExternalLink className="h-4 w-4" /></GlowButton></div>
        </div>
      </section>
    </div>
  );
}