import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import PageHero from "../components/PageHero";
import { GlowButton } from "../components/shared";

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div>
        <PageHero overline="Your Cart" title="Your Cart Is Empty" />
        <div className="max-w-3xl mx-auto px-6 pb-32 text-center">
          <ShoppingBag className="w-16 h-16 text-storm-silver/30 mx-auto" />
          <p className="text-storm-silver/60 mt-6 font-light">Nothing here yet. The storm collection is waiting.</p>
          <div className="mt-8 flex justify-center gap-3">
            <GlowButton to="/shop" data-testid="cart-shop">Shop the Collection</GlowButton>
            <GlowButton to="/books" variant="secondary" data-testid="cart-books">Browse Books</GlowButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero overline="Your Cart" title="Review Your Storm Collection" />
      <section className="max-w-6xl mx-auto px-6 pb-24 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
          {items.map((item, idx) => (
            <div key={idx} className="glass rounded-2xl p-4 flex gap-4 items-center" data-testid={`cart-item-${idx}`}>
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg font-semibold text-white truncate">{item.name}</p>
                <p className="text-xs text-storm-silver/50 mt-0.5">
                  {[item.format, item.size, item.color].filter(Boolean).join(" · ") || (item.type === "book" ? "Book" : "Product")}
                </p>
                <p className="text-white mt-1 font-medium">${(item.unitPrice || 0).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3 glass rounded-full px-3 py-1.5">
                <button onClick={() => updateQty(idx, item.quantity - 1)} data-testid={`cart-minus-${idx}`} className="text-white"><Minus className="w-4 h-4" /></button>
                <span className="text-white w-5 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateQty(idx, item.quantity + 1)} data-testid={`cart-plus-${idx}`} className="text-white"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={() => removeItem(idx)} data-testid={`cart-remove-${idx}`} className="text-storm-silver/50 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
        <div>
          <div className="glass rounded-2xl p-6 sticky top-24" data-testid="cart-summary">
            <h3 className="font-display text-xl font-bold text-white">Order Summary</h3>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-storm-silver/70"><span>Subtotal</span><span className="text-white" data-testid="cart-subtotal">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-storm-silver/70"><span>Shipping & tax</span><span className="text-storm-silver/50">Calculated at checkout</span></div>
            </div>
            <div className="border-t border-white/10 mt-5 pt-5 flex justify-between">
              <span className="text-white font-semibold">Estimated total</span>
              <span className="text-white font-bold text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <GlowButton to="/checkout" className="w-full mt-6" data-testid="cart-checkout">Proceed to Checkout <ArrowRight className="w-4 h-4" /></GlowButton>
            <Link to="/shop" className="block text-center text-sm text-storm-silver/60 hover:text-white mt-4">Continue shopping</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
