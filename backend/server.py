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
SEED_VERSION = "v2"

app = FastAPI(title="Aavya Fashion and Jewellery API")
api_router = APIRouter(prefix="/api")


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ----------------------- Models -----------------------
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    category: str
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
    payment_method: str
    origin_url: str


class CouponApply(BaseModel):
    code: str
    subtotal: float


class NewsletterSignup(BaseModel):
    email: EmailStr


# ----------------------- Image pool -----------------------
IMG = {
    "bridal_a": "https://images.unsplash.com/photo-1756483560049-e7b2208f99a0?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    "bridal_b": "https://images.unsplash.com/photo-1570212773364-e30cd076539e?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    "bridal_c": "https://images.pexels.com/photos/19647000/pexels-photo-19647000.jpeg?auto=compress&cs=tinysrgb&w=900",
    "necklace_a": "https://images.pexels.com/photos/35921022/pexels-photo-35921022.jpeg?auto=compress&cs=tinysrgb&w=900",
    "necklace_b": "https://images.pexels.com/photos/19647000/pexels-photo-19647000.jpeg?auto=compress&cs=tinysrgb&w=900",
    "earring_a": "https://images.pexels.com/photos/20074769/pexels-photo-20074769.jpeg?auto=compress&cs=tinysrgb&w=900",
    "earring_b": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    "oxidised_a": "https://images.unsplash.com/photo-1626784214765-754de4c5a77b?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    "oxidised_b": "https://images.pexels.com/photos/15650527/pexels-photo-15650527.jpeg?auto=compress&cs=tinysrgb&w=900",
    "lifestyle_a": "https://images.unsplash.com/photo-1532039956299-1614b86a6d2f?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    "lifestyle_b": "https://images.pexels.com/photos/17557255/pexels-photo-17557255.jpeg?auto=compress&cs=tinysrgb&w=900",
    "lifestyle_c": "https://images.unsplash.com/photo-1613966561243-c6959a886009?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
    "lifestyle_d": "https://images.pexels.com/photos/8050079/pexels-photo-8050079.jpeg?auto=compress&cs=tinysrgb&w=900",
}


def P(name, slug, category, price, comp, images, desc, tips, rating=4.7, reviews=80, badges=None, best=False, trending=False):
    return {
        "name": name, "slug": slug, "category": category,
        "price": float(price), "compare_at_price": float(comp),
        "discount_pct": int(round((1 - price / comp) * 100)),
        "images": images, "description": desc, "styling_tips": tips,
        "rating": rating, "reviews_count": reviews,
        "badges": badges or [], "is_best_seller": best, "is_trending": trending,
    }


