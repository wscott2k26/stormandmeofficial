import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Youtube, Instagram, Facebook, Music2, Music4, Apple, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "../lib/api";
import { SOCIALS } from "../lib/assets";

export function Overline({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs tracking-[0.28em] uppercase text-storm-blue/90 ${className}`}>
      <Sparkles className="w-3.5 h-3.5 text-storm-gold" /> {children}
    </span>
  );
}

export function SectionHeading({ overline, title, subtitle, center, className = "" }) {
  return (
    <div className={`${center ? "text-center mx-auto max-w-2xl" : "max-w-3xl"} ${className}`}>
      {overline && <Overline className="mb-4">{overline}</Overline>}
      <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.05]">{title}</h2>
      {subtitle && <p className="mt-5 text-storm-silver/70 text-base sm:text-lg leading-relaxed font-light">{subtitle}</p>}
    </div>
  );
}

export function GlowButton({ children, to, href, onClick, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold tracking-wide transition-all duration-300";
  const styles =
    variant === "primary"
      ? "bg-storm-blue text-white shadow-[0_0_18px_rgba(59,130,246,0.5)] hover:shadow-[0_0_32px_rgba(59,130,246,0.85)] hover:-translate-y-0.5"
      : variant === "gold"
      ? "bg-storm-gold text-black shadow-[0_0_18px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.7)] hover:-translate-y-0.5"
      : "bg-transparent border border-storm-silver/60 text-white hover:bg-white/5 hover:shadow-[0_0_18px_rgba(192,192,192,0.35)]";
  const cls = `${base} ${styles} ${className}`;
  if (to) return (<Link to={to} className={cls} {...props}>{children}</Link>);
  if (href) return (<a href={href} target="_blank" rel="noreferrer" className={cls} {...props}>{children}</a>);
  return (<button onClick={onClick} className={cls} {...props}>{children}</button>);
}

const SOCIAL_ICONS = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music4,
  spotify: Music2,
  apple: Apple,
};

export function SocialIcons({ className = "" }) {
  const activeSocials = SOCIALS.filter((social) => Boolean(social.url));

  if (!activeSocials.length) {
    return <p className={`text-sm text-storm-silver/50 ${className}`}>Verified social and streaming links are being connected.</p>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {activeSocials.map((social) => {
        const Icon = SOCIAL_ICONS[social.key] || Music2;
        return (
          <a
            key={social.key}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            aria-label={social.name}
            data-testid={`social-${social.key}`}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-storm-silver hover:text-white hover:border-storm-blue/60 hover:shadow-[0_0_16px_rgba(59,130,246,0.5)] transition-all duration-300"
          >
            <Icon className="w-4.5 h-4.5" />
          </a>
        );
      })}
    </div>
  );
}

export function NewsletterSection({ compact }) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const response = await subscribeNewsletter({ first_name: firstName || "Friend", email });
      toast.success(response.message || "Welcome to the family.");
      setFirstName("");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={compact ? "" : "relative py-24 sm:py-28"} data-testid="newsletter-section">
      <div className={`${compact ? "" : "max-w-4xl mx-auto px-6"}`}>
        <div className="wet-glass rounded-3xl border border-white/10 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-storm-blue/20 blur-[90px] rounded-full" />
          <div className="relative">
            <Overline className="mb-4">Join the family</Overline>
            <h3 className="font-display text-3xl sm:text-4xl font-bold text-white">Don't Face the Storm Alone</h3>
            <p className="mt-4 text-storm-silver/70 max-w-xl mx-auto font-light">
              New book announcements, music releases, videos, merch drops, personal messages, and exclusive behind-the-scenes updates.
            </p>
            <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                data-testid="newsletter-firstname"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="First name"
                autoComplete="given-name"
                className="flex-1 rounded-full bg-black/40 border border-white/15 px-5 py-3 text-white placeholder:text-storm-silver/40 focus:outline-none focus:border-storm-blue/60"
              />
              <input
                data-testid="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className="flex-1 rounded-full bg-black/40 border border-white/15 px-5 py-3 text-white placeholder:text-storm-silver/40 focus:outline-none focus:border-storm-blue/60"
              />
              <GlowButton type="submit" disabled={loading} className="whitespace-nowrap" data-testid="newsletter-submit">
                {loading ? "Joining..." : "Join the Family"} <Send className="w-4 h-4" />
              </GlowButton>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StatusBadge({ status }) {
  if (status === "coming_soon")
    return <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-storm-gold/15 text-storm-gold border border-storm-gold/30">Coming Soon</span>;
  if (status === "new")
    return <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-storm-blue/15 text-storm-blue border border-storm-blue/30">New Release</span>;
  if (status === "featured")
    return <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-storm-blue/15 text-storm-blue border border-storm-blue/30">Featured</span>;
  return null;
}
