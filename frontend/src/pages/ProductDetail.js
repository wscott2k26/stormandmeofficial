import React, { useEffect } from "react";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { BRAND } from "../lib/assets";
import PageHero from "../components/PageHero";
import { GlowButton, Overline } from "../components/shared";

export default function ProductDetail() {
  useEffect(() => {
    const timer = window.setTimeout(() => window.location.replace(BRAND.shop), 350);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div>
      <PageHero
        overline="Official Merchandise"
        title="Opening the Shopify Product Catalog"
        subtitle="Product photos, pricing, sizes, colors, inventory, secure checkout, and order fulfillment are managed in the official store."
      />
      <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
        <div className="wet-glass rounded-3xl border border-white/10 p-9 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ShoppingBag className="h-8 w-8 text-storm-blue" />
          </div>
          <Overline className="mt-7 mb-4">Powered by Shopify and Printify</Overline>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Taking you to the real product page.</h2>
          <p className="mx-auto mt-5 max-w-xl text-storm-silver/70 leading-relaxed font-light">
            The official store is the source of truth for available products and secure purchases.
          </p>
          <div className="mt-8">
            <GlowButton href={BRAND.shop} data-testid="open-shopify-products">
              Browse Merchandise <ExternalLink className="h-4 w-4" />
            </GlowButton>
          </div>
        </div>
      </section>
    </div>
  );
}