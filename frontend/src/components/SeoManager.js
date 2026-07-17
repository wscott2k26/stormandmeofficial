import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://stormandmeofficial.com";
const DEFAULT_IMAGE = "https://static.prod-images.emergentagent.com/jobs/7463b3a3-ce4d-4fcb-8b80-776d01ad6286/images/775346fa723f1ad9cd453640a09247622a64e34e471f2f9bf6cb08fb58715a0d.png";

const BOOKS = {
  "the-storm-in-me": {
    title: "The Storm in Me by Will Scott",
    description: "A deeply personal story about surviving the storm, rebuilding a life, and refusing to let brokenness have the final word.",
  },
  "365-days-fearless-faith": {
    title: "365 Days of Fearless Faith by Will Scott",
    description: "Daily encouragement for anxious hearts learning to choose faith, courage, and hope one day at a time.",
  },
  "quiet-battles": {
    title: "Quiet Battles by Will Scott",
    description: "A book for people fighting silent struggles nobody else can see—and still finding a reason to rise.",
  },
  "no-ones-coming-to-save-you": {
    title: "No One's Coming to Save You by Will Scott",
    description: "A direct, honest push toward ownership, courage, action, and rebuilding your own life.",
  },
  "laid-off-handbook": {
    title: "Laid Off: A Person's Handbook by Will Scott",
    description: "A grounded guide for the shock, fear, identity loss, and new beginning that can follow a layoff.",
  },
  "let-it-go-little-doll": {
    title: "Let It Go, Little Doll by Will Scott",
    description: "A gentle children's story about big feelings, emotional healing, growth, and learning when to let go.",
  },
  "last-block-book-one": {
    title: "The Last Block on Earth — Book One by Will Scott",
    description: "A science-fiction survival story where one remaining block may hold the future of everything.",
  },
  "last-block-mercy-node": {
    title: "The Last Block on Earth: Mercy Node by Will Scott",
    description: "Book Two expands the world of The Last Block on Earth with deeper mysteries, danger, and impossible choices.",
  },
  "abductee-chronicles-marcus": {
    title: "The Abductee Chronicles: The Abduction of Marcus",
    description: "A suspenseful science-fiction journey centered on Marcus and the mystery surrounding his disappearance.",
  },
  "what-if-they-are-real": {
    title: "What If They Are Real? by Will Scott",
    description: "A thought-provoking exploration of the possibility that strange sightings and mysteries may point to something real.",
  },
  "let-it-go-little-bear": {
    title: "Let It Go, Little Bear — Coming Soon",
    description: "A forthcoming children's story about grief, memory, love, and passing hope forward.",
  },
  unhappy: {
    title: "UNHAPPY by Will Scott — Coming Soon",
    description: "An honest forthcoming book for people at rock bottom who are not ready for fake positivity but are still seeking a way forward.",
  },
};

const STATIC_PAGES = {
  "/": {
    title: "Storm & Me Official | Books, Music, Stories & Merch",
    description: "The official creative home of author Will Scott and recording artist Willy Will—books, music, stories, videos, and meaningful merchandise for people rebuilding after the storm.",
  },
  "/books": {
    title: "Books by Will Scott | Storm & Me Official",
    description: "Explore books by Will Scott about healing, faith, emotional growth, career recovery, children's feelings, suspense, and science fiction.",
  },
  "/music": {
    title: "Music by Willy Will | Storm & Me Official",
    description: "Listen to official music by Willy Will—honest songs about faith, pain, love, humor, survival, healing, and second chances.",
  },
  "/videos": {
    title: "Official Videos | Storm & Me Official",
    description: "Watch official Willy Will music videos, lyric videos, creative releases, and visual stories from Storm & Me Official.",
  },
  "/about": {
    title: "About Will Scott & Willy Will | Storm & Me Official",
    description: "Meet Will Scott, the author, songwriter, storyteller, and recording artist behind Storm & Me Official and Willy Will.",
  },
  "/story": {
    title: "The Story Behind Storm & Me Official",
    description: "Discover the mission behind Storm & Me Official: turning real-life storms into books, music, stories, hope, healing, and purpose.",
  },
  "/news": {
    title: "News & New Releases | Storm & Me Official",
    description: "Official updates, new books, music releases, videos, merchandise, and behind-the-scenes stories from Will Scott and Willy Will.",
  },
  "/news/welcome": {
    title: "Welcome to Storm & Me Official",
    description: "Welcome to the creative home of Will Scott and Willy Will—built for people who survived the storm and kept moving forward.",
  },
  "/contact": {
    title: "Contact Storm & Me Official",
    description: "Contact Will Scott and the Storm & Me Official team about books, music, media, collaboration, speaking, or general questions.",
  },
  "/faq": {
    title: "Frequently Asked Questions | Storm & Me Official",
    description: "Answers about Will Scott, Willy Will, books, music, merchandise, shipping, official links, and upcoming releases.",
  },
};

