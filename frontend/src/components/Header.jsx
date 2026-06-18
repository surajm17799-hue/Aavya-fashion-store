import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X, MessageCircle, Package } from "lucide-react";
import { useShop } from "../context/ShopContext";

const WHATSAPP_NUMBER = "919999189863";
const WHATSAPP_TEXT = "Hi Aavya! I'd like to place an order. Please assist me.";
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

export default function Header() {
  const { itemCount, setDrawerOpen, wishlist } = useShop();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  const links = [
    { label: "Shop All", to: "/shop" },
    { label: "Bridal", to: "/shop?category=bridal" },
    { label: "Mehndi", to: "/shop?category=mehndi" },
    { label: "Haldi", to: "/shop?category=haldi" },
    { label: "Assamese", to: "/shop?category=assamese" },
    { label: "Ethnic", to: "/shop?category=ethnic" },
    { label: "Oxidised", to: "/shop?category=oxidised" },
  ];

  return (
    <>
      {/* Top announcement */}
      <div className="bg-[#1C1917] text-white text-[11px] tracking-[0.25em] uppercase py-2 text-center font-light" data-testid="top-bar">
        <span>Free shipping over ₹999 · Use code <span className="text-[#E5C87A]">AAVYA10</span> for 10% off</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-stone-200/60" data-testid="header">
        <div className="px-4 md:px-10 py-3 md:py-4 flex items-center justify-between gap-4">
          {/* Left — Mobile menu / nav */}
          <button
            className="md:hidden p-1"
            onClick={() => setMobileOpen(true)}
            data-testid="mobile-menu-button"
            aria-label="Open menu"
          >
            <Menu strokeWidth={1.5} size={22} />
          </button>

          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-[11px] uppercase tracking-[0.2em] font-medium text-[#1C1917]" data-testid="primary-nav">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-[#D4AF37] transition-colors" data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}>{l.label}</Link>
            ))}
          </nav>

          {/* Center — Logo */}
          <Link to="/" className="flex flex-col items-center leading-none" data-testid="logo-link">
            <span className="font-script text-4xl md:text-5xl text-[#D4AF37]" style={{ fontFamily: "Italianno, cursive" }}>Aavya</span>
            <span className="text-[9px] tracking-[0.35em] uppercase text-[#57534E] mt-0.5">Fashion & Jewellery</span>
          </Link>

          {/* Right — Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* WhatsApp Order pill — top right */}
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300 shadow-sm hover:shadow-md"
              data-testid="whatsapp-order-button"
              aria-label="Order on WhatsApp"
            >
              <MessageCircle size={14} strokeWidth={2} fill="white" /> WhatsApp Order
            </a>

            {/* Mobile WhatsApp icon-only */}
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden w-9 h-9 flex items-center justify-center bg-[#25D366] text-white rounded-full"
              data-testid="whatsapp-order-button-mobile"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} strokeWidth={2} fill="white" />
            </a>

            <button onClick={() => navigate("/track")} aria-label="Track Order" data-testid="track-button" className="hidden lg:flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors text-[11px] uppercase tracking-[0.2em]">
              <Package size={15} strokeWidth={1.5} /> Track
            </button>
            <button aria-label="Search" data-testid="search-button" className="hover:text-[#D4AF37] transition-colors p-1"><Search strokeWidth={1.5} size={19} /></button>
            <button onClick={() => navigate("/wishlist")} aria-label="Wishlist" data-testid="wishlist-button" className="hover:text-[#D4AF37] transition-colors relative p-1">
              <Heart strokeWidth={1.5} size={19} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center" data-testid="wishlist-count">{wishlist.length}</span>
              )}
            </button>
            <button onClick={() => setDrawerOpen(true)} aria-label="Cart" data-testid="cart-button" className="hover:text-[#D4AF37] transition-colors relative p-1">
              <ShoppingBag strokeWidth={1.5} size={19} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1C1917] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center" data-testid="cart-count">{itemCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white" data-testid="mobile-menu">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-script text-3xl text-[#D4AF37]">Aavya</span>
            <button onClick={() => setMobileOpen(false)} data-testid="mobile-menu-close"><X strokeWidth={1.5} /></button>
          </div>
          <nav className="flex flex-col p-6 gap-5 text-[13px] uppercase tracking-[0.25em]">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="hover:text-[#D4AF37]" data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}>{l.label}</Link>
            ))}
            <Link to="/track" onClick={() => setMobileOpen(false)} className="hover:text-[#D4AF37]">Track Order</Link>
            <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-4 py-3 text-center mt-4">WhatsApp Order: +91 99991 89863</a>
          </nav>
        </div>
      )}
    </>
  );
}
