import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Menu, X, CloudRain, CloudOff } from "lucide-react";
import { ASSETS } from "../lib/assets";
import { useStorm } from "../context/StormContext";
import { SocialIcons } from "./shared";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/music", label: "Music" },
  { to: "/videos", label: "Videos" },
  { to: "/shop", label: "Collection" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { motion, toggleMotion } = useStorm();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const doSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "glass-strong shadow-lg shadow-black/40" : "bg-transparent"}`}
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-3 group" data-testid="nav-logo">
            <img src={ASSETS.logo} alt="STORM & ME OFFICIAL logo" className="h-11 w-11 object-contain" />
            <div className="leading-none hidden sm:block">
              <div className="font-display text-[15px] font-bold tracking-[0.15em] text-white">STORM &amp; ME</div>
              <div className="text-[10px] tracking-[0.4em] text-storm-blue/80">OFFICIAL</div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-6">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors duration-200 ${isActive ? "text-white" : "text-storm-silver/70 hover:text-white"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen((value) => !value)}
              aria-label="Search the collection"
              data-testid="nav-search-btn"
              className="w-10 h-10 rounded-full flex items-center justify-center text-storm-silver hover:text-white hover:bg-white/5 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={toggleMotion}
              aria-label={motion ? "Show the calm after the storm" : "Bring the storm back"}
              data-testid="nav-motion-toggle"
              title={motion ? "Show the calm after the storm" : "Bring the storm back"}
              className="w-10 h-10 rounded-full flex items-center justify-center text-storm-silver hover:text-white hover:bg-white/5 transition-colors"
            >
              {motion ? <CloudRain className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              data-testid="nav-mobile-menu-btn"
              className="xl:hidden w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={doSearch} className="pb-4 -mt-1" data-testid="nav-search-form">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the official collection..."
              className="w-full rounded-full bg-black/50 border border-white/15 px-5 py-3 text-white placeholder:text-storm-silver/40 focus:outline-none focus:border-storm-blue/60"
            />
          </form>
        )}
      </div>

      <div className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-[82%] max-w-sm glass-strong p-6 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
          data-testid="mobile-drawer"
        >
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-lg font-bold tracking-widest text-white">MENU</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              data-testid="mobile-close-btn"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 overflow-y-auto">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                data-testid={`mobile-link-${link.label.toLowerCase()}`}
                className={({ isActive }) => `py-3 px-2 text-lg font-medium border-b border-white/5 ${isActive ? "text-storm-blue" : "text-white/80"}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <p className="mb-5 text-sm leading-relaxed text-storm-silver/55">Books connect to their official retailer pages. Merchandise is purchased securely through the live Storm &amp; Me Printify store.</p>
            <SocialIcons />
          </div>
        </div>
      </div>
    </header>
  );
}
