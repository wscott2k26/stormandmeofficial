import React from "react";
import PageHero from "../components/PageHero";
import { NewsletterSection } from "../components/shared";

const CONTENT = {
  privacy: {
    overline: "Legal", title: "Privacy Policy",
    intro: "Your trust matters. This policy explains what we collect and how we use it on StormAndMeOfficial.com.",
    sections: [
      ["Information we collect", "We collect information you provide directly—such as your name and email when you join the family newsletter, contact us, or place an order. Payment details are handled securely by Stripe and are never stored on our servers."],
      ["How we use it", "To fulfill orders, send receipts and updates you've asked for, respond to messages, and improve the site. We never sell your personal information."],
      ["Cookies", "We use minimal cookies and local storage to remember your cart and site preferences (like reduced-motion)."],
      ["Your choices", "You can unsubscribe from emails at any time and request deletion of your data by contacting us."],
    ],
  },
  terms: {
    overline: "Legal", title: "Terms & Conditions",
    intro: "By using StormAndMeOfficial.com you agree to the following terms.",
    sections: [
      ["Use of the site", "This site and its content are for personal, non-commercial use. All books, music, artwork, and text are the intellectual property of Willy Will and StormAndMeOfficial."],
      ["Purchases", "Prices are listed in USD. We reserve the right to correct errors and update pricing. Orders are subject to acceptance and availability."],
      ["Content", "You may not reproduce, distribute, or resell any content without written permission."],
      ["Limitation of liability", "The site is provided 'as is.' We are not liable for indirect or incidental damages arising from its use."],
    ],
  },
  shipping: {
    overline: "Support", title: "Shipping Policy",
    intro: "How and when your storm collection arrives.",
    sections: [
      ["Processing time", "Physical merchandise and print books are processed within 1–2 business days and shipped within 3–5 business days."],
      ["Shipping options", "Standard (3–5 business days) and Express (1–2 business days) are available at checkout. Digital items are delivered instantly by email."],
      ["Tracking", "You'll receive tracking information by email once your order ships."],
      ["International", "Select regions supported. International delivery times and duties may vary."],
    ],
  },
  returns: {
    overline: "Support", title: "Returns & Refund Policy",
    intro: "We want you to love what you ordered.",
    sections: [
      ["Returns", "Unworn, unwashed merchandise may be returned within 30 days of delivery for a refund or exchange."],
      ["Non-returnable", "Signed and limited-edition items and digital products (ebooks, music downloads) are final sale."],
      ["How to start a return", "Contact us with your order reference and reason. We'll send return instructions."],
      ["Refunds", "Approved refunds are issued to the original payment method within 5–10 business days."],
    ],
  },
  accessibility: {
    overline: "Commitment", title: "Accessibility Statement",
    intro: "Everyone should be able to step into the storm.",
    sections: [
      ["Our commitment", "We strive to meet WCAG 2.1 AA guidelines—high color contrast, readable fonts, alt text, keyboard navigation, and screen-reader-friendly headings."],
      ["Motion sensitivity", "The rain and lightning effects respect your system's reduced-motion setting, and you can toggle storm animation on or off using the cloud icon in the navigation at any time."],
      ["No rapid flashing", "Lightning is deliberately infrequent and gentle—never a strobe—to keep the experience comfortable."],
      ["Feedback", "If you encounter an accessibility barrier, please contact us so we can fix it."],
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
        <p className="text-xs text-storm-silver/40 pt-4">Last updated: June 2026 · StormAndMeOfficial.com</p>
      </section>
      <NewsletterSection />
    </div>
  );
}