SEED_PRODUCTS: List[Dict[str, Any]] = [
    # --- Bridal Sets (4)
    P("Royal Kundan Bridal Set", "royal-kundan-bridal-set", "bridal", 4499, 7999, [IMG["bridal_a"], IMG["bridal_b"], IMG["necklace_a"]],
      "An exquisite kundan bridal set featuring intricate gold-plated craftsmanship, pearl drops, and ruby accents. Includes choker, jhumkas, maang tikka, and nath.",
      "Pair with a rich red or emerald lehenga. Style hair in a low bun adorned with fresh jasmine.", 4.9, 184, ["Bestseller", "New"], True, True),
    P("Tara Temple Bridal Combo", "tara-temple-bridal-combo", "bridal", 5499, 9999, [IMG["bridal_b"], IMG["bridal_a"]],
      "Antique temple-style bridal combo featuring Goddess Lakshmi motifs. Includes haar, choker, jhumkas, vanki and maang tikka.",
      "Drape a kanjeevaram silk saree for a divine South Indian bridal look.", 4.9, 76, ["Bestseller"], True, True),
    P("Mahira Polki Bridal Set", "mahira-polki-bridal-set", "bridal", 3899, 6499, [IMG["necklace_a"], IMG["bridal_c"]],
      "Uncut polki diamonds in gold-plated brass, accompanied by emerald and ruby drops. The everlasting bridal classic.",
      "Wear with a velvet maroon lehenga and a sheer dupatta on the head.", 4.8, 102, ["New"], True, True),
    P("Anuradha Heritage Bridal Set", "anuradha-heritage-bridal-set", "bridal", 6299, 11999, [IMG["bridal_c"], IMG["bridal_a"]],
      "A grandmother-worthy bridal set inspired by Rajputana royal heritage. Features pearls, kundan, and intricate meenakari work.",
      "Best with peach or pastel pink lehengas, paired with a maang tikka and nath.", 4.9, 58, ["Premium"], True, False),

    # --- Mehndi Jewellery (4)
    P("Mehndi Special Floral Set", "mehndi-floral-set", "mehndi", 1299, 2499, [IMG["lifestyle_a"], IMG["bridal_a"]],
      "Light-weight floral-themed jewellery in pastel pinks and yellows. Perfect for mehndi ceremonies.",
      "Pair with a yellow or pink lehenga. Don't forget the floral hair gajra.", 4.8, 156, ["Mehndi"], True, True),
    P("Marigold Mehndi Jewellery Set", "marigold-mehndi-set", "mehndi", 999, 1799, [IMG["earring_b"], IMG["lifestyle_a"]],
      "Vibrant marigold-inspired earrings, choker and maang tikka in fresh florals and faux pearls.",
      "Carry a fresh flower bouquet for photos. Looks stunning with mirror work outfits.", 4.7, 92, ["Mehndi"], False, True),
    P("Phoolwati Mehndi Combo", "phoolwati-mehndi-combo", "mehndi", 1499, 2799, [IMG["lifestyle_b"], IMG["earring_a"]],
      "Pink and white floral combo with detachable garlands. Eco-friendly, light-weight design.",
      "Pair with green and pink lehengas for a fresh mehndi ceremony look.", 4.7, 73, [], True, False),
    P("Genda Phool Mehndi Set", "genda-phool-mehndi-set", "mehndi", 849, 1499, [IMG["lifestyle_d"], IMG["earring_b"]],
      "Traditional genda phool (marigold) inspired set with hand-tied silk threads.",
      "Looks best with halter neck blouses and bold mehndi designs.", 4.6, 67, [], False, True),

    # --- Haldi Jewellery (4)
    P("Sunshine Haldi Jewellery Set", "sunshine-haldi-set", "haldi", 1099, 1999, [IMG["earring_b"], IMG["lifestyle_a"]],
      "Bright sunshine yellow floral set perfect for haldi ceremony. Includes earrings, choker and a maathapatti.",
      "Wear with a simple yellow saree or a kurta-dhoti combination.", 4.8, 124, ["Haldi"], True, True),
    P("Turmeric Glow Haldi Set", "turmeric-glow-haldi-set", "haldi", 1299, 2299, [IMG["lifestyle_a"], IMG["earring_a"]],
      "Real turmeric-inspired golden hue jewellery with silk thread tassels. Light-weight and oil-resistant.",
      "Best for traditional haldi photoshoots. Pair with bare feet and a flower crown.", 4.7, 89, ["Haldi"], True, False),
    P("Pitambari Haldi Combo", "pitambari-haldi-combo", "haldi", 999, 1799, [IMG["earring_b"], IMG["lifestyle_d"]],
      "Yellow and white floral combo set, easily washable and comfortable for long haldi ceremonies.",
      "Wear with a Bandhani or Leheriya yellow dupatta.", 4.6, 102, [], False, True),
    P("Sona Pili Haldi Set", "sona-pili-haldi-set", "haldi", 1199, 2099, [IMG["lifestyle_a"], IMG["bridal_a"]],
      "Gold-plated chunky pieces with yellow stone work, designed for the modern bride's haldi ceremony.",
      "Looks amazing with off-shoulder yellow blouses and silver anklets.", 4.7, 58, [], True, True),

    # --- Assamese Jewellery (3)
    P("Asam Bihu Special Set", "asam-bihu-set", "assamese", 2299, 3999, [IMG["oxidised_b"], IMG["necklace_a"]],
      "Authentic Assamese Jonbiri and Lokaparo necklace combo. Hand-crafted in gold-plated brass with red meenakari.",
      "Wear with a traditional Mekhela Chador for Bihu festivities.", 4.9, 73, ["Assamese", "New"], True, True),
    P("Jonbiri Crescent Assamese Necklace", "jonbiri-crescent-assamese", "assamese", 1899, 3199, [IMG["necklace_b"], IMG["oxidised_a"]],
      "Classic crescent moon (Jonbiri) pendant — the symbol of Assamese pride. Pairs with all traditional outfits.",
      "Wear over a silk Mekhela Chador with matching Loka jewellery.", 4.8, 56, [], True, False),
    P("Gam-Kharu Bracelet Pair", "gam-kharu-bracelet", "assamese", 1499, 2499, [IMG["oxidised_a"], IMG["earring_a"]],
      "Pair of traditional Assamese Gam-Kharu cuffs in antique finish. Symbol of marriage in Assam.",
      "Wear together on both wrists with traditional Mekhela Chador.", 4.7, 41, ["Assamese"], False, True),

    # --- Indian Ethnic (4)
    P("Rajasthani Ethnic Choker Set", "rajasthani-ethnic-choker", "ethnic", 1799, 2999, [IMG["necklace_a"], IMG["bridal_a"]],
      "Vibrant Rajasthani-inspired choker with meenakari work, kundan stones, and a matching maang tikka.",
      "Pair with bandhani lehenga or a Banarasi saree for a royal ethnic look.", 4.8, 134, ["Ethnic"], True, True),
    P("Banjara Ethnic Long Haar", "banjara-ethnic-haar", "ethnic", 2199, 3699, [IMG["oxidised_b"], IMG["necklace_b"]],
      "Long Banjara-style haar with multi-colour beads, ghungroos, and oxidised pendants.",
      "Layer over a plain black kurta or with indo-western fusion outfits.", 4.7, 87, [], True, False),
    P("Maharashtrian Nath Set", "maharashtrian-nath-set", "ethnic", 999, 1799, [IMG["earring_b"], IMG["necklace_a"]],
      "Traditional Maharashtrian nath with pearl drops and a matching kaan-phool earring set.",
      "Style with a paithani saree and nauvari drape.", 4.8, 112, ["Ethnic"], False, True),
    P("Bengali Ethnic Tikli Set", "bengali-ethnic-tikli-set", "ethnic", 1599, 2799, [IMG["bridal_b"], IMG["lifestyle_c"]],
      "Bengali bridal tikli, jhumka and chik combo set. Traditional red and white tones.",
      "Perfect with a red Banarasi saree and white-red shankha pola bangles.", 4.9, 68, ["Bengali"], True, True),

    # --- Earrings (4)
    P("Meera Pearl Drop Jhumkas", "meera-pearl-drop-jhumkas", "earrings", 899, 1499, [IMG["earring_a"], IMG["earring_b"]],
      "Lightweight gold-plated jhumkas with hand-strung pearls and delicate filigree work.",
      "Pair with an open hairstyle, a pastel saree, or anarkali.", 4.8, 92, ["Trending"], False, True),
    P("Ishika Crystal Studs", "ishika-crystal-studs", "earrings", 449, 799, [IMG["earring_b"], IMG["earring_a"]],
      "Delicate crystal studs that catch every light. Hypoallergenic posts. The everyday essential.",
      "Wear daily — office to brunch to date night.", 4.8, 304, [], True, True),
    P("Chand Bali Statement Earrings", "chand-bali-earrings", "earrings", 1199, 1999, [IMG["earring_a"], IMG["bridal_b"]],
      "Half-moon Chand Bali earrings with intricate gold work and pearl drops.",
      "Wear with sarees or salwar suits. Don't pair with heavy necklaces — let them shine.", 4.9, 217, ["Bestseller"], True, False),
    P("Hoop & Pearl Mix", "hoop-pearl-mix-earrings", "earrings", 599, 1099, [IMG["earring_b"], IMG["lifestyle_c"]],
      "Modern hoops with detachable pearl drops. Two looks in one.",
      "Hoops for everyday, add pearls for evenings.", 4.7, 156, [], False, True),

    # --- Necklaces (3)
    P("Aanya Layered Choker", "aanya-layered-choker", "necklaces", 1799, 2999, [IMG["necklace_a"], IMG["necklace_b"]],
      "A statement two-layer choker featuring temple-inspired motifs and a single ruby pendant drop.",
      "Showstopper with sarees and lehengas. Keep earrings minimal.", 4.7, 67, [], True, True),
    P("Saanvi Polki Necklace", "saanvi-polki-necklace", "necklaces", 2999, 4999, [IMG["necklace_a"], IMG["bridal_a"]],
      "Uncut polki necklace with emerald drops, set in 22k gold-plated brass.",
      "Best paired with traditional silk sarees or velvet lehengas.", 4.9, 128, ["Bestseller"], True, False),
    P("Rani Haar Long Necklace", "rani-haar-long-necklace", "necklaces", 2499, 4299, [IMG["necklace_b"], IMG["bridal_c"]],
      "Traditional long Rani Haar with multiple layers of pearls and gold motifs.",
      "Wear with a heavy lehenga or a regal saree. Keep blouse neckline simple.", 4.8, 94, [], True, True),

    # --- Oxidised (3)
    P("Chandni Oxidised Jhumka", "chandni-oxidised-jhumka", "oxidised", 549, 999, [IMG["oxidised_a"], IMG["oxidised_b"]],
      "Boho-chic oxidised silver jhumkas with intricate tribal motifs and mirror accents.",
      "Style with kurtis, fusion outfits, or a plain white linen dress.", 4.6, 213, ["Trending"], False, True),
    P("Naina Oxidised Statement Set", "naina-oxidised-statement-set", "oxidised", 1199, 1999, [IMG["oxidised_b"], IMG["oxidised_a"]],
      "Bold oxidised silver necklace with matching earrings. Hand-crafted by Jaipur artisans.",
      "Pair with handloom cotton sarees or indo-western outfits.", 4.7, 145, [], True, True),
    P("Tribal Oxidised Cuff Set", "tribal-oxidised-cuff", "oxidised", 799, 1399, [IMG["oxidised_a"], IMG["lifestyle_d"]],
      "Statement tribal oxidised cuffs — pair of two for both wrists.",
      "Wear with off-shoulder dresses or anarkalis.", 4.7, 89, [], False, True),

    # --- Polki & Kundan (3)
    P("Polki Choker Set", "polki-choker-set", "polki", 2799, 4499, [IMG["bridal_c"], IMG["necklace_a"]],
      "Authentic polki choker with uncut diamond accents and pearl drops. Two-piece set.",
      "Best for cocktails and engagement parties. Pair with a high-bun.", 4.9, 67, ["Bestseller"], True, True),
    P("Kundan Maang Tikka", "kundan-maang-tikka", "polki", 899, 1499, [IMG["bridal_a"], IMG["earring_a"]],
      "Delicate kundan maang tikka with center drop. Lightweight and easy to wear.",
      "Style with a side parting or sleek pony.", 4.8, 134, [], True, False),
    P("Kundan Long Necklace", "kundan-long-necklace", "polki", 3299, 5499, [IMG["necklace_a"], IMG["bridal_b"]],
      "Heritage-style long kundan necklace with intricate meenakari work on the reverse.",
      "Wear with sarees and lehengas. Lasts generations.", 4.9, 78, ["Premium"], True, True),

    # --- Temple (3)
    P("Temple Goddess Choker", "temple-goddess-choker", "temple", 1899, 3299, [IMG["bridal_b"], IMG["necklace_a"]],
      "South Indian temple-style choker featuring carved Goddess motifs and ruby-colour stones.",
      "Best with kanjeevaram silk sarees. Pair with temple jhumkas.", 4.8, 89, ["Temple"], True, True),
    P("Temple Lakshmi Coin Mala", "temple-lakshmi-coin-mala", "temple", 1599, 2799, [IMG["necklace_a"], IMG["bridal_a"]],
      "Traditional Lakshmi coin mala with 21 coins and a matching pendant.",
      "Auspicious for weddings, festivals, and religious ceremonies.", 4.9, 112, [], True, False),
    P("Temple Jhumka Combo", "temple-jhumka-combo", "temple", 999, 1799, [IMG["earring_a"], IMG["bridal_c"]],
      "Carved temple-style jhumkas with pearl drops. Heritage design.",
      "Style with a low bun and fresh flowers.", 4.7, 156, [], False, True),
]

