import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

const SITE_URL = "https://stormandmeofficial.com";

const META = {
  "/": {
    title: "Storm & Me Official | Books, Music & Stories by Willy Will",
    description: "The official home of Willy Will and author Will Scott—books, music, stories, and encouragement for people walking through real-life storms.",
  },
  "/books": {
    title: "Books That Walk With You | Storm & Me Official",
    description: "Explore healing, faith, children's, career, and science-fiction books by Will Scott, including The Storm in Me and Let It Go, Little Doll.",
  },
  "/music": {
    title: "Willy Will Music | Storm & Me Official",
    description: "Songs for heartbreak, healing, faith, laughter, survival, and the mornings you choose to keep going.",
  },
  "/videos": {
    title: "Videos | Storm & Me Official",
    description: "Watch music videos, lyric videos, book trailers, creator stories, and behind-the-scenes releases from Storm & Me Official.",
  },
  "/shop": {
    title: "The Storm Collection | Storm & Me Official",
    description: "Wearable reminders and creative goods built around strength, healing, faith, perseverance, and survival.",
  },
  "/about": {
    title: "Meet Willy Will | Author, Songwriter & Creator",
    description: "Meet Willy Will—author Will Scott, songwriter, storyteller, technology professional, and creator of Storm & Me Official.",
  },
  "/story": {
    title: "The Story Behind the Storm | Storm & Me Official",
    description: "Why Storm & Me Official exists: books, music, and messages for the hurting, the healing, the rebuilding, and the still-standing.",
  },
  "/news": {
    title: "News & Updates | Storm & Me Official",
    description: "Book announcements, music releases, videos, creative updates, and stories from the Storm & Me journey.",
  },
  "/contact": {
    title: "Contact | Storm & Me Official",
    description: "Contact Storm & Me Official for reader messages, media, creative collaborations, and business inquiries.",
  },
};

function setMeta(name, content, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(property ? "property" : "name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const basePath = location.pathname.startsWith("/books/")
      ? "/books"
      : location.pathname.startsWith("/music/")
      ? "/music"
      : location.pathname.startsWith("/news/")
      ? "/news"
      : location.pathname;
    const meta = META[basePath] || META["/"];
    const canonicalUrl = `${SITE_URL}${location.pathname === "/" ? "" : location.pathname}`;

    document.title = meta.title;
    setMeta("description", meta.description);
    setMeta("og:title", meta.title, true);
    setMeta("og:description", meta.description, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("twitter:title", meta.title);
    setMeta("twitter:description", meta.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
  }, [location.pathname]);

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
