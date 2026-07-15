from datetime import datetime, timezone
from typing import List, Optional
import uuid

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from starlette.middleware.cors import CORSMiddleware

import seed_data
import books_data

app = FastAPI(title="StormAndMeOfficial API")
api_router = APIRouter(prefix="/api")

contact_messages = []
newsletter_signups = {}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def find_by_id(items, item_id: str):
    return next((item for item in items if item.get("id") == item_id), None)


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
    type: str
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


@api_router.get("/")
async def root():
    return {"message": "StormAndMeOfficial API", "status": "ready"}


@api_router.get("/health")
async def health():
    return {"ok": True}


@api_router.get("/books")
async def get_books(category: Optional[str] = None):
    books = [dict(item) for item in books_data.BOOKS]
    if category and category != "All":
        books = [book for book in books if category in book.get("categories", [])]
    return books


@api_router.get("/books/categories")
async def get_book_categories():
    return books_data.BOOK_CATEGORIES


@api_router.get("/books/{book_id}")
async def get_book(book_id: str):
    book = find_by_id(books_data.BOOKS, book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    return book


@api_router.get("/music")
async def get_music():
    return seed_data.MUSIC


@api_router.get("/music/{music_id}")
async def get_music_item(music_id: str):
    music = find_by_id(seed_data.MUSIC, music_id)
    if not music:
        raise HTTPException(404, "Music not found")
    return music


@api_router.get("/videos")
async def get_videos():
    return seed_data.VIDEOS


@api_router.get("/products")
async def get_products(category: Optional[str] = None):
    products = [dict(item) for item in seed_data.PRODUCTS]
    if category and category != "All":
        products = [product for product in products if category in product.get("categories", [])]
    return products


@api_router.get("/products/categories")
async def get_product_categories():
    return seed_data.PRODUCT_CATEGORIES


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = find_by_id(seed_data.PRODUCTS, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@api_router.get("/posts")
async def get_posts():
    return seed_data.POSTS


@api_router.get("/posts/{post_id}")
async def get_post(post_id: str):
    post = find_by_id(seed_data.POSTS, post_id)
    if not post:
        raise HTTPException(404, "Post not found")
    return post


@api_router.get("/faqs")
async def get_faqs():
    return seed_data.FAQS


@api_router.post("/contact")
async def submit_contact(payload: ContactCreate):
    doc = payload.model_dump()
    doc.update({"id": str(uuid.uuid4()), "created_at": now_iso()})
    contact_messages.append(doc)
    return {"success": True, "message": "Thank you for reaching out. Your message is on its way—I read every one."}


@api_router.post("/newsletter")
async def subscribe_newsletter(payload: NewsletterCreate):
    email_key = str(payload.email).lower()
    if email_key in newsletter_signups:
        return {"success": True, "message": "You're already part of the family."}
    newsletter_signups[email_key] = {**payload.model_dump(), "id": str(uuid.uuid4()), "created_at": now_iso()}
    return {"success": True, "message": "Welcome to the family. Watch your inbox."}


@api_router.post("/checkout/session")
async def create_checkout(_: CheckoutCreate):
    raise HTTPException(503, "Direct checkout is being connected. Please use the official shop link for now.")


@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str):
    return {"status": "unavailable", "session_id": session_id}


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
