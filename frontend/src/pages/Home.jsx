import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, RotateCcw, Gem, Star, ArrowRight, Mail, Sparkles } from "lucide-react";
import { fetchProducts, fetchReviews, subscribeNewsletter, formatINR } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "bridal", title: "Bridal Sets", img: "https://images.unsplash.com/photo-1756483560049-e7b2208f99a0?crop=entropy&cs=srgb&fm=jpg&w=900&q=85", span: "md:col-span-2 md:row-span-2 aspect-[4/5] md:aspect-auto" },
  { key: "earrings", title: "Earrings", img: "https://images.pexels.com/photos/20074769/pexels-photo-20074769.jpeg?auto=compress&cs=tinysrgb&w=900", span: "aspect-square" },
  { key: "necklaces", title: "Necklaces", img: "https://images.pexels.com/photos/19647000/pexels-photo-19647000.jpeg?auto=compress&cs=tinysrgb&w=900", span: "aspect-square" },
  { key: "oxidised", title: "Oxidised", img: "https://images.pexels.com/photos/15650527/pexels-photo-15650527.jpeg?auto=compress&cs=tinysrgb&w=900", span: "md:col-span-2 aspect-[2/1]" },
];

const INSTAGRAM = [
  "https://images.unsplash.com/photo-1532039956299-1614b86a6d2f?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
  "https://images.pexels.com/photos/17557255/pexels-photo-17557255.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.unsplash.com/photo-1613966561243-c6959a886009?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
  "https://images.pexels.com/photos/8050079/pexels-photo-8050079.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/19647000/pexels-photo-19647000.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.unsplash.com/photo-1626784214765-754de4c5a77b?crop=entropy&cs=srgb&fm=jpg&w=900&q=85",
  "https://images.pexels.com/photos/20074769/pexels-photo-20074769.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/35921022/pexels-photo-35921022.jpeg?auto=compress&cs=tinysrgb&w=900",
];

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [best, setBest] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchProducts({ trending: true }).then(setTrending).catch(() => {});
    fetchProducts({ best: true }).then(setBest).catch(() => {});
    fetchReviews().then(setReviews).catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await subscribeNewsletter(email);
      toast.success(res.message, { description: `Coupon: ${res.coupon}` });
      setEmail("");
    } catch (err) {
      toast.error("Could not subscribe. Try again.");
    }
  };

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative bg-[#FAFAF9] overflow-hidden" data-testid="hero-section">
        <div className="grid md:grid-cols-2 min-h-[88vh]">
          <div className="flex flex-col justify-center px-6 md:px-16 py-20 md:py-0 order-2 md:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
              <p className="overline mb-6 flex items-center gap-2"><Sparkles size={14} /> Festive Edit 2026</p>
              <h1 className="hero-headline text-5xl md:text-7xl lg:text-[5.5rem] text-[#1C1917]">
                Elegance,<br />
                <span className="italic font-serif">redefined</span> in<br />
                <span className="shimmer-gold">gold.</span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-[#57534E] max-w-md font-light leading-relaxed">
                Affordable luxury jewellery, handcrafted for every occasion. Discover heirloom-inspired pieces by Aavya.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/shop" className="btn-primary inline-flex items-center gap-2" data-testid="hero-shop-now">
                  Shop Now <ArrowRight size={14} />
                </Link>
                <Link to="/shop?category=bridal" className="btn-secondary" data-testid="hero-bridal">Explore Bridal</Link>
              </div>
              <div className="mt-12 flex items-center gap-6 text-xs text-[#57534E]">
                <span className="flex items-center gap-1.5"><Star size={14} className="fill-[#D4AF37] text-[#D4AF37]" /> 4.9 / 5 · 2,500+ reviews</span>
                <span>· Free shipping ₹999+</span>
              </div>
            </motion.div>
          </div>

          <div className="relative order-1 md:order-2 h-[60vh] md:h-auto">
            <img
              src="https://images.unsplash.com/photo-1756483560049-e7b2208f99a0?crop=entropy&cs=srgb&fm=jpg&w=1400&q=85"
              alt="Model wearing Aavya bridal jewellery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#FAFAF9]/30" />
            <div className="absolute bottom-8 left-8 hidden md:block bg-white/95 backdrop-blur-md px-6 py-4 max-w-xs">
              <p className="overline mb-1">Featured</p>
              <p className="font-serif text-base text-[#1C1917]">Royal Kundan Bridal Set</p>
              <p className="text-sm text-[#57534E] mt-1">₹4,499 <span className="line-through text-[#A8A29E] ml-2">₹7,999</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#1C1917] text-white py-3 marquee">
        <div className="marquee-track text-[11px] uppercase tracking-[0.3em]">
          {Array(2).fill(0).flatMap((_, ix) => [
            <span key={`a${ix}`}>✦ Weekend Sale — Flat 15% Off</span>,
            <span key={`b${ix}`}>✦ Free Shipping over ₹999</span>,
            <span key={`c${ix}`}>✦ Cash on Delivery available</span>,
            <span key={`d${ix}`}>✦ Use code AAVYA10 — 10% off first order</span>,
            <span key={`e${ix}`}>✦ Handcrafted in India</span>,
          ])}
        </div>
      </div>

      {/* CATEGORIES BENTO */}
      <section className="px-4 md:px-12 py-20 md:py-28" data-testid="categories-section">
        <div className="text-center mb-14">
          <p className="overline">Curated Collections</p>
          <h2 className="font-serif text-3xl md:text-5xl text-[#1C1917] mt-3 font-light">Find Your Aavya Moment</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-7xl mx-auto">
          {CATEGORIES.map((cat) => (
            <Link key={cat.key} to={`/shop?category=${cat.key}`} className={`relative group overflow-hidden bg-[#FAFAF9] ${cat.span} col-span-1`} data-testid={`category-${cat.key}`}>
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="overline text-white/70">Shop</p>
                <h3 className="font-serif text-2xl md:text-3xl mt-1">{cat.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="px-4 md:px-12 py-12" data-testid="trending-section">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="overline">Hot Right Now</p>
            <h2 className="font-serif text-3xl md:text-5xl text-[#1C1917] mt-3 font-light">Trending This Week</h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.25em] hover:text-[#D4AF37]">View All <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {trending.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} testIdPrefix="trending" />)}
        </div>
      </section>

      {/* WEEKEND SALE BANNER */}
      <section className="my-20 bg-[#FDF2F8] mx-4 md:mx-12 px-6 md:px-16 py-14 md:py-20 relative overflow-hidden" data-testid="weekend-sale-banner">
        <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <p className="overline mb-4">Weekend Exclusive</p>
            <h2 className="font-serif text-4xl md:text-6xl text-[#1C1917] font-light leading-[0.95]">
              Flat <span className="shimmer-gold">15%</span> Off<br />on Bridal Sets
            </h2>
            <p className="mt-4 text-[#57534E] max-w-md">Live every Saturday & Sunday. Use code <span className="font-medium text-[#1C1917]">WEEKEND15</span> on orders above ₹1,500.</p>
            <Link to="/shop?category=bridal" className="btn-primary mt-8 inline-block" data-testid="weekend-shop-bridal">Shop Bridal Collection</Link>
          </div>
          <div className="hidden md:block relative">
            <img src="https://images.unsplash.com/photo-1570212773364-e30cd076539e?crop=entropy&cs=srgb&fm=jpg&w=900&q=85" alt="Bridal" className="w-full h-[400px] object-cover" />
          </div>
        </div>
        <Gem className="absolute -top-10 -right-10 text-[#D4AF37]/10" size={300} strokeWidth={0.5} />
      </section>

      {/* BEST SELLERS */}
      <section className="px-4 md:px-12 py-12" data-testid="best-sellers-section">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="overline">Loved by Many</p>
            <h2 className="font-serif text-3xl md:text-5xl text-[#1C1917] mt-3 font-light">Best Sellers</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {best.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} testIdPrefix="best" />)}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="px-4 md:px-12 py-24 bg-[#FAFAF9] mt-20" data-testid="why-choose-section">
        <div className="text-center mb-14">
          <p className="overline">The Aavya Promise</p>
          <h2 className="font-serif text-3xl md:text-5xl text-[#1C1917] mt-3 font-light">Why Choose Aavya</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {[
            { Icon: Gem, title: "Premium Quality", desc: "Hand-finished, gold-plated, made to last." },
            { Icon: ShieldCheck, title: "Affordable Luxury", desc: "Heirloom-style at honest prices." },
            { Icon: Truck, title: "Fast Shipping", desc: "Across India in 2–5 working days." },
            { Icon: RotateCcw, title: "COD Available", desc: "Pay when your order arrives." },
          ].map((it, ix) => (
            <div key={ix} className="text-center" data-testid={`promise-${ix}`}>
              <it.Icon strokeWidth={1.2} className="mx-auto text-[#D4AF37]" size={40} />
              <h3 className="font-serif text-lg mt-5 text-[#1C1917]">{it.title}</h3>
              <p className="text-sm text-[#57534E] mt-2 font-light">{it.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="px-4 md:px-12 py-24" data-testid="reviews-section">
        <div className="text-center mb-14">
          <p className="overline">Real Stories</p>
          <h2 className="font-serif text-3xl md:text-5xl text-[#1C1917] mt-3 font-light">Aavya, Loved by You</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {reviews.slice(0, 4).map((r) => (
            <div key={r.id} className="bg-[#FAFAF9] p-8 md:p-10 flex gap-5" data-testid={`review-${r.id}`}>
              <img src={r.image} alt={r.name} className="w-16 h-16 object-cover rounded-full flex-shrink-0" />
              <div>
                <div className="flex gap-0.5 mb-3">
                  {Array(r.rating).fill(0).map((_, i) => <Star key={i} size={14} className="fill-[#D4AF37] text-[#D4AF37]" />)}
                </div>
                <p className="text-[#1C1917] font-serif italic text-base leading-relaxed">"{r.comment}"</p>
                <p className="mt-3 text-sm text-[#57534E]"><span className="font-medium text-[#1C1917]">{r.name}</span> · {r.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="py-16" data-testid="instagram-section">
        <div className="text-center mb-10 px-4">
          <p className="overline">@aavya.fashion</p>
          <h2 className="font-serif text-3xl md:text-5xl text-[#1C1917] mt-3 font-light">Styled By You</h2>
          <p className="text-[#57534E] mt-3 text-sm">Tag <span className="text-[#D4AF37]">#AavyaFashion</span> for a chance to be featured</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {INSTAGRAM.map((img, ix) => (
            <a key={ix} href="https://instagram.com" target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden group" data-testid={`instagram-${ix}`}>
              <img src={img} alt="Instagram post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </a>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-[#F5F5F0] px-4 md:px-12 py-20 md:py-28" data-testid="newsletter-section">
        <div className="max-w-3xl mx-auto text-center">
          <Mail strokeWidth={1.2} className="mx-auto text-[#D4AF37]" size={36} />
          <h2 className="font-serif text-3xl md:text-5xl text-[#1C1917] mt-6 font-light">Get <span className="shimmer-gold">10% Off</span> Your First Order</h2>
          <p className="text-[#57534E] mt-4 max-w-lg mx-auto">Join 10,000+ women who get first dibs on new collections, styling tips, and exclusive offers.</p>
          <form onSubmit={handleSubscribe} className="mt-10 flex flex-col md:flex-row gap-3 max-w-md mx-auto" data-testid="newsletter-form">
            <input
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="box-input flex-1"
              data-testid="newsletter-email"
            />
            <button type="submit" className="btn-primary" data-testid="newsletter-submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