SEED_REVIEWS: List[Dict[str, Any]] = [
    {"name": "Ananya Sharma", "location": "Mumbai", "rating": 5, "comment": "The Royal Kundan set made my wedding day magical. Quality is unreal for the price!", "image": IMG["lifestyle_a"]},
    {"name": "Priya Iyer", "location": "Bengaluru", "rating": 5, "comment": "I have ordered three sets from Aavya. Packaging feels luxurious, gold finish stays beautiful.", "image": IMG["lifestyle_b"]},
    {"name": "Riya Mehta", "location": "Delhi", "rating": 5, "comment": "Got compliments all night at my cousin's sangeet. The Aanya choker is now my forever favourite.", "image": IMG["lifestyle_c"]},
    {"name": "Sneha Kapoor", "location": "Jaipur", "rating": 4, "comment": "Fast shipping and COD made it so easy. My oxidised jhumkas are stunning!", "image": IMG["lifestyle_d"]},
    {"name": "Mishti Das", "location": "Kolkata", "rating": 5, "comment": "The Bengali Tikli set was perfect for my pre-wedding. Looks like my dadi's heirloom.", "image": IMG["lifestyle_a"]},
    {"name": "Aaradhya Singh", "location": "Lucknow", "rating": 5, "comment": "Mehndi set was the prettiest! Light to wear and lasted all night dancing.", "image": IMG["lifestyle_b"]},
]

