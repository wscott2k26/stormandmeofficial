import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, Star, Share2, Facebook, Twitter, Link as LinkIcon, ArrowLeft, BookOpenCheck, Bell } from "lucide-react";
import { toast } from "sonner";
import { getBook, getBooks } from "../lib/api";
import { GlowButton, NewsletterSection, StatusBadge, Overline } from "../components/shared";
import { BookCard } from "../components/cards";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    getBook(id).then(setBook).catch(() => setBook(false));
    getBooks().then(setRelated).catch(() => {});
  }, [id]);

  if (book === false) return <div className="pt-40 pb-40 text-center text-storm-silver/60">Book not found. <Link to="/books" className="text-storm-blue">Back to books</Link></div>;
  if (!book) return <div className="pt-40 pb-40 text-center text-storm-silver/50">Loading...</div>;

  const soon = book.status === "coming_soon";
  const relatedBooks = related.filter((item) => (book.related || []).includes(item.id));
  const previousInSeries = book.series_order > 1
    ? related.find((item) => item.series_order === book.series_order - 1 && item.categories?.some((category) => book.categories?.includes(category)))
    : null;

  const share = (network) => {
    const url = window.location.href;
    const map = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(book.title)}`,
    };
    if (network === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
      return;
    }
    window.open(map[network], "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <div className="pt-28 max-w-7xl mx-auto px-6">
        <Link to="/books" className="inline-flex items-center gap-2 text-sm text-storm-silver/60 hover:text-white mb-8" data-testid="back-to-books">
          <ArrowLeft className="w-4 h-4" /> All Books
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative">
            <div className="absolute -inset-6 bg-storm-blue/15 blur-[80px] rounded-full" />
            <img src={book.cover} alt={book.title} className="relative rounded-2xl w-full max-w-md mx-auto border border-white/10 shadow-2xl" data-testid="book-detail-cover" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-xs tracking-[0.22em] uppercase text-storm-blue/90">{book.category}</span>
              <StatusBadge status={book.status} />
              {book.series_order && <span className="rounded-full border border-storm-gold/30 bg-storm-gold/10 px-3 py-1 text-xs font-semibold text-storm-gold">Book {book.series_order}</span>}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight" data-testid="book-detail-title">{book.title}</h1>
            {book.subtitle && <p className="mt-2 text-storm-silver/70 italic text-lg">{book.subtitle}</p>}
            <p className="mt-3 text-storm-silver/60">by <span className="text-white">Will Scott</span></p>

            <p className="mt-6 text-storm-silver/80 leading-relaxed font-light">{book.summary}</p>

            {previousInSeries && (
              <div className="mt-7 rounded-2xl border border-storm-gold/25 bg-storm-gold/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-storm-gold">Start with Book {previousInSeries.series_order}</p>
                <p className="mt-2 text-sm text-storm-silver/80">This story continues from <Link to={`/books/${previousInSeries.id}`} className="font-semibold text-white hover:text-storm-blue">{previousInSeries.title}</Link>.</p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {!soon && book.amazon_link && (
                <GlowButton href={book.amazon_link} variant="gold" data-testid="book-amazon">
                  <ExternalLink className="w-4 h-4" /> View Formats & Buy on Amazon
                </GlowButton>
              )}
              {book.sample_excerpt && (
                <GlowButton to="#sample" variant="secondary" data-testid="book-read-sample">
                  <BookOpenCheck className="w-4 h-4" /> Read a Sample
                </GlowButton>
              )}
              {soon && (
                <GlowButton to="/contact" variant="gold" data-testid="book-notify">
                  <Bell className="w-4 h-4" /> Notify Me When It Releases
                </GlowButton>
              )}
            </div>

            {!soon && (
              <p className="mt-4 text-xs leading-relaxed text-storm-silver/50">
                Amazon displays the current Kindle, paperback, hardcover, price, delivery, and availability options.
              </p>
            )}

            <div className="mt-8 flex items-center gap-3">
              <span className="text-xs text-storm-silver/50 flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share:</span>
              <button onClick={() => share("facebook")} data-testid="share-facebook" aria-label="Share on Facebook" className="text-storm-silver/60 hover:text-white"><Facebook className="w-4 h-4" /></button>
              <button onClick={() => share("twitter")} data-testid="share-twitter" aria-label="Share on X" className="text-storm-silver/60 hover:text-white"><Twitter className="w-4 h-4" /></button>
              <button onClick={() => share("copy")} data-testid="share-copy" aria-label="Copy book link" className="text-storm-silver/60 hover:text-white"><LinkIcon className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 mt-20">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-white mb-4">About This Book</h2>
            <p className="text-storm-silver/75 leading-relaxed font-light whitespace-pre-line">{book.description}</p>
            {book.author_note && (
              <div className="mt-8 glass rounded-2xl p-6 border-l-2 border-storm-gold/60">
                <p className="text-xs tracking-widest uppercase text-storm-gold/80 mb-2">From the Author</p>
                <p className="text-storm-silver/85 italic font-light">{book.author_note}</p>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6 h-fit">
            <p className="text-xs tracking-widest uppercase text-storm-blue/80">Book Details</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="text-storm-silver/50">Author</dt><dd className="mt-1 text-white">Will Scott</dd></div>
              <div><dt className="text-storm-silver/50">Category</dt><dd className="mt-1 text-white">{book.category}</dd></div>
              {book.formats?.length > 0 && <div><dt className="text-storm-silver/50">Listed formats</dt><dd className="mt-1 text-white">{book.formats.join(", ")}</dd></div>}
              {book.series_order && <div><dt className="text-storm-silver/50">Series order</dt><dd className="mt-1 text-white">Book {book.series_order}</dd></div>}
              <div><dt className="text-storm-silver/50">Availability</dt><dd className="mt-1 text-white">{soon ? "Coming soon" : "See Amazon for current availability"}</dd></div>
            </dl>
          </div>
        </div>

        {book.sample_excerpt && (
          <section id="sample" className="mt-20 scroll-mt-28 max-w-4xl">
            <Overline className="mb-3">A Look Inside</Overline>
            <h2 className="font-display text-3xl font-bold text-white mb-6">Read a Sample</h2>
            <div className="wet-glass rounded-3xl border border-white/10 p-7 sm:p-10">
              <p className="whitespace-pre-line font-display text-lg leading-8 text-storm-silver/85">{book.sample_excerpt}</p>
            </div>
          </section>
        )}

        {book.trailer_url && (
          <section className="mt-20 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Book Trailer</h2>
            <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
              <iframe title={`${book.title} trailer`} className="w-full h-full" src={book.trailer_url} allowFullScreen />
            </div>
          </section>
        )}

        {book.reviews?.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Reader Reviews</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {book.reviews.map((review, index) => (
                <div key={`${review.name}-${index}`} className="glass rounded-2xl p-6" data-testid={`review-${index}`}>
                  <div className="flex gap-0.5 mb-3">{Array.from({ length: review.rating }).map((_, starIndex) => <Star key={starIndex} className="w-4 h-4 fill-storm-gold text-storm-gold" />)}</div>
                  <p className="text-storm-silver/80 text-sm font-light leading-relaxed">“{review.text}”</p>
                  <p className="mt-3 text-white text-sm font-medium">— {review.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-20 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="glass rounded-2xl px-6">
            <AccordionItem value="q1"><AccordionTrigger className="text-white">Where can I buy this book?</AccordionTrigger><AccordionContent className="text-storm-silver/70">Published titles link directly to their official Amazon listing. Amazon shows the formats, pricing, and delivery options currently available in your location.</AccordionContent></AccordionItem>
            <AccordionItem value="q2"><AccordionTrigger className="text-white">Is this part of a series?</AccordionTrigger><AccordionContent className="text-storm-silver/70">{book.series_order ? `Yes. This is Book ${book.series_order}. Follow the series guidance above so you begin in the right place.` : "This title currently stands on its own unless a series is identified on this page."}</AccordionContent></AccordionItem>
            <AccordionItem value="q3"><AccordionTrigger className="text-white">Will more details be added here?</AccordionTrigger><AccordionContent className="text-storm-silver/70">Yes. Real trailers, reader reviews, excerpts, and behind-the-book stories will be added as they become available. Nothing will be invented just to fill the page.</AccordionContent></AccordionItem>
          </Accordion>
        </div>

        {relatedBooks.length > 0 && (
          <div className="mt-20">
            <Overline className="mb-3">You might also love</Overline>
            <h2 className="font-display text-2xl font-bold text-white mb-6">Recommended Reading</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">{relatedBooks.map((item) => <BookCard key={item.id} book={item} />)}</div>
          </div>
        )}
      </div>
      <div className="mt-20"><NewsletterSection /></div>
    </div>
  );
}
