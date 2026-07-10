import React, { useState } from "react";
import { Search, Package, User } from "lucide-react";
import { toast } from "sonner";
import { getCheckoutStatus } from "../lib/api";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";

export default function Account() {
  const [ref, setRef] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (e) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    try {
      const data = await getCheckoutStatus(ref.trim());
      if (data.order) { setOrder({ ...data.order, payment_status: data.payment_status }); }
      else { toast.error("No order found for that reference"); setOrder(null); }
    } catch { toast.error("Order not found. Check your reference and try again."); setOrder(null); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHero overline="Customer Account" title="Track Your Order"
        subtitle="Enter your order reference (session ID from your confirmation email) to view status and details." />
      <section className="max-w-2xl mx-auto px-6 pb-32">
        <form onSubmit={lookup} className="glass rounded-2xl p-6 flex gap-2" data-testid="account-lookup-form">
          <input value={ref} onChange={(e) => setRef(e.target.value)} data-testid="account-order-ref"
            placeholder="Order reference / session ID"
            className="flex-1 rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" />
          <GlowButton onClick={lookup} data-testid="account-lookup-btn">{loading ? "..." : <><Search className="w-4 h-4" /> Track</>}</GlowButton>
        </form>

        {order && (
          <div className="glass rounded-2xl p-8 mt-6" data-testid="account-order-result">
            <p className="flex items-center gap-2 text-white font-medium"><Package className="w-5 h-5 text-storm-blue" /> Order Status</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-storm-silver/70"><span>Status</span><span className={`font-semibold ${order.payment_status === "paid" ? "text-storm-blue" : "text-storm-gold"}`}>{order.payment_status === "paid" ? "Paid ✓" : (order.payment_status || "Pending")}</span></div>
              <div className="flex justify-between text-storm-silver/70"><span>Items</span><span className="text-white">{order.items?.reduce((s, i) => s + i.quantity, 0)}</span></div>
              <div className="flex justify-between text-storm-silver/70"><span>Total</span><span className="text-white">${order.amount?.toFixed(2)}</span></div>
              {order.email && <div className="flex justify-between text-storm-silver/70"><span>Email</span><span className="text-white">{order.email}</span></div>}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-8 mt-6 text-center">
          <User className="w-8 h-8 text-storm-silver/40 mx-auto" />
          <p className="text-storm-silver/60 mt-3 font-light text-sm">Full customer accounts with saved orders, wishlists, and one-click reorder are coming soon to the family.</p>
        </div>
      </section>
    </div>
  );
}
