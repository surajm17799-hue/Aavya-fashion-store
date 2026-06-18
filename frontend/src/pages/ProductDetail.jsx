import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Star, ChevronDown, BadgeIndianRupee } from "lucide-react";
import { fetchProduct, fetchReviews, formatINR } from "../lib/api";
import { useShop } from "../context/ShopContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, inWishlist } = useShop();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [openSection, setOpenSection] = useState("details");

  useEffect(() => {
    fetchProduct(slug).then((p) => {
      setProduct(p);
      setActiveImg(0);
      window.scrollTo(0, 0);
    }).catch(() => navigate("/shop"));
    fetchReviews().then(setReviews);
  }, [slug, navigate]);

  if (!product) return <div className="px-4 py-32 text-center text-[#57534E]" data-testid="product-loading">Loading...</div>;

  const wished = inWishlist(product.id);
  const sections = [
    { key: "details", label: "Product Details", content: product.description },
    { key: "styling", label: "Styling Tips", content: product.styling_tips },
    { key: "shipping", label: "Shipping & Returns", content: "Free shipping on orders above ₹999. Delivered in 2–5 working days across India. Easy 7-day returns on unworn items in original packaging." },
    { key: "care", label: "Care Instructions", content: "Store in a dry place, away from perfume and moisture. Wipe gently with a soft cloth after use. Avoid contact with water and harsh chemicals." },
  ];

  return (
    <div className="px-4 md:px-12 py-10" data-testid="product-detail-page">
      <nav className="text-xs uppercase tracking-[0.2em] text-[#A8A29E] mb-8" data-testid="breadcrumb">
        <Link to="/" className="hover:text-[#1C1917]">Home</Link> / <Link to={`/shop?category=${product.category}`} className="hover:text-[#1C1917]">{product.category}</Link> / <span className="text-[#1C1917]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 max-w-7xl mx-auto">
        {/* Gallery */}
        <div className="grid grid-cols-[80px_1fr] gap-3" data-testid="product-gallery">
          <div className="flex flex-col gap-3">
            {product.images.map((img, ix) => (
              <button
                key={ix}
                onClick={() => setActiveImg(ix)}
                className={`aspect-square bg-[#FAFAF9] overflow-hidden border-2 ${activeImg === ix ? "border-[#D4AF37]" : "border-transparent"}`}
                data-testid={`thumb-${ix}`}
              >
                <img src={img} alt={`${product.name} ${ix + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="bg-[#FAFAF9] aspect-[4/5] overflow-hidden group relative">
            <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 cursor-zoom-in" />
          </div>
        </div>

        {/* Details */}
        <div className="md:sticky md:top-32 md:self-start">
          <p className="overline" data-testid="category-label">{product.category}</p>
          <h1 className="font-serif text-3xl md:text-5xl text-[#1C1917] mt-3 font-light leading-tight" data-testid="product-title">{product.name}</h1>

          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-0.5">
              {Array(5).fill(0).map((_, i) => <Star key={i} size={14} className={i < Math.round(product.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#A8A29E]"} />)}
            </div>
            <span className="text-sm text-[#57534E]">{product.rating} ({product.reviews_count} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-serif text-3xl text-[#1C1917]" data-testid="product-price">₹{formatINR(product.price)}</span>
            {product.compare_at_price && (
              <>
                <span className="text-base text-[#A8A29E] line-through">₹{formatINR(product.compare_at_price)}</span>
                <span className="text-[#991B1B] text-sm font-medium">Save ₹{formatINR(product.compare_at_price - product.price)} ({product.discount_pct}%)</span>
              </>
            )}
          </div>

          {product.cod_available && (
            <div className="mt-5 inline-flex items-center gap-2 bg-[#FDF2F8] px-3 py-1.5 text-xs uppercase tracking-widest text-[#1C1917]" data-testid="cod-badge">
              <BadgeIndianRupee size={14} className="text-[#D4AF37]" /> Cash on Delivery Available
            </div>
          )}

          <p className="text-sm text-[#57534E] mt-6 leading-relaxed font-light">{product.description.slice(0, 180)}...</p>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <button onClick={() => addToCart(product)} className="btn-secondary flex items-center justify-center gap-2" data-testid="detail-add-to-cart">
              <ShoppingBag size={14} /> Add to Cart
            </button>
            <button
              onClick={() => { addToCart(product); navigate("/checkout"); }}
              className="btn-primary"
              data-testid="detail-buy-now"
            >Buy Now</button>
          </div>

          <button
            onClick={() => toggleWishlist(product)}
            className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#57534E] hover:text-[#D4AF37]"
            data-testid="detail-wishlist"
          >
            <Heart size={14} className={wished ? "fill-[#991B1B] text-[#991B1B]" : ""} /> {wished ? "Saved to Wishlist" : "Save to Wishlist"}
          </button>

          <div className="grid grid-cols-3 gap-3 mt-10 pt-8 border-t border-stone-200 text-center">
            <div className="text-[10px] uppercase tracking-widest text-[#57534E]"><Truck size={20} strokeWidth={1.2} className="mx-auto mb-2 text-[#D4AF37]" />Free Shipping ₹999+</div>
            <div className="text-[10px] uppercase tracking-widest text-[#57534E]"><ShieldCheck size={20} strokeWidth={1.2} className="mx-auto mb-2 text-[#D4AF37]" />Authentic Quality</div>
            <div className="text-[10px] uppercase tracking-widest text-[#57534E]"><RotateCcw size={20} strokeWidth={1.2} className="mx-auto mb-2 text-[#D4AF37]" />7-Day Returns</div>
          </div>

          {/* Accordions */}
          <div className="mt-10 border-t border-stone-200">
            {sections.map((s) => (
              <div key={s.key} className="border-b border-stone-200">
                <button
                  onClick={() => setOpenSection(openSection === s.key ? null : s.key)}
                  className="w-full flex items-center justify-between py-5 text-left text-sm uppercase tracking-[0.2em] text-[#1C1917]"
                  data-testid={`accordion-${s.key}`}
                >
                  {s.label}
                  <ChevronDown size={18} className={`transition-transform ${openSection === s.key ? "rotate-180" : ""}`} />
                </button>
                {openSection === s.key && (
                  <p className="pb-5 text-sm text-[#57534E] font-light leading-relaxed" data-testid={`accordion-content-${s.key}`}>{s.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="max-w-7xl mx-auto mt-24" data-testid="product-reviews">
        <p className="overline">Customer Reviews</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[#1C1917] mt-3 font-light mb-10">What Our Customers Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {reviews.slice(0, 4).map((r) => (
            <div key={r.id} className="bg-[#FAFAF9] p-8 flex gap-5">
              <img src={r.image} alt={r.name} className="w-14 h-14 object-cover rounded-full" />
              <div>
                <div className="flex gap-0.5 mb-2">
                  {Array(r.rating).fill(0).map((_, i) => <Star key={i} size={12} className="fill-[#D4AF37] text-[#D4AF37]" />)}
                </div>
                <p className="italic font-serif text-[#1C1917]">"{r.comment}"</p>
                <p className="mt-2 text-sm text-[#57534E]"><span className="font-medium text-[#1C1917]">{r.name}</span> · {r.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky mobile buy bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 z-40 flex gap-2" data-testid="sticky-mobile-bar">
        <button onClick={() => addToCart(product)} className="btn-secondary flex-1 !py-3 !text-[11px]">Add to Cart</button>
        <button onClick={() => { addToCart(product); navigate("/checkout"); }} className="btn-primary flex-1 !py-3 !text-[11px]">Buy Now · ₹{formatINR(product.price)}</button>
      </div>
    </div>
  );
}
