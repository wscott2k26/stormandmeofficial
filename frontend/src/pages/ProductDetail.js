import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Minus, Plus, ArrowLeft, Share2, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getProduct, getProducts } from "../lib/api";
import { useCart } from "../context/CartContext";
import { GlowButton, Overline, NewsletterSection } from "../components/shared";
import { ProductCard } from "../components/cards";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    getProduct(id).then((p) => { setProduct(p); setSize(p.sizes?.[0]); setColor(p.colors?.[0]); }).catch(() => setProduct(false));
    getProducts().then(setRelated).catch(() => {});
  }, [id]);

  if (product === false) return <div className="pt-40 pb-40 text-center text-storm-silver/60">Product not found. <Link to="/shop" className="text-storm-blue">Back to shop</Link></div>;
  if (!product) return <div className="pt-40 pb-40 text-center text-storm-silver/50">Loading...</div>;

  const price = product.sale_price || product.price;
  const relatedProducts = related.filter((p) => p.id !== product.id && (p.categories || []).some((c) => (product.categories || []).includes(c))).slice(0, 4);

  const build = () => ({ id: product.id, type: "product", quantity: qty, size, color, unitPrice: price, name: product.name, image: product.image });
  const add = () => { addItem(build()); toast.success(`"${product.name}" added to cart`); };
  const buyNow = () => { addItem(build()); navigate("/cart"); };

  return (
    <div>
      <div className="pt-28 max-w-7xl mx-auto px-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-storm-silver/60 hover:text-white mb-8" data-testid="back-to-shop"><ArrowLeft className="w-4 h-4" /> Shop</Link>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative">
            <div className="absolute -inset-6 bg-storm-blue/10 blur-[80px] rounded-full" />
            <img src={product.image} alt={product.name} className="relative rounded-2xl w-full border border-white/10" data-testid="product-detail-image" />
          </div>
          <div>
            <span className="text-xs tracking-[0.22em] uppercase text-storm-blue/90">{product.category}</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mt-2" data-testid="product-detail-name">{product.name}</h1>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-3xl font-semibold text-white">${price.toFixed(2)}</span>
              {product.sale_price && <span className="text-storm-silver/40 line-through text-lg">${product.price.toFixed(2)}</span>}
            </div>
            <p className="mt-5 text-storm-silver/80 leading-relaxed font-light">{product.description}</p>

            {product.sizes?.length > 1 && (
              <div className="mt-7">
                <p className="text-xs tracking-widest uppercase text-storm-silver/50 mb-3">Size</p>
                <div className="flex flex-wrap gap-2" data-testid="product-sizes">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSize(s)} data-testid={`size-${s}`}
                      className={`min-w-[44px] px-3 py-2 rounded-lg text-sm border transition-all ${size === s ? "bg-white text-black border-white" : "border-white/20 text-storm-silver/80 hover:border-white/40"}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {product.colors?.length > 1 && (
              <div className="mt-6">
                <p className="text-xs tracking-widest uppercase text-storm-silver/50 mb-3">Color</p>
                <div className="flex flex-wrap gap-2" data-testid="product-colors">
                  {product.colors.map((c) => (
                    <button key={c} onClick={() => setColor(c)} data-testid={`color-${c.toLowerCase().replace(/\s/g, "-")}`}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${color === c ? "bg-white text-black border-white" : "border-white/20 text-storm-silver/80 hover:border-white/40"}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7">
              <p className="text-xs tracking-widest uppercase text-storm-silver/50 mb-3">Quantity</p>
              <div className="inline-flex items-center gap-4 glass rounded-full px-4 py-2">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="qty-minus" className="text-white"><Minus className="w-4 h-4" /></button>
                <span className="text-white w-6 text-center" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} data-testid="qty-plus" className="text-white"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <GlowButton onClick={add} data-testid="product-add-cart"><ShoppingBag className="w-4 h-4" /> Add to Cart</GlowButton>
              <GlowButton onClick={buyNow} variant="gold" data-testid="product-buy-now">Buy Now</GlowButton>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[[Truck, "Fast shipping"], [ShieldCheck, "Secure checkout"], [RotateCcw, "Easy returns"]].map(([Icon, label], i) => (
                <div key={i} className="glass rounded-xl py-4"><Icon className="w-5 h-5 text-storm-blue mx-auto" /><p className="text-[11px] text-storm-silver/60 mt-2">{label}</p></div>
              ))}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <Overline className="mb-3">You might also like</Overline>
            <h2 className="font-display text-2xl font-bold text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">{relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        )}
      </div>
      <div className="mt-20"><NewsletterSection /></div>
    </div>
  );
}
