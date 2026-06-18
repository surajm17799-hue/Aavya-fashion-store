from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

app = FastAPI(title="Aavya Fashion and Jewellery API")
api_router = APIRouter(prefix="/api")


# ----------------------- Models -----------------------
def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    category: str  # earrings | necklaces | bridal | oxidised
    price: float
    compare_at_price: Optional[float] = None
    discount_pct: Optional[int] = None
    images: List[str]
    description: str
    styling_tips: str
    material: str = "Brass with Gold Plating"
    cod_available: bool = True
    rating: float = 4.7
    reviews_count: int = 0
    badges: List[str] = []
    is_best_seller: bool = False
    is_trending: bool = False
    stock: int = 50


class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: Optional[str] = None
    name: str
    location: Optional[str] = None
    rating: int = 5
    comment: str
    image: Optional[str] = None
    created_at: str = Field(default_factory=iso_now)


class CartItem(BaseModel):
    product_id: str
    name: str
    image: str
    price: float
    quantity: int


class Address(BaseModel):
    full_name: str
    phone: str
    line1: str
    line2: Optional[str] = ""
    city: str
    state: str
    pincode: str
    email: Optional[EmailStr] = None

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, v):
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        return v


class CheckoutInit(BaseModel):
    items: List[CartItem]
    address: Address
    coupon_code: Optional[str] = None
    payment_method: str  # "stripe" | "cod"
    origin_url: str


class CouponApply(BaseModel):
    code: str
    subtotal: float


class NewsletterSignup(BaseModel):
    email: EmailStr


