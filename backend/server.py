from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest,
)
import seed_data

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

app = FastAPI(title="StormAndMeOfficial API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    reason: str
    subject: str
    message: str


class NewsletterCreate(BaseModel):
    first_name: str
    email: EmailStr


class CartItem(BaseModel):
    id: str
    type: str  # 'book' or 'product'
    quantity: int = 1
    size: Optional[str] = None
    color: Optional[str] = None
    format: Optional[str] = None


class CheckoutCreate(BaseModel):
    items: List[CartItem]
    origin_url: str
    coupon: Optional[str] = None
    email: Optional[str] = None
    shipping: Optional[str] = "standard"


COUPONS = {"STORM10": 0.10, "STILLHERE": 0.15}
SHIPPING_RATES = {"standard": 5.99, "express": 14.99, "digital": 0.0}
TAX_RATE = 0.08


# ---------- Content endpoints ----------
@api_router.get("/")
async def root():
    return {"message": "StormAndMeOfficial API"}


@api_router.get("/books")
async def get_books(category: Optional[str] = None):
    query = {}
    docs = await db.books.find({}, {"_id": 0}).to_list(1000)
    if category and category != "All":
        docs = [b for b in docs if category in b.get("categories", [])]
    return docs


@api_router.get("/books/categories")
async def get_book_categories():
    return seed_data.BOOK_CATEGORIES


@api_router.get("/books/{book_id}")
async def get_book(book_id: str):
    doc = await db.books.find_one({"id": book_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Book not found")
    return doc


@api_router.get("/music")
async def get_music():
    return await db.music.find({}, {"_id": 0}).to_list(1000)


@api_router.get("/music/{music_id}")
async def get_music_item(music_id: str):
    doc = await db.music.find_one({"id": music_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    return doc


@api_router.get("/videos")
async def get_videos():
    return await db.videos.find({}, {"_id": 0}).to_list(1000)


@api_router.get("/products")
async def get_products(category: Optional[str] = None):
    docs = await db.products.find({}, {"_id": 0}).to_list(1000)
    if category and category != "All":
        docs = [p for p in docs if category in p.get("categories", [])]
    return docs


@api_router.get("/products/categories")
async def get_product_categories():
    return seed_data.PRODUCT_CATEGORIES


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    return doc


@api_router.get("/posts")
async def get_posts():
    return await db.posts.find({}, {"_id": 0}).to_list(1000)


@api_router.get("/posts/{post_id}")
async def get_post(post_id: str):
    doc = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Post not found")
    return doc


@api_router.get("/faqs")
async def get_faqs():
    return seed_data.FAQS


# ---------- Forms ----------
@api_router.post("/contact")
async def submit_contact(payload: ContactCreate):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.contact_messages.insert_one(doc)
    return {"success": True, "message": "Thank you for reaching out. Your message is on its way\u2014I read every one."}


@api_router.post("/newsletter")
async def subscribe_newsletter(payload: NewsletterCreate):
    existing = await db.newsletter.find_one({"email": payload.email})
    if existing:
        return {"success": True, "message": "You're already part of the family."}
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.newsletter.insert_one(doc)
    return {"success": True, "message": "Welcome to the family. Watch your inbox."}


# ---------- Checkout / Stripe ----------
async def _price_for(item: CartItem):
    if item.type == "book":
        doc = await db.books.find_one({"id": item.id}, {"_id": 0})
    else:
        doc = await db.products.find_one({"id": item.id}, {"_id": 0})
    if not doc:
        raise HTTPException(400, f"Item not found: {item.id}")
    if item.type == "product" and doc.get("sale_price"):
        price = float(doc["sale_price"])
    else:
        price = float(doc["price"])
    name = doc.get("title") or doc.get("name")
    return price, name


@api_router.post("/checkout/session")
async def create_checkout(payload: CheckoutCreate, request: Request):
    if not payload.items:
        raise HTTPException(400, "Cart is empty")

    subtotal = 0.0
    line_names = []
    for item in payload.items:
        price, name = await _price_for(item)
        subtotal += price * max(1, item.quantity)
        line_names.append(f"{name} x{item.quantity}")

    discount = 0.0
    coupon = (payload.coupon or "").upper().strip()
    if coupon in COUPONS:
        discount = round(subtotal * COUPONS[coupon], 2)

    shipping = SHIPPING_RATES.get(payload.shipping, 5.99)
    taxed_base = max(0.0, subtotal - discount)
    tax = round(taxed_base * TAX_RATE, 2)
    total = round(taxed_base + tax + shipping, 2)

    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    success_url = f"{payload.origin_url}/order-confirmation?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{payload.origin_url}/cart"

    metadata = {"source": "storm_shop", "items": " | ".join(line_names)[:480]}
    req = CheckoutSessionRequest(
        amount=float(total), currency="usd",
        success_url=success_url, cancel_url=cancel_url, metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(req)

    order_doc = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "email": payload.email,
        "items": [i.model_dump() for i in payload.items],
        "subtotal": round(subtotal, 2),
        "discount": discount,
        "coupon": coupon if discount else None,
        "shipping": shipping,
        "tax": tax,
        "amount": total,
        "currency": "usd",
        "payment_status": "initiated",
        "status": "initiated",
        "created_at": now_iso(),
    }
    await db.payment_transactions.insert_one(dict(order_doc))
    await db.orders.insert_one(order_doc)

    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str):
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    existing = await db.payment_transactions.find_one({"session_id": session_id})
    if existing and existing.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": status.payment_status, "status": status.status, "updated_at": now_iso()}},
        )
        await db.orders.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": status.payment_status, "status": status.status, "updated_at": now_iso()}},
        )

    order = await db.orders.find_one({"session_id": session_id}, {"_id": 0})
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "order": order,
    }


@api_router.get("/orders/{session_id}")
async def get_order(session_id: str):
    order = await db.orders.find_one({"session_id": session_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    return order


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature")
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    try:
        result = await stripe_checkout.handle_webhook(body, sig)
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(400, "Webhook error")
    if result.session_id:
        await db.payment_transactions.update_one(
            {"session_id": result.session_id},
            {"$set": {"payment_status": result.payment_status, "updated_at": now_iso()}},
        )
        await db.orders.update_one(
            {"session_id": result.session_id},
            {"$set": {"payment_status": result.payment_status, "updated_at": now_iso()}},
        )
    return {"received": True}


# ---------- Seeding ----------
async def seed():
    if await db.books.count_documents({}) == 0:
        await db.books.insert_many([dict(b) for b in seed_data.BOOKS])
        logger.info("Seeded books")
    if await db.music.count_documents({}) == 0:
        await db.music.insert_many([dict(m) for m in seed_data.MUSIC])
        logger.info("Seeded music")
    if await db.videos.count_documents({}) == 0:
        await db.videos.insert_many([dict(v) for v in seed_data.VIDEOS])
        logger.info("Seeded videos")
    if await db.products.count_documents({}) == 0:
        await db.products.insert_many([dict(p) for p in seed_data.PRODUCTS])
        logger.info("Seeded products")
    if await db.posts.count_documents({}) == 0:
        await db.posts.insert_many([dict(p) for p in seed_data.POSTS])
        logger.info("Seeded posts")


@app.on_event("startup")
async def on_startup():
    await seed()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
