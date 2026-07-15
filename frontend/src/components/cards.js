import React from "react";
import { Link } from "react-router-dom";
import { Clock3, Eye, ExternalLink } from "lucide-react";
import { StatusBadge } from "./shared";

export function BookCard({ book }) {
  const soon = book.status === "coming_soon";

  return (
    <div className="group glass rounded-2xl overflow-hidden flex flex-col hover:border-white/25 hover:-translate-y-1 transition-all duration-300" data-testid={`book-card-${book.id}`}>
      <Link to={`/books/${book.id}`} className="relative block aspect-[3/4] overflow-hidden bg-black/40">
        <img src={book.cover} alt={book.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3"><StatusBadge status={book.status} /></div>
        {book.series_order && <span className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Book {book.series_order}</span>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] tracking-[0.22em] uppercase text-storm-blue/80">{book.category}</span>
        <h3 className="font-display text-xl font-bold text-white mt-1.5 leading-tight">{book.title}</h3>
        {book.subtitle && <p className="text-storm-silver/60 text-xs mt-1 italic">{book.subtitle}</p>}
        <p className="text-storm-silver/60 text-sm mt-3 line-clamp-2 font-light flex-1">{book.summary}</p>
        <div className="flex items-center justify-between mt-4 gap-2">
          <span className="text-white font-semibold text-sm">{soon ? "Coming Soon" : "Available on Amazon"}</span>
          <span className="text-[10px] text-storm-silver/50 text-right">{book.formats?.join(" · ")}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Link to={`/books/${book.id}`} data-testid={`view-book-${book.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-storm-silver/40 text-white text-xs font-semibold py-2.5 hover:bg-white/5 transition-colors">
            <Eye className="w-3.5 h-3.5" /> View
          </Link>
          {!soon && book.amazon_link && (
            <a href={book.amazon_link} target="_blank" rel="noreferrer" data-testid={`buy-book-${book.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-storm-blue text-white text-xs font-semibold py-2.5 shadow-[0_0_14px_rgba(59,130,246,0.4)] hover:shadow-[0_0_24px_rgba(59,130,246,0.7)] transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> Amazon
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product }) {
  const price = product.sale_price || product.price;

  return (
    <div className="group glass rounded-2xl overflow-hidden flex flex-col hover:border-white/25 hover:-translate-y-1 transition-all duration-300" data-testid={`product-card-${product.id}`}>
      <Link to={`/shop/${product.id}`} className="relative block aspect-square overflow-hidden bg-black/40">
        <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-3 left-3 rounded-full border border-storm-gold/30 bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-storm-gold">Preview</span>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] tracking-[0.22em] uppercase text-storm-blue/80">{product.category}</span>
        <h3 className="font-medium text-white mt-1.5 leading-snug flex-1">{product.name}</h3>
        {Number.isFinite(price) && <p className="mt-3 text-xs text-storm-silver/50">Planned price: ${price.toFixed(2)}</p>}
        <div className="flex gap-2 mt-4">
          <Link to={`/shop/${product.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-storm-silver/40 text-white text-xs font-semibold py-2.5 hover:bg-white/5 transition-colors"><Eye className="w-3.5 h-3.5" /> Preview</Link>
          <span className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-white/5 text-storm-silver/60 text-xs font-semibold py-2.5"><Clock3 className="w-3.5 h-3.5" /> Soon</span>
        </div>
      </div>
    </div>
  );
}