COUPONS = {
    "AAVYA10": {"type": "percent", "value": 10, "min_subtotal": 0, "description": "10% off your first order"},
    "WEEKEND15": {"type": "percent", "value": 15, "min_subtotal": 1500, "description": "Weekend Sale 15% off"},
    "BRIDAL500": {"type": "flat", "value": 500, "min_subtotal": 3500, "description": "Flat ₹500 off bridal orders"},
}


async def seed_data():
    meta = await db.app_meta.find_one({"key": "seed_version"})
    if not meta or meta.get("value") != SEED_VERSION:
        await db.products.delete_many({})
        await db.reviews.delete_many({})
        docs = [Product(**p).model_dump() for p in SEED_PRODUCTS]
        await db.products.insert_many(docs)
        rdocs = [Review(**r).model_dump() for r in SEED_REVIEWS]
        await db.reviews.insert_many(rdocs)
        await db.app_meta.update_one({"key": "seed_version"}, {"$set": {"value": SEED_VERSION}}, upsert=True)
        logging.info(f"Re-seeded {len(docs)} products and {len(rdocs)} reviews (version {SEED_VERSION})")
    else:
        logging.info(f"Seed up to date ({SEED_VERSION})")


# ----------------------- Routes -----------------------
@api_router.get("/")
async def root():
    return {"message": "Aavya Fashion API", "status": "ok"}


