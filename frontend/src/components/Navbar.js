import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, CloudRain, CloudOff } from "lucide-react";
import { ASSETS, BRAND } from "../lib/assets";
import { useCart } from "../context/CartContext";
import { useStorm } from "../context/StormContext";
import { SocialIcons, GlowButton } from "./shared";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/music", label: "Music" },
  { to: "/videos", label: "Videos" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const { count } = useCart();
  const { motion, toggleMotion } = useStorm();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const doSearch = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/shop?q=${encodeURIComponent(q.trim())}`); setSearchOpen(false); setQ(""); }
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "glass-strong shadow-lg shadow-black/40" : "bg-transparent"}`}
      data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-3 group" data-testid="nav-logo">
            <img src={ASSETS.logo} alt="STORM & ME OFFICIAL logo" className="h-11 w-11 object-contain" />
            <div className="leading-none hidden sm:block">
              <div className="font-display text-[15px] font-bold tracking-[0.15em] text-white">STORM &amp; ME</div>
              <div className="text-[10px] tracking-[0.4em] text-storm-blue/80">OFFICIAL</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors duration-200 ${isActive ? "text-white" : "text-storm-silver/70 hover:text-white"}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setSearchOpen((s) => !s)} aria-label="Search" data-testid="nav-search-btn"
              className="w-10 h-10 rounded-full flex items-center justify-center text-storm-silver hover:text-white hover:bg-white/5 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={toggleMotion} aria-label="Toggle storm animation" data-testid="nav-motion-toggle"
              title={motion ? "Turn off storm motion" : "Turn on storm motion"}
              className="w-10 h-10 rounded-full flex items-center justify-center text-storm-silver hover:text-white hover:bg-white/5 transition-colors">
              {motion ? <CloudRain className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </button>
            <Link to="/cart" aria-label="Cart" data-testid="nav-cart-btn"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-storm-silver hover:text-white hover:bg-white/5 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span data-testid="cart-count" className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-storm-blue text-white text-[10px] font-bold flex items-center justify-center">{count}</span>
              )}
            </Link>
            <GlowButton to="/shop" className="hidden md:inline-flex !px-5 !py-2.5" data-testid="nav-shop-now">Shop Now</GlowButton>
            <button onClick={() => setOpen(true)} aria-label="Menu" data-testid="nav-mobile-menu-btn"
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/5">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={doSearch} className="pb-4 -mt-1" data-testid="nav-search-form">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search books, music, merch..."
              className="w-full rounded-full bg-black/50 border border-white/15 px-5 py-3 text-white placeholder:text-storm-silver/40 focus:outline-none focus:border-storm-blue/60" />
          </form>
        )}
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-[82%] max-w-sm glass-strong p-6 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
          data-testid="mobile-drawer">
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-lg font-bold tracking-widest text-white">MENU</span>
            <button onClick={() => setOpen(false)} aria-label="Close" data-testid="mobile-close-btn"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10"><X className="w-6 h-6" /></button>
          </div>
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)}
                data-testid={`mobile-link-${l.label.toLowerCase()}`}
                className={({ isActive }) => `py-3 px-2 text-lg font-medium border-b border-white/5 ${isActive ? "text-storm-blue" : "text-white/80"}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <GlowButton to="/shop" onClick={() => setOpen(false)} className="w-full mb-6">Shop the Collection</GlowButton>
            <SocialIcons />
          </div>
        </div>
      </div>
    </header>
  );
}