# ----------------------- Seed Data -----------------------
SEED_PRODUCTS: List[Dict[str, Any]] = [
    {
        "name": "Royal Kundan Bridal Set",
        "slug": "royal-kundan-bridal-set",
        "category": "bridal",
        "price": 4499.0,
        "compare_at_price": 7999.0,
        "discount_pct": 44,
        "images": [
            "https://images.unsplash.com/photo-1756483560049-e7b2208f99a0?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
            "https://images.unsplash.com/photo-1570212773364-e30cd076539e?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
            "https://images.pexels.com/photos/19647000/pexels-photo-19647000.jpeg?auto=compress&cs=tinysrgb&w=900",
        ],
        "description": "An exquisite kundan bridal set featuring intricate gold-plated craftsmanship, pearl drops, and ruby accents. Includes a regal choker, matching jhumkas, maang tikka, and nath. Crafted to complete your bridal vision.",
        "styling_tips": "Pair this set with a rich red or emerald lehenga. Style your hair in a low bun adorned with fresh jasmine for a timeless bridal look.",
        "rating": 4.9,
        "reviews_count": 184,
        "badges": ["Bestseller", "New"],
        "is_best_seller": True,
        "is_trending": True,
    },
    {
        "name": "Meera Pearl Drop Jhumkas",
        "slug": "meera-pearl-drop-jhumkas",
        "category": "earrings",
        "price": 899.0,
        "compare_at_price": 1499.0,
        "discount_pct": 40,
        "images": [
            "https://images.pexels.com/photos/20074769/pexels-photo-20074769.jpeg?auto=compress&cs=tinysrgb&w=900",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
        ],
        "description": "Lightweight gold-plated jhumkas with hand-strung pearls and delicate filigree work. Perfect for festive evenings and intimate gatherings.",
        "styling_tips": "Wear with an open hairstyle and a pastel saree or anarkali. Pair with a slim bangle stack for elegance.",
        "rating": 4.8,
        "reviews_count": 92,
        "badges": ["Trending"],
        "is_trending": True,
    },
    {
        "name": "Aanya Layered Choker",
        "slug": "aanya-layered-choker",
        "category": "necklaces",
        "price": 1799.0,
        "compare_at_price": 2999.0,
        "discount_pct": 40,
        "images": [
            "https://images.pexels.com/photos/19647000/pexels-photo-19647000.jpeg?auto=compress&cs=tinysrgb&w=900",
            "https://images.pexels.com/photos/35921022/pexels-photo-35921022.jpeg?auto=compress&cs=tinysrgb&w=900",
        ],
        "description": "A statement two-layer choker featuring temple-inspired motifs and a single ruby pendant drop. Adjustable backstring for the perfect fit.",
        "styling_tips": "A showstopper with sarees and lehengas. Keep earrings minimal to let the choker shine.",
        "rating": 4.7,
        "reviews_count": 67,
        "is_best_seller": True,
    },
    {
        "name": "Chandni Oxidised Jhumka",
        "slug": "chandni-oxidised-jhumka",
        "category": "oxidised",
        "price": 549.0,
        "compare_at_price": 999.0,
        "discount_pct": 45,
        "images": [
            "https://images.unsplash.com/photo-1626784214765-754de4c5a77b?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
            "https://images.pexels.com/photos/15650527/pexels-photo-15650527.jpeg?auto=compress&cs=tinysrgb&w=900",
        ],
        "description": "Boho-chic oxidised silver jhumkas with intricate tribal motifs and mirror accents. A staple for the modern free-spirited woman.",
        "styling_tips": "Style with kurtis, fusion outfits, or a plain white linen dress for an effortless boho look.",
        "rating": 4.6,
        "reviews_count": 213,
        "is_trending": True,
    },
    {
        "name": "Saanvi Polki Necklace",
        "slug": "saanvi-polki-necklace",
        "category": "necklaces",
        "price": 2999.0,
        "compare_at_price": 4999.0,
        "discount_pct": 40,
        "images": [
            "https://images.pexels.com/photos/35921022/pexels-photo-35921022.jpeg?auto=compress&cs=tinysrgb&w=900",
            "https://images.pexels.com/photos/19647000/pexels-photo-19647000.jpeg?auto=compress&cs=tinysrgb&w=900",
        ],
        "description": "Uncut polki necklace with emerald drops, set in 22k gold-plated brass. Heirloom-style design for grand celebrations.",
        "styling_tips": "Best paired with traditional silk sarees or velvet lehengas. Add matching earrings for a complete bridal effect.",
        "rating": 4.9,
        "reviews_count": 128,
        "is_best_seller": True,
    },
    {
        "name": "Ishika Crystal Studs",
        "slug": "ishika-crystal-studs",
        "category": "earrings",
        "price": 449.0,
        "compare_at_price": 799.0,
        "discount_pct": 44,
        "images": [
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
            "https://images.pexels.com/photos/20074769/pexels-photo-20074769.jpeg?auto=compress&cs=tinysrgb&w=900",
        ],
        "description": "Delicate crystal studs that catch every light. Hypoallergenic posts. The everyday essential.",
        "styling_tips": "Wear them daily — from office to brunch to date night. Pairs with everything.",
        "rating": 4.8,
        "reviews_count": 304,
        "is_trending": True,
    },
    {
        "name": "Tara Temple Bridal Combo",
        "slug": "tara-temple-bridal-combo",
        "category": "bridal",
        "price": 5499.0,
        "compare_at_price": 9999.0,
        "discount_pct": 45,
        "images": [
            "https://images.unsplash.com/photo-1570212773364-e30cd076539e?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
            "https://images.unsplash.com/photo-1756483560049-e7b2208f99a0?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
        ],
        "description": "Antique temple-style bridal combo featuring Goddess Lakshmi motifs. Includes haar, choker, jhumkas, vanki and maang tikka.",
        "styling_tips": "Drape a kanjeevaram silk saree and adorn yourself with this set for a divine South Indian bridal look.",
        "rating": 4.9,
        "reviews_count": 76,
        "is_best_seller": True,
    },
    {
        "name": "Naina Oxidised Statement Set",
        "slug": "naina-oxidised-statement-set",
        "category": "oxidised",
        "price": 1199.0,
        "compare_at_price": 1999.0,
        "discount_pct": 40,
        "images": [
            "https://images.pexels.com/photos/15650527/pexels-photo-15650527.jpeg?auto=compress&cs=tinysrgb&w=900",
            "https://images.unsplash.com/photo-1626784214765-754de4c5a77b?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
        ],
        "description": "Bold oxidised silver necklace with matching earrings. Hand-crafted by Jaipur artisans with antique finish.",
        "styling_tips": "Pair with handloom cotton sarees or indo-western outfits. Add kohl-rimmed eyes for impact.",
        "rating": 4.7,
        "reviews_count": 145,
        "is_best_seller": True,
    },
]

