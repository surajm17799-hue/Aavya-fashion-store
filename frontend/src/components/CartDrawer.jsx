import React from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { formatINR } from "../lib/api";

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateQty, removeFromCart, subtotal } = useShop();
  if (!drawerOpen) return null;
  return (
    <div className="fixed inset-0 z-50" data-testid="cart-drawer">
      <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h3 className="font-serif text-xl text-[#1C1917]">Your Cart ({cart.length})</h3>
          <button onClick={() => setDrawerOpen(false)} data-testid="close-cart-drawer" aria-label="Close cart"><X strokeWidth={1.5} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#57534E] font-light">Your cart is empty.</p>
              <button onClick={() => setDrawerOpen(false)} className="btn-secondary mt-6">Continue Shopping</button>
            </div>
          ) : cart.map((item) => (
            <div key={item.product_id} className="flex gap-4" data-testid={`cart-item-${item.product_id}`}>
              <Link to={`/product/${item.slug}`} onClick={() => setDrawerOpen(false)} className="w-24 h-28 bg-[#FAFAF9] flex-shrink-0 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-base text-[#1C1917] leading-snug">{item.name}</h4>
                  <p className="text-sm text-[#57534E] mt-1">₹{formatINR(item.price)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-stone-200">
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="px-2 py-1 hover:bg-[#FAFAF9]" data-testid={`qty-minus-${item.product_id}`}><Minus size={12} /></button>
                    <span className="px-3 text-sm" data-testid={`qty-${item.product_id}`}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="px-2 py-1 hover:bg-[#FAFAF9]" data-testid={`qty-plus-${item.product_id}`}><Plus size={12} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product_id)} className="text-[#A8A29E] hover:text-[#991B1B]" data-testid={`remove-${item.product_id}`} aria-label="Remove"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="border-t px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#57534E]">Subtotal</span>
              <span className="font-medium text-[#1C1917]" data-testid="drawer-subtotal">₹{formatINR(subtotal)}</span>
            </div>
            <p className="text-xs text-[#A8A29E]">Shipping & coupons calculated at checkout.</p>
            <Link to="/checkout" onClick={() => setDrawerOpen(false)} className="btn-primary block text-center" data-testid="checkout-from-drawer">Checkout</Link>
            <Link to="/cart" onClick={() => setDrawerOpen(false)} className="block text-center text-xs uppercase tracking-[0.25em] text-[#57534E] hover:text-[#D4AF37]">View Full Cart</Link>
          </div>
        )}
      </aside>
    </div>
  );
}