const NO_INDEX_PATHS = new Set([
  "/privacy",
  "/terms",
  "/shipping",
  "/returns",
  "/accessibility",
  "/cart",
  "/checkout",
  "/account",
  "/order-confirmation",
]);

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function pageForPath(pathname) {
  if (STATIC_PAGES[pathname]) return STATIC_PAGES[pathname];

  if (pathname.startsWith("/books/")) {
    const slug = pathname.split("/").filter(Boolean)[1];
    return BOOKS[slug] || {
      title: "Book by Will Scott | Storm & Me Official",
      description: "Explore books and stories by author Will Scott at Storm & Me Official.",
    };
  }

  if (pathname.startsWith("/music/")) {
    return {
      title: "Music by Willy Will | Storm & Me Official",
      description: "Listen to official music and learn the story behind the song from recording artist Willy Will.",
    };
  }

  return {
    title: "Storm & Me Official | Will Scott & Willy Will",
    description: "Books, music, stories, videos, and meaningful creations by Will Scott and Willy Will.",
  };
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const cleanPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    const page = pageForPath(cleanPath);
    const canonical = `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
    const noIndex = NO_INDEX_PATHS.has(cleanPath);

    document.title = page.title;
    setCanonical(canonical);

    setMeta('meta[name="description"]', { name: "description", content: page.description });
    setMeta('meta[name="robots"]', {
      name: "robots",
      content: noIndex
        ? "noindex,follow"
        : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    });
    setMeta('meta[property="og:title"]', { property: "og:title", content: page.title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: page.description });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    setMeta('meta[property="og:type"]', { property: "og:type", content: cleanPath.startsWith("/books/") ? "book" : "website" });
    setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Storm & Me Official" });
    setMeta('meta[property="og:image"]', { property: "og:image", content: DEFAULT_IMAGE });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: page.title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: page.description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: DEFAULT_IMAGE });

    const oldSchema = document.getElementById("storm-and-me-schema");
    if (oldSchema) oldSchema.remove();

    const graph = [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Storm & Me Official",
        url: SITE_URL,
        logo: "https://static.prod-images.emergentagent.com/jobs/7463b3a3-ce4d-4fcb-8b80-776d01ad6286/images/a3d5a538ff81f998f6794bf45162190a817187cbc7de2e5721dad88e66e09e8f.png",
        founder: { "@id": `${SITE_URL}/#will-scott` },
        sameAs: [
          "https://www.youtube.com/channel/UCZgQD7_5RPeyJ3iHpIoohVQ",
          "https://music.youtube.com/channel/UCZgQD7_5RPeyJ3iHpIoohVQ",
          "https://open.spotify.com/artist/3Hops9WO5h29fi1IhsPMQJq",
          "https://music.apple.com/artist/1816195997",
        ],
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#will-scott`,
        name: "Will Scott",
        alternateName: "Willy Will",
        url: `${SITE_URL}/about`,
        jobTitle: "Author, Songwriter and Storyteller",
        sameAs: [
          "https://www.youtube.com/channel/UCZgQD7_5RPeyJ3iHpIoohVQ",
          "https://open.spotify.com/artist/3Hops9WO5h29fi1IhsPMQJq",
          "https://music.apple.com/artist/1816195997",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Storm & Me Official",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-US",
      },
    ];

    if (cleanPath.startsWith("/books/")) {
      graph.push({
        "@type": "Book",
        name: page.title.replace(" | Storm & Me Official", ""),
        description: page.description,
        url: canonical,
        author: { "@id": `${SITE_URL}/#will-scott` },
      });
    }

    const schema = document.createElement("script");
    schema.id = "storm-and-me-schema";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(schema);
  }, [pathname]);

  return null;
}
