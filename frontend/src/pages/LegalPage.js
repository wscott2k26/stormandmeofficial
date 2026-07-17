import React from "react";
import PageHero from "../components/PageHero";
import { NewsletterSection } from "../components/shared";

const CONTENT = {
  privacy: {
    overline: "Legal", title: "Privacy Policy",
    intro: "Your trust matters. This policy explains what information StormAndMeOfficial.com may collect and how it is used.",
    sections: [
      ["Information you provide", "We may receive information you submit directly, such as your name, email address, newsletter preference, or the contents of a message sent through the contact form. Please do not send sensitive financial, medical, or identification information through the website."],
      ["Purchases and third-party stores", "StormAndMeOfficial.com does not directly collect or store payment-card information. Merchandise checkout is handled by the official Shopify storefront at shop.stormandmeofficial.com, with production and fulfillment connected through Printify. Books may link to Amazon or another authorized retailer. Those services process orders under their own privacy policies."],
      ["Analytics, cookies, and advertising", "The site may use cookies, local storage, and analytics tools such as PostHog to understand site performance and remember preferences. Google AdSense may use cookies or similar technologies to serve, measure, and limit advertising. Depending on your location and consent choices, ads may be personalized or non-personalized. You can manage browser cookies and applicable Google advertising preferences through the controls provided by those services."],
      ["How information is used", "Information is used to respond to messages, deliver updates you requested, maintain security, understand which pages are useful, improve site performance, and meet legal obligations. Storm & Me Official does not sell personal information."],
      ["Retention and your choices", "Contact and newsletter information is kept only as long as reasonably needed for the purpose it was provided. You may unsubscribe from email messages at any time or contact us to request access, correction, or deletion where applicable."],
      ["External links", "The website links to third-party platforms including Shopify, Amazon, Spotify, Apple Music, YouTube, and social networks. Storm & Me Official is not responsible for the privacy practices or content of those external services."],
    ],
  },
  terms: {
    overline: "Legal", title: "Terms & Conditions",
    intro: "By using StormAndMeOfficial.com, you agree to these terms.",
    sections: [
      ["Use of the site", "This site is provided for personal, lawful use. You may browse official information about books, music, videos, stories, and merchandise, and follow links to authorized platforms."],
      ["Intellectual property", "Unless otherwise credited, original books, music, artwork, branding, written content, and other creative materials are owned by Will Scott, Willy Will, or Storm & Me Official. You may not reproduce, distribute, republish, sell, or falsely claim ownership of protected content without written permission."],
      ["Purchases through other services", "Merchandise purchases are completed through the official Shopify storefront. Books may be purchased through Amazon or another listed retailer. Prices, taxes, shipping, payment processing, availability, cancellations, and refunds are governed by the terms shown by the seller at checkout."],
      ["Accuracy and availability", "We work to keep official links, descriptions, release information, and availability accurate, but details may change. A listing or announcement does not guarantee permanent availability, pricing, or a specific release date."],
      ["External services", "Links to retailers, streaming services, video platforms, and social networks are provided for convenience. We are not responsible for third-party outages, content, policies, transactions, or account decisions."],
      ["Limitation of liability", "The site is provided on an 'as is' and 'as available' basis. To the extent permitted by law, Storm & Me Official is not liable for indirect, incidental, or consequential losses arising from use of the site or a third-party destination."],
    ],
  },
  shipping: {
    overline: "Support", title: "Shipping Policy",
    intro: "Shipping depends on where an item is purchased and who fulfills it.",
    sections: [
      ["Storm & Me merchandise", "Official merchandise orders are placed through shop.stormandmeofficial.com. Available shipping methods, estimated delivery ranges, taxes, and charges are displayed by Shopify during checkout. Production and fulfillment may be handled by Printify and its print providers."],
      ["Production time", "Print-on-demand items are made after an order is placed. Production and shipping estimates can vary by product, print provider, destination, inventory, carrier conditions, and seasonal demand. The estimate shown during checkout is the best current guide, not a guaranteed arrival date."],
      ["Books and other retailers", "Books purchased through Amazon or another linked retailer are shipped under that retailer's current shipping options, tracking system, and customer-service policies."],
      ["Tracking and address issues", "When tracking is available, it is normally sent by the seller or fulfillment provider. Customers should review the delivery address carefully before submitting an order and contact the seller promptly if information is incorrect."],
      ["International orders", "Availability, delivery time, customs charges, import taxes, and carrier service vary by country. Any applicable duties or import fees are generally the customer's responsibility unless checkout states otherwise."],
    ],
  },
  returns: {
    overline: "Support", title: "Returns & Refund Policy",
    intro: "Return and refund options depend on the seller and the type of item purchased.",
    sections: [
      ["Merchandise orders", "Requests involving merchandise from shop.stormandmeofficial.com must follow the policy displayed by the official Shopify store and the applicable Printify fulfillment rules. Because many products are made to order, change-of-mind returns or exchanges may be limited."],
      ["Damaged, defective, or incorrect items", "Customers should contact the Shopify store promptly and include the order number, a description of the problem, and clear photographs when an item arrives damaged, defective, misprinted, or different from what was ordered."],
      ["Books and retailer purchases", "Returns for books or products purchased through Amazon or another retailer must be requested directly from that retailer under its current return and refund policy."],
      ["Digital and streaming content", "Music streams, video access, downloads, and other digital services are governed by the platform through which they are accessed. Digital purchases may be non-returnable except where required by law or permitted by the platform."],
      ["Refund timing", "When a seller approves a refund, timing depends on the seller, payment processor, and financial institution. StormAndMeOfficial.com does not control bank processing times for third-party transactions."],
    ],
  },
  accessibility: {
    overline: "Commitment", title: "Accessibility Statement",
    intro: "Storm & Me Official is committed to making its creative work easier for everyone to access.",
    sections: [
      ["Our commitment", "We work toward accessible headings, readable typography, useful alternative text, keyboard navigation, sufficient contrast, and support for common screen readers and assistive technologies."],
      ["Motion and sound controls", "Storm animation and ambient audio can be controlled from the site. Motion effects are designed to respect reduced-motion preferences, and audio does not need to be enabled to use the core site."],
      ["No intentional rapid flashing", "Visual effects are designed to avoid rapid strobing or intentionally unsafe flashing patterns."],
      ["Third-party destinations", "Retailers, music services, video platforms, and social networks have their own accessibility features and policies. We encourage visitors to use the accessibility controls provided by those platforms."],
      ["Feedback", "If you encounter an accessibility barrier on StormAndMeOfficial.com, please use the contact page and describe the page, device, browser, and issue so it can be investigated."],
    ],
  },
};

export default function LegalPage({ slug }) {
  const c = CONTENT[slug];
  if (!c) return null;
  return (
    <div>
      <PageHero overline={c.overline} title={c.title} subtitle={c.intro} />
      <section className="max-w-3xl mx-auto px-6 pb-24 space-y-10">
        {c.sections.map(([h, p], i) => (
          <div key={i}>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">{h}</h2>
            <p className="mt-3 text-storm-silver/75 leading-relaxed font-light">{p}</p>
          </div>
        ))}
        <p className="text-xs text-storm-silver/40 pt-4">Last updated: July 17, 2026 · StormAndMeOfficial.com</p>
      </section>
      <NewsletterSection />
    </div>
  );
}
