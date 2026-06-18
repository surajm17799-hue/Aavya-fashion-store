import React from "react";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#F5F5F0] mt-24" data-testid="footer">
      <div className="px-4 md:px-12 py-20 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <span className="font-script text-5xl text-[#D4AF37]" style={{ fontFamily: "Italianno, cursive" }}>Aavya</span>
          <p className="text-sm text-[#57534E] mt-3 font-light leading-relaxed max-w-xs">
            Affordable luxury jewellery crafted for the modern Indian woman. Heirloom-inspired designs, everyday wearability.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-[#D4AF37]"><Instagram strokeWidth={1.5} size={18} /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-[#D4AF37]"><Facebook strokeWidth={1.5} size={18} /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="Youtube" className="hover:text-[#D4AF37]"><Youtube strokeWidth={1.5} size={18} /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-[#D4AF37]"><Twitter strokeWidth={1.5} size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="overline mb-5">Shop</h4>
          <ul className="space-y-3 text-sm text-[#57534E]">
            <li><Link to="/shop?category=earrings" className="hover:text-[#1C1917]">Earrings</Link></li>
            <li><Link to="/shop?category=necklaces" className="hover:text-[#1C1917]">Necklaces</Link></li>
            <li><Link to="/shop?category=bridal" className="hover:text-[#1C1917]">Bridal Sets</Link></li>
            <li><Link to="/shop?category=oxidised" className="hover:text-[#1C1917]">Oxidised</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="overline mb-5">Help</h4>
          <ul className="space-y-3 text-sm text-[#57534E]">
            <li><Link to="/policy/shipping" className="hover:text-[#1C1917]">Shipping Policy</Link></li>
            <li><Link to="/policy/returns" className="hover:text-[#1C1917]">Return Policy</Link></li>
            <li><Link to="/policy/faq" className="hover:text-[#1C1917]">FAQ</Link></li>
            <li><Link to="/track" className="hover:text-[#1C1917]">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="overline mb-5">Company</h4>
          <ul className="space-y-3 text-sm text-[#57534E]">
            <li><Link to="/policy/about" className="hover:text-[#1C1917]">About Us</Link></li>
            <li><Link to="/policy/contact" className="hover:text-[#1C1917]">Contact Us</Link></li>
            <li><a href="https://wa.me/919999189863" className="hover:text-[#1C1917]">WhatsApp: +91 99991 89863</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-300/60">
        <div className="px-4 md:px-12 py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-[#57534E] tracking-wider">
          <span>© {new Date().getFullYear()} Aavya Fashion and Jewellery · All rights reserved</span>
          <span>Crafted with love in India</span>
        </div>
      </div>
    </footer>
  );
}
