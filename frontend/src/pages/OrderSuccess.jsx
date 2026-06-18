import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Package, MessageCircle, Loader2 } from "lucide-react";
import { getCheckoutStatus } from "../lib/api";
import { useShop } from "../context/ShopContext";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const cod = params.get("cod");
  const orderNumberParam = params.get("order_number");
  const navigate = useNavigate();
  const { clearCart } = useShop();

  const [status, setStatus] = useState(cod ? "paid" : "checking");
  const [orderNumber, setOrderNumber] = useState(orderNumberParam || "");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (cod) {
      clearCart();
      return;
    }
    if (!sessionId) {
      navigate("/");
      return;
    }
    let active = true;
    const poll = async (n) => {
      if (!active) return;
      if (n >= 8) { setStatus("timeout"); return; }
      try {
        const res = await getCheckoutStatus(sessionId);
        if (res.payment_status === "paid") {
          if (active) {
            setStatus("paid");
            setOrderNumber(res.order_number || "");
            clearCart();
            sessionStorage.removeItem("aavya_pending_order");
          }
          return;
        }
        if (res.status === "expired") { setStatus("expired"); return; }
        setAttempts(n + 1);
        setTimeout(() => poll(n + 1), 2200);
      } catch {
        setTimeout(() => poll(n + 1), 2500);
      }
    };
    poll(0);
    return () => { active = false; };
    // eslint-disable-next-line
  }, [sessionId]);

  return (
    <div className="px-4 md:px-12 py-20 md:py-32 max-w-2xl mx-auto text-center" data-testid="order-success-page">
      {status === "checking" && (
        <div data-testid="status-checking">
          <Loader2 className="mx-auto text-[#D4AF37] animate-spin" size={48} strokeWidth={1.2} />
          <h1 className="font-serif text-3xl md:text-4xl text-[#1C1917] mt-6 font-light">Confirming your payment…</h1>
          <p className="text-[#57534E] mt-3">Please don't close this window. (Attempt {attempts + 1}/8)</p>
        </div>
      )}

      {status === "paid" && (
        <div data-testid="status-paid">
          <CheckCircle2 className="mx-auto text-[#166534]" size={64} strokeWidth={1.2} />
          <p className="overline mt-6">Order Confirmed</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1C1917] mt-3 font-light">Thank you for your order!</h1>
          {orderNumber && (
            <div className="mt-8 bg-[#FAFAF9] p-6 inline-block">
              <p className="text-xs uppercase tracking-widest text-[#57534E]">Order Number</p>
              <p className="font-serif text-2xl text-[#1C1917] mt-1" data-testid="order-number">{orderNumber}</p>
            </div>
          )}
          <p className="text-[#57534E] mt-8 max-w-md mx-auto">
            We'll send a confirmation to your email and ship your order in 1-2 business days. 
            {cod ? " Pay cash on delivery when your order arrives." : ""}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-10">
            <Link to={`/track?order=${orderNumber}`} className="btn-primary inline-flex items-center gap-2"><Package size={14} /> Track Order</Link>
            <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
          </div>
          <a href={`https://wa.me/919999189863?text=Hi%20Aavya!%20My%20order%20${orderNumber}`} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm text-[#25D366] hover:underline">
            <MessageCircle size={14} /> Need help? WhatsApp us
          </a>
        </div>
      )}

      {(status === "expired" || status === "timeout") && (
        <div data-testid="status-failed">
          <h1 className="font-serif text-3xl text-[#1C1917]">Payment {status === "expired" ? "expired" : "is taking longer than expected"}</h1>
          <p className="text-[#57534E] mt-4">If you were charged, your order will be confirmed shortly. Otherwise, please try again.</p>
          <Link to="/checkout" className="btn-primary mt-8 inline-block">Try Again</Link>
        </div>
      )}
    </div>
  );
}
