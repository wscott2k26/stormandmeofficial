# StormAndMeOfficial.com — PRD

## Original Problem Statement
Premium, cinematic, mobile-friendly full website for **StormAndMeOfficial.com** — the official home of creator **Willy Will** (public logo "STORM & ME OFFICIAL"). Sells/showcases books, music, videos, merchandise, personal story, news. Dark storm aesthetic with site-wide animated rain + occasional lightning. Brand message: "The storm may have changed me, but it did not finish me." / "The storm does not get the final word."

## User Choices
- Full-stack (React + FastAPI + MongoDB)
- Payments: **Stripe** hosted checkout (test mode, key `sk_test_emergent`)
- Contact + newsletter: store in DB (no email sending)
- Images: custom-generated (logo, hero, portrait, book covers, album) + stock (merch, studio)

## Architecture
- **Frontend**: React (CRA/craco), Tailwind, shadcn/ui, framer-motion, sonner. Fonts: Playfair Display (display) + Manrope (body).
- **Storm effects**: custom canvas rain (`StormBackground.js`, mobile-reduced drop count) + CSS lightning flashes every 12–25s; global motion toggle (nav cloud icon) + `prefers-reduced-motion` support.
- **Backend**: FastAPI, all routes `/api` prefixed; content auto-seeded on startup from `seed_data.py`. Cart is client-side (localStorage); backend recomputes authoritative prices/tax/shipping/coupons at checkout.
- **Collections**: books, music, videos, products, posts, newsletter, contact_messages, orders, payment_transactions.

## Implemented (2026-06)
- 23 pages/routes: Home, Books, BookDetail, Music, MusicDetail, Videos, Shop, ProductDetail, About, Story, News, PostDetail, Contact, FAQ, Cart, Checkout, OrderConfirmation, Account, Privacy/Terms/Shipping/Returns/Accessibility.
- Homepage: hero, welcome+portrait, featured books, music, YouTube channel, merch, about teaser, newsletter, social.
- 8 books w/ category filters + detail (formats, Amazon/retailer links, trailer, reviews, author note, FAQ, related, share).
- Music catalog w/ audio previews, streaming/purchase links, album/song detail, behind-the-song, lyrics, video.
- Videos w/ featured player, type filters, load more, YouTube subscribe.
- 8 products w/ filters, size/color/qty, related products.
- Full cart → Stripe checkout (coupons STORM10/STILLHERE, shipping tiers, 8% tax) → order confirmation polling → guest order tracking on /account.
- Contact form (12 reasons) + newsletter (idempotent), FAQ accordion.
- SEO meta/OG tags, sticky glass nav (search, cart badge, motion toggle, mobile drawer), cinematic footer, legal pages.
- Tested: 20/20 backend pytest pass, all frontend flows pass, live Stripe redirect verified.

## Backlog / Remaining
- **P1**: Video detail page + `/api/videos/{id}`; wishlist & recently-viewed; real customer accounts/auth.
- **P1**: Replace placeholder social/YouTube/Amazon links + audio/video with Willy Will's real links.
- **P2**: `/api/pricing/config` endpoint to de-duplicate coupon/tax/shipping constants between server.py and Checkout.js.
- **P2**: Real email receipts (Resend), Printful/Printify fulfillment, product schema/JSON-LD, blog CMS/admin.
- **P2**: Skip Mongo write in /checkout/status when status already terminal (expired/canceled).

## Next Tasks
1. Gather Willy Will's real links/content to swap out placeholders.
2. Decide on customer accounts (JWT vs Google) if desired.
