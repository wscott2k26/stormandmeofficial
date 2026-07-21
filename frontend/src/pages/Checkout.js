import React, { useEffect } from "react";
import { Lock, ExternalLink } from "lucide-react";
import { BRAND } from "../lib/assets";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";

export default function Checkout() {
  const destination = BRAND.shop;

  useEffect(() => {
    const timer = window.setTimeout(() => window.location.replace(destination), 350);
    return () => window.clearTimeout(timer);
  }, [destination]);

  return (
    <div>
      <PageHero overline="Secure Checkout" title="Opening the Official Store" subtitle="Payments, shipping options, taxes, discounts, printing, and order fulfillment are handled securely through the live Storm & Me Printify storefront." />
      <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
        <div className="wet-glass rounded-3xl border border-white/10 p-9 sm:p-12">
          <Lock className="mx-auto h-10 w-10 text-storm-blue" />
          <p className="mt-5 text-storm-silver/70">Taking you to the official store to select products and complete payment securely.</p>
          <div className="mt-8"><GlowButton href={destination}>Continue Securely <ExternalLink className="h-4 w-4" /></GlowButton></div>
        </div>
      </section>
    </div>
  );
}
