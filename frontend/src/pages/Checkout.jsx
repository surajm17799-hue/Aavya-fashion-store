import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CreditCard, Banknote, Lock, Tag } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { applyCoupon, initCheckout, formatINR } from "../lib/api";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, subtotal, clearCart } = useShop();

  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", line1: "", line2: "", city: "", state: "", pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [couponCode, setCouponCode] = useState(location.state?.coupon || "");
  const [coupon, setCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const shipping = subtotal >= 999 ? 0 : (subtotal > 0 ? 99 : 0);
  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  React.useEffect(() => {
    if (cart.length === 0) navigate("/shop");
  }, [cart, navigate]);

  React.useEffect(() => {
    // Auto-apply coupon if passed from cart
    if (couponCode && !coupon && subtotal > 0) {
      applyCoupon(couponCode, subtotal).then(setCoupon).catch(() => {});
    }
    // eslint-disable-next-line
  }, [subtotal]);

  const onApplyCoupon = async (e) => {
    e.preventDefault();
    try {
      const c = await applyCoupon(couponCode, subtotal);
      setCoupon(c);
      toast.success(`${c.code} applied — saved ₹${formatINR(c.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid coupon");
    }
  };

  const onPlaceOrder = async (e) => {
    e.preventDefault();
    // Validate
    for (const k of ["full_name", "phone", "line1", "city", "state", "pincode"]) {
      if (!form[k]) { toast.error("Please fill all required address fields"); return; }
    }
    if (!/^\d{10}$/.test(form.phone)) { toast.error("Enter a valid 10-digit phone"); return; }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error("Enter a valid 6-digit pincode"); return; }

    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((i) => ({ product_id: i.product_id, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
        address: form,
        coupon_code: coupon?.code || null,
        payment_method: paymentMethod,
        origin_url: window.location.origin,
      };
      const res = await initCheckout(payload);
      if (res.payment_method === "cod") {
        clearCart();
        navigate(`/order/success?cod=1&order_number=${res.order_number}`);
      } else if (res.checkout_url) {
        // Don't clear cart yet — will clear on success page
        sessionStorage.setItem("aavya_pending_order", res.order_number);
        window.location.href = res.checkout_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not place order");
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 md:px-12 py-12" data-testid="checkout-page">
      <p className="overline">Checkout</p>
      <h1 className="font-serif text-4xl md:text-5xl text-[#1C1917] mt-3 font-light mb-12">Almost There ✦</h1>

      <form onSubmit={onPlaceOrder} className="grid lg:grid-cols-[1fr_420px] gap-12">
        {/* Form */}
        <div className="space-y-10">
          <section data-testid="address-section">
            <h2 className="font-serif text-xl text-[#1C1917] mb-6">Shipping Address</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <input className="box-input" placeholder="Full Name *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} data-testid="input-full-name" required />
              <input className="box-input" placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="input-phone" required />
              <input className="box-input md:col-span-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="input-email" />
              <input className="box-input md:col-span-2" placeholder="Address Line 1 *" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} data-testid="input-line1" required />
              <input className="box-input md:col-span-2" placeholder="Address Line 2 (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} data-testid="input-line2" />
              <input className="box-input" placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} data-testid="input-city" required />
              <input className="box-input" placeholder="State *" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} data-testid="input-state" required />
              <input className="box-input" placeholder="Pincode *" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} data-testid="input-pincode" required />
            </div>
          </section>

          <section data-testid="payment-section">
            <h2 className="font-serif text-xl text-[#1C1917] mb-6">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-4 p-5 border cursor-pointer transition-colors ${paymentMethod === "stripe" ? "border-[#D4AF37] bg-[#FDF2F8]" : "border-stone-200"}`} data-testid="payment-stripe">
                <input type="radio" name="pm" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} className="accent-[#D4AF37]" />
                <CreditCard size={20} strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="font-medium text-[#1C1917]">Pay Online (Cards · UPI · Wallets)</p>
                  <p className="text-xs text-[#57534E]">Secure payment via Stripe. Get 10% cashback on first order.</p>
                </div>
                <Lock size={14} className="text-[#57534E]" />
              </label>
              <label className={`flex items-center gap-4 p-5 border cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-[#D4AF37] bg-[#FDF2F8]" : "border-stone-200"}`} data-testid="payment-cod">
                <input type="radio" name="pm" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-[#D4AF37]" />
                <Banknote size={20} strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="font-medium text-[#1C1917]">Cash on Delivery</p>
                  <p className="text-xs text-[#57534E]">Pay when your order arrives. ₹49 COD fee included in shipping.</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="bg-[#FAFAF9] p-8 h-fit lg:sticky lg:top-32" data-testid="checkout-summary">
          <h2 className="font-serif text-xl text-[#1C1917] mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
            {cart.map((i) => (
              <div key={i.product_id} className="flex gap-3" data-testid={`summary-item-${i.product_id}`}>
                <div className="w-14 h-16 bg-white overflow-hidden flex-shrink-0 relative">
                  <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                  <span className="absolute -top-1 -right-1 bg-[#1C1917] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{i.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1C1917] font-medium truncate">{i.name}</p>
                  <p className="text-xs text-[#57534E]">₹{formatINR(i.price * i.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {coupon ? (
            <div className="flex items-center justify-between bg-[#FDF2F8] px-3 py-2 mb-4 text-sm">
              <span className="flex items-center gap-2"><Tag size={12} /> {coupon.code} applied</span>
              <button type="button" onClick={() => setCoupon(null)} className="text-xs text-[#A8A29E] hover:text-[#1C1917]">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2 mb-4">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon" className="box-input flex-1 !py-2 text-sm" data-testid="checkout-coupon-input" />
              <button type="button" onClick={onApplyCoupon} className="btn-secondary !py-2 !px-4 !text-[10px]" data-testid="checkout-coupon-apply">Apply</button>
            </div>
          )}

          <div className="space-y-2 text-sm border-t border-stone-300 pt-4">
            <div className="flex justify-between"><span className="text-[#57534E]">Subtotal</span><span>₹{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#57534E]">Shipping</span><span>{shipping === 0 ? "FREE" : `₹${formatINR(shipping)}`}</span></div>
            {discount > 0 && <div className="flex justify-between text-[#166534]"><span>Discount</span><span>-₹{formatINR(discount)}</span></div>}
            <div className="flex justify-between font-serif text-lg pt-3 border-t border-stone-300">
              <span>Total</span><span data-testid="checkout-total">₹{formatINR(total)}</span>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 disabled:opacity-50" data-testid="place-order-button">
            {submitting ? "Processing..." : paymentMethod === "cod" ? "Place Order (COD)" : `Pay ₹${formatINR(total)}`}
          </button>
          <p className="text-xs text-[#A8A29E] text-center mt-4 flex items-center justify-center gap-1.5"><Lock size={11} /> Secure 256-bit SSL encryption</p>
          <Link to="/cart" className="block text-center text-xs uppercase tracking-[0.25em] text-[#57534E] hover:text-[#D4AF37] mt-3">← Back to Cart</Link>
        </aside>
      </form>
    </div>
  );
}
