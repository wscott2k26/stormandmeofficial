import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingBag, ExternalLink, Star, Share2, Facebook, Twitter, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getBook, getBooks } from "../lib/api";
import { useCart } from "../context/CartContext";
import { GlowButton, NewsletterSection, StatusBadge, Overline } from "../components/shared";
import { BookCard } from "../components/cards";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [format, setFormat] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    getBook(id).then((b) => { setBook(b); setFormat(b.formats?.[0]); }).catch(() => setBook(false));
    getBooks().then((all) => setRelated(all)).catch(() => {});
  }, [id]);

  if (book === false) return <div className="pt-40 pb-40 text-center text-storm-silver/60">Book not found. <Link to="/books" className="text-storm-blue">Back to books</Link></div>;
  if (!book) return <div className="pt-40 pb-40 text-center text-storm-silver/50">Loading...</div>;

  const soon = book.status === "coming_soon";
  const relatedBooks = related.filter((b) => (book.related || []).includes(b.id));

  const buy = () => {
    addItem({ id: book.id, type: "book", quantity: 1, format, unitPrice: book.price, name: book.title, image: book.cover });
    toast.success(`"${book.title}" added to cart`);
  };

  const share = (net) => {
    const url = window.location.href;
    const map = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(book.title)}`,
    };
    if (net === "copy") { navigator.clipboard.writeText(url); toast.success("Link copied"); return; }
    window.open(map[net], "_blank");
  };

  return (
    <div>
      <div className="pt-28 max-w-7xl mx-auto px-6">
        <Link to="/books" className="inline-flex items-center gap-2 text-sm text-storm-silver/60 hover:text-white mb-8" data-testid="back-to-books"><ArrowLeft className="w-4 h-4" /> All Books</Link>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative">
            <div className="absolute -inset-6 bg-storm-blue/15 blur-[80px] rounded-full" />
            <img src={book.cover} alt={book.title} className="relative rounded-2xl w-full max-w-md mx-auto border border-white/10 shadow-2xl" data-testid="book-detail-cover" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs tracking-[0.22em] uppercase text-storm-blue/90">{book.category}</span>
              <StatusBadge status={book.status} />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight" data-testid="book-detail-title">{book.title}</h1>
            {book.subtitle && <p className="mt-2 text-storm-silver/70 italic text-lg">{book.subtitle}</p>}
            <p className="mt-3 text-storm-silver/60">by <span className="text-white">Willy Will</span></p>
            <p className="mt-6 text-2xl font-semibold text-white">{soon ? "Coming Soon" : `$${book.price.toFixed(2)}`}</p>

            <p className="mt-6 text-storm-silver/80 leading-relaxed font-light">{book.summary}</p>

            {!soon && (
              <>
                <div className="mt-7">
                  <p className="text-xs tracking-widest uppercase text-storm-silver/50 mb-3">Format</p>
                  <div className="flex flex-wrap gap-2" data-testid="book-format-options">
                    {book.formats.map((f) => (
                      <button key={f} onClick={() => setFormat(f)} data-testid={`book-format-${f.toLowerCase()}`}
                        className={`px-4 py-2 rounded-full text-sm border transition-all ${format === f ? "bg-white text-black border-white" : "border-white/20 text-storm-silver/80 hover:border-white/40"}`}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <GlowButton onClick={buy} data-testid="book-buy-now"><ShoppingBag className="w-4 h-4" /> Buy Now</GlowButton>
                  {book.amazon_link && <GlowButton href={book.amazon_link} variant="gold" data-testid="book-amazon"><ExternalLink className="w-4 h-4" /> Buy on Amazon</GlowButton>}
                  {book.amazon_link && <GlowButton href={book.amazon_link} variant="secondary" data-testid="book-retailers">Other Retailers</GlowButton>}
                </div>
              </>
            )}
            {soon && <div className="mt-8"><GlowButton to="/contact" variant="gold" data-testid="book-notify">Notify Me When It Releases</GlowButton></div>}

            <div className="mt-8 flex items-center gap-3">
              <span className="text-xs text-storm-silver/50 flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share:</span>
              <button onClick={() => share("facebook")} data-testid="share-facebook" className="text-storm-silver/60 hover:text-white"><Facebook className="w-4 h-4" /></button>
              <button onClick={() => share("twitter")} data-testid="share-twitter" className="text-storm-silver/60 hover:text-white"><Twitter className="w-4 h-4" /></button>
              <button onClick={() => share("copy")} data-testid="share-copy" className="text-storm-silver/60 hover:text-white"><LinkIcon className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Description + trailer */}
        <div className="grid lg:grid-cols-3 gap-10 mt-20">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-white mb-4">About This Book</h2>
            <p className="text-storm-silver/75 leading-relaxed font-light whitespace-pre-line">{book.description}</p>
            {book.author_note && (
              <div className="mt-8 glass rounded-2xl p-6 border-l-2 border-storm-gold/60">
                <p className="text-xs tracking-widest uppercase text-storm-gold/80 mb-2">Author Note</p>
                <p className="text-storm-silver/85 italic font-light">{book.author_note}</p>
              </div>
            )}
          </div>
          {book.trailer_url && (
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-4">Book Trailer</h2>
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
                <iframe title="Book trailer" className="w-full h-full" src={book.trailer_url} allowFullScreen />
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        {book.reviews?.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Reader Reviews</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {book.reviews.map((r, i) => (
                <div key={i} className="glass rounded-2xl p-6" data-testid={`review-${i}`}>
                  <div className="flex gap-0.5 mb-3">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-storm-gold text-storm-gold" />)}</div>
                  <p className="text-storm-silver/80 text-sm font-light leading-relaxed">"{r.text}"</p>
                  <p className="mt-3 text-white text-sm font-medium">— {r.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-20 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="glass rounded-2xl px-6">
            <AccordionItem value="q1"><AccordionTrigger className="text-white">What formats are available?</AccordionTrigger><AccordionContent className="text-storm-silver/70">{book.formats?.join(", ")}.</AccordionContent></AccordionItem>
            <AccordionItem value="q2"><AccordionTrigger className="text-white">Can I get a signed copy?</AccordionTrigger><AccordionContent className="text-storm-silver/70">Select titles are available signed in the Shop under Limited Edition.</AccordionContent></AccordionItem>
            <AccordionItem value="q3"><AccordionTrigger className="text-white">How fast does it ship?</AccordionTrigger><AccordionContent className="text-storm-silver/70">Print books ship within 3–5 business days. Ebooks are delivered instantly.</AccordionContent></AccordionItem>
          </Accordion>
        </div>

        {/* Related */}
        {relatedBooks.length > 0 && (
          <div className="mt-20">
            <Overline className="mb-3">You might also love</Overline>
            <h2 className="font-display text-2xl font-bold text-white mb-6">Recommended Reading</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">{relatedBooks.map((b) => <BookCard key={b.id} book={b} />)}</div>
          </div>
        )}
      </div>
      <div className="mt-20"><NewsletterSection /></div>
    </div>
  );
}