SEED_REVIEWS: List[Dict[str, Any]] = [
    {
        "name": "Ananya Sharma",
        "location": "Mumbai",
        "rating": 5,
        "comment": "The Royal Kundan set made my wedding day magical. Quality is unreal for the price — looks like real heirloom jewellery!",
        "image": "https://images.unsplash.com/photo-1532039956299-1614b86a6d2f?crop=entropy&cs=srgb&fm=jpg&w=300&q=85",
    },
    {
        "name": "Priya Iyer",
        "location": "Bengaluru",
        "rating": 5,
        "comment": "I have ordered three sets from Aavya now. The packaging feels luxurious, and the gold finish stays beautiful even after months.",
        "image": "https://images.pexels.com/photos/17557255/pexels-photo-17557255.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
    {
        "name": "Riya Mehta",
        "location": "Delhi",
        "rating": 5,
        "comment": "Got compliments all night at my cousin's sangeet. The Aanya choker is now my forever favourite.",
        "image": "https://images.unsplash.com/photo-1613966561243-c6959a886009?crop=entropy&cs=srgb&fm=jpg&w=300&q=85",
    },
    {
        "name": "Sneha Kapoor",
        "location": "Jaipur",
        "rating": 4,
        "comment": "Fast shipping and COD made it so easy. My oxidised jhumkas are stunning. Will order again!",
        "image": "https://images.pexels.com/photos/8050079/pexels-photo-8050079.jpeg?auto=compress&cs=tinysrgb&w=300",
    },
]


COUPONS = {
    "AAVYA10": {"type": "percent", "value": 10, "min_subtotal": 0, "description": "10% off your first order"},
    "WEEKEND15": {"type": "percent", "value": 15, "min_subtotal": 1500, "description": "Weekend Sale 15% off"},
    "BRIDAL500": {"type": "flat", "value": 500, "min_subtotal": 3500, "description": "Flat ₹500 off bridal orders"},
}


async def seed_data():
    count = await db.products.count_documents({})
    if count == 0:
        docs = []
        for p in SEED_PRODUCTS:
            prod = Product(**p)
            docs.append(prod.model_dump())
        await db.products.insert_many(docs)
        logging.info(f"Seeded {len(docs)} products")
    rcount = await db.reviews.count_documents({})
    if rcount == 0:
        rdocs = [Review(**r).model_dump() for r in SEED_REVIEWS]
        await db.reviews.insert_many(rdocs)
        logging.info(f"Seeded {len(rdocs)} reviews")


# ----------------------- Routes -----------------------
@api_router.get("/")
async def root():
    return {"message": "Aavya Fashion API", "status": "ok"}


@api_router.get("/products", response_model=List[Product])
async def list_products(category: Optional[str] = None, trending: Optional[bool] = None, best: Optional[bool] = None):
    q: Dict[str, Any] = {}
    if category and category != "all":
        q["category"] = category
    if trending:
        q["is_trending"] = True
    if best:
        q["is_best_seller"] = True
    docs = await db.products.find(q, {"_id": 0}).to_list(200)
    return docs


@api_router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    return doc


@api_router.get("/reviews")
async def list_reviews(product_id: Optional[str] = None):
    q: Dict[str, Any] = {}
    if product_id:
        q["product_id"] = product_id
    docs = await db.reviews.find(q, {"_id": 0}).to_list(100)
    return docs


@api_router.post("/coupon/apply")
async def apply_coupon(payload: CouponApply):
    code = payload.code.strip().upper()
    coupon = COUPONS.get(code)
    if not coupon:
        raise HTTPException(400, "Invalid coupon code")
    if payload.subtotal < coupon["min_subtotal"]:
        raise HTTPException(400, f"Minimum order ₹{coupon['min_subtotal']} required")
    if coupon["type"] == "percent":
        discount = round(payload.subtotal * coupon["value"] / 100, 2)
    else:
        discount = float(coupon["value"])
    return {
        "code": code,
        "discount": discount,
        "description": coupon["description"],
        "type": coupon["type"],
        "value": coupon["value"],
    }


@api_router.post("/newsletter")
async def newsletter(payload: NewsletterSignup):
    existing = await db.newsletter.find_one({"email": payload.email})
    if existing:
        return {"success": True, "message": "You're already subscribed!", "coupon": "AAVYA10"}
    await db.newsletter.insert_one({
        "id": str(uuid.uuid4()),
        "email": payload.email,
        "created_at": iso_now(),
    })
    return {"success": True, "message": "Welcome! Use AAVYA10 for 10% off.", "coupon": "AAVYA10"}


def _calc_order(items: List[CartItem], coupon_code: Optional[str]):
    subtotal = round(sum(i.price * i.quantity for i in items), 2)
    shipping = 0.0 if subtotal >= 999 else 99.0
    discount = 0.0
    applied = None
    if coupon_code:
        coupon = COUPONS.get(coupon_code.strip().upper())
        if coupon and subtotal >= coupon["min_subtotal"]:
            if coupon["type"] == "percent":
                discount = round(subtotal * coupon["value"] / 100, 2)
            else:
                discount = float(coupon["value"])
            applied = coupon_code.strip().upper()
    total = round(subtotal + shipping - discount, 2)
    return subtotal, shipping, discount, total, applied


@api_router.post("/checkout")
async def checkout(payload: CheckoutInit, request: Request):
    if not payload.items:
        raise HTTPException(400, "Cart is empty")

    # Re-fetch real prices from DB to avoid frontend manipulation
    server_items: List[CartItem] = []
    for ci in payload.items:
        prod = await db.products.find_one({"id": ci.product_id}, {"_id": 0})
        if not prod:
            raise HTTPException(400, f"Product {ci.product_id} not found")
        server_items.append(CartItem(
            product_id=prod["id"],
            name=prod["name"],
            image=prod["images"][0],
            price=float(prod["price"]),
            quantity=max(1, int(ci.quantity)),
        ))

    subtotal, shipping, discount, total, applied = _calc_order(server_items, payload.coupon_code)
    order_id = str(uuid.uuid4())
    order_number = f"AAV{datetime.now(timezone.utc).strftime('%y%m%d')}{str(uuid.uuid4())[:4].upper()}"

    order_doc = {
        "id": order_id,
        "order_number": order_number,
        "items": [i.model_dump() for i in server_items],
        "address": payload.address.model_dump(),
        "subtotal": subtotal,
        "shipping": shipping,
        "discount": discount,
        "coupon_code": applied,
        "total": total,
        "payment_method": payload.payment_method,
        "payment_status": "pending",
        "status": "placed" if payload.payment_method == "cod" else "awaiting_payment",
        "created_at": iso_now(),
    }
    await db.orders.insert_one(order_doc)

    if payload.payment_method == "cod":
        return {
            "order_id": order_id,
            "order_number": order_number,
            "total": total,
            "payment_method": "cod",
            "checkout_url": None,
        }

    # Stripe checkout
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Payment gateway not configured")

    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/order/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/checkout"

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{str(request.base_url).rstrip('/')}/api/webhook/stripe")
    session_req = CheckoutSessionRequest(
        amount=float(total),
        currency="inr",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": order_id,
            "order_number": order_number,
            "customer_email": payload.address.email or "",
        },
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(session_req)

    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "order_id": order_id,
        "amount": total,
        "currency": "inr",
        "payment_status": "initiated",
        "status": "open",
        "metadata": {"order_number": order_number},
        "created_at": iso_now(),
        "updated_at": iso_now(),
    })

    await db.orders.update_one({"id": order_id}, {"$set": {"stripe_session_id": session.session_id}})

    return {
        "order_id": order_id,
        "order_number": order_number,
        "total": total,
        "payment_method": "stripe",
        "checkout_url": session.url,
        "session_id": session.session_id,
    }


