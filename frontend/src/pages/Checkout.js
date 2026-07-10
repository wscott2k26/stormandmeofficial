import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Tag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { createCheckout } from "../lib/api";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const SHIPPING = { standard: 5.99, express: 14.99, digital: 0.0 };
const COUPONS = { STORM10: 0.1, STILLHERE: 0.15 };
const TAX_RATE = 0.08;

export default function Checkout() {
  const { items, subtotal } = useCart();
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [shipping, setShipping] = useState("standard");
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div>
        <PageHero overline="Checkout" title="Your Cart Is Empty" />
        <div className="max-w-3xl mx-auto px-6 pb-32 text-center">
          <GlowButton to="/shop" data-testid="checkout-shop">Shop the Collection</GlowButton>
        </div>
      </div>
    );
  }

  const discountRate = COUPONS[appliedCoupon.toUpperCase()] || 0;
  const discount = +(subtotal * discountRate).toFixed(2);
  const taxedBase = Math.max(0, subtotal - discount);
  const tax = +(taxedBase * TAX_RATE).toFixed(2);
  const ship = SHIPPING[shipping];
  const total = +(taxedBase + tax + ship).toFixed(2);

  const applyCoupon = () => {
    if (COUPONS[coupon.toUpperCase()]) { setAppliedCoupon(coupon); toast.success(`Coupon applied: ${(COUPONS[coupon.toUpperCase()] * 100)}% off`); }
    else toast.error("Invalid coupon code");
  };

  const pay = async () => {
    if (!email) { toast.error("Please enter your email for the receipt"); return; }
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ id: i.id, type: i.type, quantity: i.quantity, size: i.size, color: i.color, format: i.format })),
        origin_url: window.location.origin,
        coupon: appliedCoupon || null,
        email,
        shipping,
      };
      const res = await createCheckout(payload);
      if (res.url) window.location.href = res.url;
      else throw new Error("No checkout URL");
    } catch { toast.error("Could not start checkout. Please try again."); setLoading(false); }
  };

  return (
    <div>
      <PageHero overline="Secure Checkout" title="Almost There" />
      <section className="max-w-6xl mx-auto px-6 pb-24 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-storm-silver/60 hover:text-white"><ArrowLeft className="w-4 h-4" /> Back to cart</Link>
          <div className="glass rounded-2xl p-8 space-y-5" data-testid="checkout-form">
            <div>
              <label className="text-xs tracking-widest uppercase text-storm-silver/50">Email (for your receipt)</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="checkout-email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-storm-silver/50">Shipping method</label>
              <Select value={shipping} onValueChange={setShipping}>
                <SelectTrigger className="mt-2 bg-black/40 border-white/15 text-white" data-testid="checkout-shipping"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="standard" data-testid="ship-standard">Standard (3–5 days) — $5.99</SelectItem>
                  <SelectItem value="express" data-testid="ship-express">Express (1–2 days) — $14.99</SelectItem>
                  <SelectItem value="digital" data-testid="ship-digital">Digital delivery only — Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-storm-silver/50">Coupon code</label>
              <div className="mt-2 flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} data-testid="checkout-coupon"
                  placeholder="Try STORM10"
                  className="flex-1 rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" />
                <GlowButton onClick={applyCoupon} variant="secondary" data-testid="checkout-apply-coupon"><Tag className="w-4 h-4" /> Apply</GlowButton>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="glass rounded-2xl p-6 sticky top-24" data-testid="checkout-summary">
            <h3 className="font-display text-xl font-bold text-white">Order Summary</h3>
            <div className="mt-4 space-y-2 max-h-48 overflow-auto">
              {items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-sm text-storm-silver/70">
                  <span className="truncate pr-2">{i.name} × {i.quantity}</span>
                  <span className="text-white">${((i.unitPrice || 0) * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-storm-silver/70"><span>Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-storm-gold"><span>Discount ({appliedCoupon.toUpperCase()})</span><span>−${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-storm-silver/70"><span>Tax (8%)</span><span className="text-white">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-storm-silver/70"><span>Shipping</span><span className="text-white">${ship.toFixed(2)}</span></div>
            </div>
            <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-white font-bold text-xl" data-testid="checkout-total">${total.toFixed(2)}</span>
            </div>
            <GlowButton onClick={pay} className="w-full mt-6" data-testid="checkout-pay">{loading ? "Redirecting..." : "Pay Securely"} <Lock className="w-4 h-4" /></GlowButton>
            <p className="text-[11px] text-storm-silver/40 text-center mt-3 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Secured by Stripe</p>
          </div>
        </div>
      </section>
    </div>
  );
}
