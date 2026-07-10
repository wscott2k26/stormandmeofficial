import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { StatusBadge, GlowButton } from "./shared";

export function BookCard({ book }) {
  const { addItem } = useCart();
  const soon = book.status === "coming_soon";

  const buy = () => {
    addItem({ id: book.id, type: "book", quantity: 1, format: book.formats?.[0], unitPrice: book.price, name: book.title, image: book.cover });
    toast.success(`"${book.title}" added to cart`);
  };

  return (
    <div className="group glass rounded-2xl overflow-hidden flex flex-col hover:border-white/25 hover:-translate-y-1 transition-all duration-300" data-testid={`book-card-${book.id}`}>
      <Link to={`/books/${book.id}`} className="relative block aspect-[3/4] overflow-hidden bg-black/40">
        <img src={book.cover} alt={book.title} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3"><StatusBadge status={book.status} /></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] tracking-[0.22em] uppercase text-storm-blue/80">{book.category}</span>
        <h3 className="font-display text-xl font-bold text-white mt-1.5 leading-tight">{book.title}</h3>
        {book.subtitle && <p className="text-storm-silver/60 text-xs mt-1 italic">{book.subtitle}</p>}
        <p className="text-storm-silver/60 text-sm mt-3 line-clamp-2 font-light flex-1">{book.summary}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-white font-semibold text-lg">{soon ? "—" : `$${book.price.toFixed(2)}`}</span>
          <span className="text-[10px] text-storm-silver/50">{book.formats?.join(" · ")}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Link to={`/books/${book.id}`} data-testid={`view-book-${book.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-storm-silver/40 text-white text-xs font-semibold py-2.5 hover:bg-white/5 transition-colors">
            <Eye className="w-3.5 h-3.5" /> View
          </Link>
          {!soon && (
            <button onClick={buy} data-testid={`buy-book-${book.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-storm-blue text-white text-xs font-semibold py-2.5 shadow-[0_0_14px_rgba(59,130,246,0.4)] hover:shadow-[0_0_24px_rgba(59,130,246,0.7)] transition-all">
              <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const price = product.sale_price || product.price;
  const add = () => {
    addItem({ id: product.id, type: "product", quantity: 1, size: product.sizes?.[0], color: product.colors?.[0], unitPrice: price, name: product.name, image: product.image });
    toast.success(`"${product.name}" added to cart`);
  };

  return (
    <div className="group glass rounded-2xl overflow-hidden flex flex-col hover:border-white/25 hover:-translate-y-1 transition-all duration-300" data-testid={`product-card-${product.id}`}>
      <Link to={`/shop/${product.id}`} className="relative block aspect-square overflow-hidden bg-black/40">
        <img src={product.image} alt={product.name} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.sale_price && (
          <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-storm-gold text-black font-bold">Sale</span>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] tracking-[0.22em] uppercase text-storm-blue/80">{product.category}</span>
        <h3 className="font-medium text-white mt-1.5 leading-snug flex-1">{product.name}</h3>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-white font-semibold text-lg">${price.toFixed(2)}</span>
          {product.sale_price && <span className="text-storm-silver/40 line-through text-sm">${product.price.toFixed(2)}</span>}
        </div>
        <div className="flex gap-2 mt-4">
          <Link to={`/shop/${product.id}`} data-testid={`view-product-${product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-storm-silver/40 text-white text-xs font-semibold py-2.5 hover:bg-white/5 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Details
          </Link>
          <button onClick={add} data-testid={`add-product-${product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-storm-blue text-white text-xs font-semibold py-2.5 shadow-[0_0_14px_rgba(59,130,246,0.4)] hover:shadow-[0_0_24px_rgba(59,130,246,0.7)] transition-all">
            <ShoppingBag className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
