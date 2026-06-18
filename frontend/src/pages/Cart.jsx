import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, Tag, X } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { applyCoupon, formatINR } from "../lib/api";
import { toast } from "sonner";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQty, removeFromCart, subtotal } = useShop();
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);

  const onApply = async (e) => {
    e.preventDefault();
    try {
      const c = await applyCoupon(couponCode, subtotal);
      setCoupon(c);
      toast.success(`Coupon ${c.code} applied!`, { description: `You saved ₹${formatINR(c.discount)}` });
    } catch (err) {
      const d = err.response?.data?.detail;
      const msg = Array.isArray(d) ? (d[0]?.msg || "Invalid coupon") : (typeof d === "string" ? d : "Invalid coupon");
      toast.error(msg);
    }
  };

  const shipping = subtotal >= 999 ? 0 : (subtotal > 0 ? 99 : 0);
  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  if (cart.length === 0) {
    return (
      <div className="px-4 md:px-12 py-32 text-center" data-testid="empty-cart">
        <p className="overline">Your cart</p>
        <h1 className="font-serif text-4xl md:text-5xl text-[#1C1917] mt-3 font-light">Looks a little empty</h1>
        <p className="text-[#57534E] mt-4">Browse our collections to find something you love.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-block">Shop Collections</Link>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 py-12" data-testid="cart-page">
      <p className="overline">Shopping bag</p>
      <h1 className="font-serif text-4xl md:text-5xl text-[#1C1917] mt-3 font-light mb-12">Your Cart ({cart.length})</h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-6">
          {cart.map((item) => (
            <div key={item.product_id} className="flex gap-5 pb-6 border-b border-stone-200" data-testid={`cart-row-${item.product_id}`}>
              <Link to={`/product/${item.slug}`} className="w-32 h-40 bg-[#FAFAF9] flex-shrink-0 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl text-[#1C1917]">{item.name}</h3>
                  <p className="text-sm text-[#57534E] mt-1">₹{formatINR(item.price)} each</p>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-center border border-stone-300">
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="px-3 py-2 hover:bg-[#FAFAF9]"><Minus size={14} /></button>
                    <span className="px-4 py-2 text-sm min-w-[40px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="px-3 py-2 hover:bg-[#FAFAF9]"><Plus size={14} /></button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#1C1917]">₹{formatINR(item.price * item.quantity)}</p>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-xs text-[#A8A29E] hover:text-[#991B1B] flex items-center gap-1 mt-2">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-[#FAFAF9] p-8 h-fit lg:sticky lg:top-32" data-testid="cart-summary">
          <h2 className="font-serif text-2xl text-[#1C1917] mb-6">Order Summary</h2>

          {/* Coupon */}
          {coupon ? (
            <div className="flex items-center justify-between bg-[#FDF2F8] px-4 py-3 mb-5">
              <div className="flex items-center gap-2 text-sm">
                <Tag size={14} className="text-[#D4AF37]" />
                <span className="font-medium">{coupon.code}</span>
                <span className="text-[#57534E]">applied</span>
              </div>
              <button onClick={() => setCoupon(null)} aria-label="Remove coupon"><X size={14} /></button>
            </div>
          ) : (
            <form onSubmit={onApply} className="flex gap-2 mb-5" data-testid="coupon-form">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="box-input flex-1 !py-3 text-sm"
                data-testid="coupon-input"
              />
              <button type="submit" className="btn-secondary !py-3 !px-5 !text-[10px]" data-testid="coupon-apply">Apply</button>
            </form>
          )}
          <p className="text-xs text-[#A8A29E] mb-6">Try: AAVYA10 · WEEKEND15 · BRIDAL500</p>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[#57534E]">Subtotal</span><span data-testid="summary-subtotal">₹{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#57534E]">Shipping</span><span>{shipping === 0 ? "FREE" : `₹${formatINR(shipping)}`}</span></div>
            {discount > 0 && <div className="flex justify-between text-[#166534]"><span>Discount</span><span>-₹{formatINR(discount)}</span></div>}
            <div className="border-t border-stone-300 pt-3 mt-3 flex justify-between font-serif text-lg">
              <span>Total</span>
              <span data-testid="summary-total">₹{formatINR(total)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout", { state: { coupon: coupon?.code } })}
            className="btn-primary w-full mt-6"
            data-testid="proceed-to-checkout"
          >Proceed to Checkout</button>
          <Link to="/shop" className="block text-center text-xs uppercase tracking-[0.25em] text-[#57534E] hover:text-[#D4AF37] mt-4">Continue Shopping</Link>
        </aside>
      </div>
    </div>
  );
}
