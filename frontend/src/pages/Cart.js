import React, { useEffect } from "react";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { BRAND } from "../lib/assets";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";

export default function Cart() {
  const destination = BRAND.shop;

  useEffect(() => {
    const timer = window.setTimeout(() => window.location.replace(destination), 350);
    return () => window.clearTimeout(timer);
  }, [destination]);

  return (
    <div>
      <PageHero overline="Official Store" title="Opening Your Live Store" subtitle="Your merchandise cart and secure checkout are handled in the official Storm & Me Printify storefront." />
      <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
        <div className="wet-glass rounded-3xl border border-white/10 p-9 sm:p-12">
          <ShoppingBag className="mx-auto h-10 w-10 text-storm-blue" />
          <p className="mt-5 text-storm-silver/70">Taking you to the live collection, where you can review products and complete your purchase securely.</p>
          <div className="mt-8"><GlowButton href={destination}>Open Store <ExternalLink className="h-4 w-4" /></GlowButton></div>
        </div>
      </section>
    </div>
  );
}