@api_router.get("/products", response_model=List[Product])
async def list_products(category: Optional[str] = None, trending: Optional[bool] = None, best: Optional[bool] = None, limit: int = 200):
    q: Dict[str, Any] = {}
    if category and category != "all":
        q["category"] = category
    if trending:
        q["is_trending"] = True
    if best:
        q["is_best_seller"] = True
    docs = await db.products.find(q, {"_id": 0}).to_list(limit)
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
    return {"code": code, "discount": discount, "description": coupon["description"], "type": coupon["type"], "value": coupon["value"]}


@api_router.post("/newsletter")
async def newsletter(payload: NewsletterSignup):
    existing = await db.newsletter.find_one({"email": payload.email})
    if existing:
        return {"success": True, "message": "You're already subscribed!", "coupon": "AAVYA10"}
    await db.newsletter.insert_one({"id": str(uuid.uuid4()), "email": payload.email, "created_at": iso_now()})
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

    server_items: List[CartItem] = []
    for ci in payload.items:
        prod = await db.products.find_one({"id": ci.product_id}, {"_id": 0})
        if not prod:
            raise HTTPException(400, f"Product {ci.product_id} not found")
        server_items.append(CartItem(
            product_id=prod["id"], name=prod["name"], image=prod["images"][0],
            price=float(prod["price"]), quantity=max(1, int(ci.quantity)),
        ))

    subtotal, shipping, discount, total, applied = _calc_order(server_items, payload.coupon_code)
    order_id = str(uuid.uuid4())
    order_number = f"AAV{datetime.now(timezone.utc).strftime('%y%m%d')}{str(uuid.uuid4())[:4].upper()}"

    order_doc = {
        "id": order_id, "order_number": order_number,
        "items": [i.model_dump() for i in server_items], "address": payload.address.model_dump(),
        "subtotal": subtotal, "shipping": shipping, "discount": discount,
        "coupon_code": applied, "total": total,
        "payment_method": payload.payment_method, "payment_status": "pending",
        "status": "placed" if payload.payment_method == "cod" else "awaiting_payment",
        "created_at": iso_now(),
    }
    await db.orders.insert_one(order_doc)

    if payload.payment_method == "cod":
        return {"order_id": order_id, "order_number": order_number, "total": total, "payment_method": "cod", "checkout_url": None}

    if not STRIPE_API_KEY:
        raise HTTPException(500, "Payment gateway not configured")

    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/order/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/checkout"

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{str(request.base_url).rstrip('/')}/api/webhook/stripe")
    session_req = CheckoutSessionRequest(
        amount=float(total), currency="inr",
        success_url=success_url, cancel_url=cancel_url,
        metadata={"order_id": order_id, "order_number": order_number, "customer_email": payload.address.email or ""},
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(session_req)

    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()), "session_id": session.session_id, "order_id": order_id,
        "amount": total, "currency": "inr", "payment_status": "initiated", "status": "open",
        "metadata": {"order_number": order_number},
        "created_at": iso_now(), "updated_at": iso_now(),
    })
    await db.orders.update_one({"id": order_id}, {"$set": {"stripe_session_id": session.session_id}})

    return {"order_id": order_id, "order_number": order_number, "total": total, "payment_method": "stripe", "checkout_url": session.url, "session_id": session.session_id}


