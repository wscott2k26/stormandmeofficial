import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { BRAND } from "../lib/assets";
import PageHero from "../components/PageHero";
import { GlowButton, Overline } from "../components/shared";

export default function Store() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const destination = query
    ? `${BRAND.shop}/search?q=${encodeURIComponent(query)}`
    : BRAND.shop;

  useEffect(() => {
    const timer = window.setTimeout(() => window.location.replace(destination), 350);
    return () => window.clearTimeout(timer);
  }, [destination]);

  return (
    <div>
      <PageHero
        overline="The Storm Collection"
        title="Opening the Official Store"
        subtitle="Real products, secure Shopify checkout, and Printify fulfillment all live at the official Storm & Me shop."
      />
      <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
        <div className="wet-glass rounded-3xl border border-white/10 p-9 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ShoppingBag className="h-8 w-8 text-storm-blue" />
          </div>
          <Overline className="mt-7 mb-4">Secure shopping through Shopify</Overline>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">The store is opening now.</h2>
          <p className="mx-auto mt-5 max-w-xl text-storm-silver/70 leading-relaxed font-light">
            Choose your size and color, add items to the cart, and complete payment through the official Shopify store. Printify handles production and fulfillment for connected merchandise.
          </p>
          <div className="mt-8">
            <GlowButton href={destination} data-testid="open-official-shop">
              Open the Official Shop <ExternalLink className="h-4 w-4" />
            </GlowButton>
          </div>
        </div>
      </section>
    </div>
  );
}