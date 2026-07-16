import React, { useEffect } from "react";
import { User, ExternalLink } from "lucide-react";
import { BRAND } from "../lib/assets";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";

export default function Account() {
  const destination = `${BRAND.shop}/account`;

  useEffect(() => {
    const timer = window.setTimeout(() => window.location.replace(destination), 350);
    return () => window.clearTimeout(timer);
  }, [destination]);

  return (
    <div>
      <PageHero overline="Customer Account" title="Opening Your Shopify Account" subtitle="Order history, addresses, customer details, and store access are managed securely by Shopify." />
      <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
        <div className="wet-glass rounded-3xl border border-white/10 p-9 sm:p-12">
          <User className="mx-auto h-10 w-10 text-storm-blue" />
          <p className="mt-5 text-storm-silver/70">Taking you to the official Storm & Me customer account.</p>
          <div className="mt-8"><GlowButton href={destination}>Open My Account <ExternalLink className="h-4 w-4" /></GlowButton></div>
        </div>
      </section>
    </div>
  );
}