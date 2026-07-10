import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle, Package } from "lucide-react";
import { getCheckoutStatus } from "../lib/api";
import { useCart } from "../context/CartContext";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clearCart } = useCart();
  const [state, setState] = useState("checking"); // checking | success | failed | timeout
  const [order, setOrder] = useState(null);
  const cleared = useRef(false);

  useEffect(() => {
    if (!sessionId) { setState("failed"); return; }
    let attempts = 0;
    const poll = async () => {
      try {
        const data = await getCheckoutStatus(sessionId);
        setOrder(data.order);
        if (data.payment_status === "paid") {
          setState("success");
          if (!cleared.current) { clearCart(); cleared.current = true; }
          return;
        }
        if (data.status === "expired") { setState("failed"); return; }
        if (attempts >= 6) { setState("timeout"); return; }
        attempts += 1;
        setTimeout(poll, 2000);
      } catch {
        if (attempts >= 6) { setState("timeout"); return; }
        attempts += 1;
        setTimeout(poll, 2000);
      }
    };
    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div>
      <PageHero overline="Order" title={state === "success" ? "Thank You" : "Your Order"} />
      <section className="max-w-2xl mx-auto px-6 pb-32">
        <div className="glass rounded-3xl p-10 text-center" data-testid="order-confirmation">
          {state === "checking" && (
            <><Loader2 className="w-14 h-14 text-storm-blue mx-auto animate-spin" />
              <h2 className="font-display text-2xl font-bold text-white mt-5">Confirming your payment...</h2>
              <p className="text-storm-silver/60 mt-2 font-light">Hang tight, this only takes a moment.</p></>
          )}
          {state === "success" && (
            <><CheckCircle2 className="w-16 h-16 text-storm-blue mx-auto" data-testid="order-success-icon" />
              <h2 className="font-display text-3xl font-bold text-white mt-5">Payment Successful</h2>
              <p className="text-storm-silver/70 mt-3 font-light">Welcome to the family. A confirmation and receipt are on the way to your email.</p>
              {order && (
                <div className="mt-8 text-left glass rounded-2xl p-6">
                  <p className="flex items-center gap-2 text-white font-medium"><Package className="w-4 h-4 text-storm-blue" /> Order details</p>
                  <div className="mt-4 space-y-2 text-sm">
                    {order.items?.map((i, idx) => (<div key={idx} className="flex justify-between text-storm-silver/70"><span>Item × {i.quantity}</span></div>))}
                    <div className="border-t border-white/10 pt-3 flex justify-between text-white font-semibold"><span>Total paid</span><span>${order.amount?.toFixed(2)}</span></div>
                    <p className="text-xs text-storm-silver/40 mt-2">Order ref: {order.session_id?.slice(-12)}</p>
                  </div>
                </div>
              )}
              <div className="mt-8 flex justify-center gap-3">
                <GlowButton to="/shop" data-testid="order-keep-shopping">Keep Shopping</GlowButton>
                <GlowButton to="/" variant="secondary" data-testid="order-home">Back Home</GlowButton>
              </div></>
          )}
          {(state === "failed" || state === "timeout") && (
            <><XCircle className="w-16 h-16 text-red-400 mx-auto" />
              <h2 className="font-display text-2xl font-bold text-white mt-5">{state === "timeout" ? "Still Processing" : "Payment Not Completed"}</h2>
              <p className="text-storm-silver/70 mt-3 font-light">{state === "timeout" ? "Your payment is taking longer than expected. Check your email for confirmation, or contact us." : "It looks like the payment was cancelled or didn't go through."}</p>
              <div className="mt-8 flex justify-center gap-3">
                <GlowButton to="/cart" data-testid="order-retry">Return to Cart</GlowButton>
                <GlowButton to="/contact" variant="secondary" data-testid="order-contact">Contact Support</GlowButton>
              </div></>
          )}
        </div>
      </section>
    </div>
  );
}