@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not txn:
        raise HTTPException(404, "Session not found")
    if txn.get("payment_status") == "paid":
        order = await db.orders.find_one({"id": txn["order_id"]}, {"_id": 0})
        return {"payment_status": "paid", "status": "complete", "order_number": order.get("order_number") if order else None}

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{str(request.base_url).rstrip('/')}/api/webhook/stripe")
    cs: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {"payment_status": cs.payment_status, "status": cs.status, "updated_at": iso_now()}},
    )
    if cs.payment_status == "paid":
        await db.orders.update_one({"id": txn["order_id"]}, {"$set": {"payment_status": "paid", "status": "confirmed", "updated_at": iso_now()}})

    order = await db.orders.find_one({"id": txn["order_id"]}, {"_id": 0})
    return {"payment_status": cs.payment_status, "status": cs.status, "order_number": order.get("order_number") if order else None}


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
        await db.payment_transactions.update_one({"session_id": evt.session_id}, {"$set": {"payment_status": evt.payment_status, "updated_at": iso_now()}})
        if evt.payment_status == "paid":
            txn = await db.payment_transactions.find_one({"session_id": evt.session_id}, {"_id": 0})
            if txn:
                await db.orders.update_one({"id": txn["order_id"]}, {"$set": {"payment_status": "paid", "status": "confirmed", "updated_at": iso_now()}})
    return {"received": True}


@api_router.get("/order/{order_number}")
async def get_order(order_number: str):
    order = await db.orders.find_one({"order_number": order_number.strip().upper()}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    return order


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware, allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"], allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await seed_data()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
