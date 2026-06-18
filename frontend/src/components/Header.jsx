import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function Header() {
  const { itemCount, setDrawerOpen, wishlist } = useShop();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  const links = [
    { label: "Shop All", to: "/shop" },
    { label: "Earrings", to: "/shop?category=earrings" },
    { label: "Necklaces", to: "/shop?category=necklaces" },
    { label: "Bridal", to: "/shop?category=bridal" },
    { label: "Oxidised", to: "/shop?category=oxidised" },
  ];

  return (
    <>
      {/* Top announcement */}
      <div className="bg-[#1C1917] text-white text-[11px] tracking-[0.25em] uppercase py-2 text-center font-light" data-testid="top-bar">
        <span>Free shipping over ₹999 · Use code <span className="text-[#E5C87A]">AAVYA10</span> for 10% off</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-stone-200/60" data-testid="header">
        <div className="px-4 md:px-10 py-4 flex items-center justify-between gap-4">
          <button
            className="md:hidden p-1"
            onClick={() => setMobileOpen(true)}
            data-testid="mobile-menu-button"
            aria-label="Open menu"
          >
            <Menu strokeWidth={1.5} size={22} />
          </button>

          <nav className="hidden md:flex items-center gap-8 text-[12px] uppercase tracking-[0.2em] font-medium text-[#1C1917]" data-testid="primary-nav">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-[#D4AF37] transition-colors" data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}>{l.label}</Link>
            ))}
          </nav>

          <Link to="/" className="flex flex-col items-center leading-none" data-testid="logo-link">
            <span className="font-script text-4xl md:text-5xl text-[#D4AF37]" style={{ fontFamily: "Italianno, cursive" }}>Aavya</span>
            <span className="text-[9px] tracking-[0.35em] uppercase text-[#57534E] mt-0.5">Fashion & Jewellery</span>
          </Link>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/track")} aria-label="Track Order" data-testid="track-button" className="hidden md:block hover:text-[#D4AF37] transition-colors text-[12px] uppercase tracking-[0.2em]">Track</button>
            <button aria-label="Search" data-testid="search-button" className="hover:text-[#D4AF37] transition-colors"><Search strokeWidth={1.5} size={20} /></button>
            <button onClick={() => navigate("/wishlist")} aria-label="Wishlist" data-testid="wishlist-button" className="hover:text-[#D4AF37] transition-colors relative">
              <Heart strokeWidth={1.5} size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center" data-testid="wishlist-count">{wishlist.length}</span>
              )}
            </button>
            <button onClick={() => setDrawerOpen(true)} aria-label="Cart" data-testid="cart-button" className="hover:text-[#D4AF37] transition-colors relative">
              <ShoppingBag strokeWidth={1.5} size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#1C1917] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center" data-testid="cart-count">{itemCount}</span>
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
          <nav className="flex flex-col p-6 gap-6 text-[14px] uppercase tracking-[0.25em]">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="hover:text-[#D4AF37]" data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}>{l.label}</Link>
            ))}
            <Link to="/track" onClick={() => setMobileOpen(false)} className="hover:text-[#D4AF37]">Track Order</Link>
          </nav>
        </div>
      )}
    </>
  );
}
