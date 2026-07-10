import React, { useEffect, useState } from "react";
import { getFaqs } from "../lib/api";
import PageHero from "../components/PageHero";
import { NewsletterSection } from "../components/shared";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  useEffect(() => { getFaqs().then(setFaqs).catch(() => {}); }, []);

  return (
    <div>
      <PageHero overline="Support" title="Frequently Asked Questions"
        subtitle="Everything you need to know about books, music, merch, shipping, and more." />
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <Accordion type="single" collapsible className="glass rounded-3xl px-6" data-testid="faq-accordion">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} data-testid={`faq-item-${i}`}>
              <AccordionTrigger className="text-white text-left font-display text-lg">{f.q}</AccordionTrigger>
              <AccordionContent className="text-storm-silver/70 font-light leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <NewsletterSection />
    </div>
  );
}