@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not txn:
        raise HTTPException(404, "Session not found")

    # If already paid, don't double process
    if txn.get("payment_status") == "paid":
        order = await db.orders.find_one({"id": txn["order_id"]}, {"_id": 0})
        return {
            "payment_status": "paid",
            "status": "complete",
            "order_number": order.get("order_number") if order else None,
        }

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{str(request.base_url).rstrip('/')}/api/webhook/stripe")
    cs: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    new_payment_status = cs.payment_status
    new_status = cs.status
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {"payment_status": new_payment_status, "status": new_status, "updated_at": iso_now()}},
    )

    if new_payment_status == "paid":
        await db.orders.update_one(
            {"id": txn["order_id"]},
            {"$set": {"payment_status": "paid", "status": "confirmed", "updated_at": iso_now()}},
        )

    order = await db.orders.find_one({"id": txn["order_id"]}, {"_id": 0})
    return {
        "payment_status": new_payment_status,
        "status": new_status,
        "order_number": order.get("order_number") if order else None,
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{str(request.base_url).rstrip('/')}/api/webhook/stripe")
    try:
        evt = await stripe_checkout.handle_webhook(body, sig)
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(400, "Invalid webhook")

    if evt.session_id:
        await db.payment_transactions.update_one(
            {"session_id": evt.session_id},
            {"$set": {"payment_status": evt.payment_status, "updated_at": iso_now()}},
        )
        if evt.payment_status == "paid":
            txn = await db.payment_transactions.find_one({"session_id": evt.session_id}, {"_id": 0})
            if txn:
                await db.orders.update_one(
                    {"id": txn["order_id"]},
                    {"$set": {"payment_status": "paid", "status": "confirmed", "updated_at": iso_now()}},
                )
    return {"received": True}


@api_router.get("/order/{order_number}")
async def get_order(order_number: str):
    order = await db.orders.find_one({"order_number": order_number.strip().upper()}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    return order


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await seed_data()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
