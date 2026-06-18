import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Package, MapPin, CheckCircle2, Clock, Truck } from "lucide-react";
import { trackOrder, formatINR } from "../lib/api";
import { toast } from "sonner";

const STAGES = [
  { key: "placed", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

export default function OrderTrack() {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const onTrack = async (e) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    try {
      const o = await trackOrder(orderNumber.trim().toUpperCase());
      setOrder(o);
    } catch (err) {
      toast.error("Order not found. Please check the order number.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("order")) onTrack();
    // eslint-disable-next-line
  }, []);

  const currentStage = order ? (
    order.status === "confirmed" || order.payment_status === "paid" ? 1 :
    order.status === "placed" ? 0 :
    order.status === "shipped" ? 2 :
    order.status === "delivered" ? 3 : 0
  ) : -1;

  return (
    <div className="px-4 md:px-12 py-16 max-w-3xl mx-auto" data-testid="track-page">
      <p className="overline text-center">Order Tracking</p>
      <h1 className="font-serif text-4xl md:text-5xl text-[#1C1917] mt-3 font-light text-center mb-12">Where's My Order?</h1>

      <form onSubmit={onTrack} className="flex gap-3 mb-12" data-testid="track-form">
        <input
          className="box-input flex-1"
          placeholder="Enter order number (e.g. AAV240101ABCD)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          data-testid="track-input"
        />
        <button type="submit" disabled={loading} className="btn-primary" data-testid="track-submit">
          {loading ? "Tracking..." : "Track"}
        </button>
      </form>

      {order && (
        <div className="bg-[#FAFAF9] p-8" data-testid="order-details">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-8 pb-6 border-b border-stone-200">
            <div>
              <p className="overline">Order</p>
              <p className="font-serif text-2xl text-[#1C1917] mt-1">{order.order_number}</p>
              <p className="text-xs text-[#57534E] mt-1">Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-[#57534E]">Total</p>
              <p className="font-serif text-2xl text-[#1C1917] mt-1">₹{formatINR(order.total)}</p>
              <span className={`inline-block mt-1 text-[10px] uppercase tracking-widest px-2 py-1 ${order.payment_status === "paid" ? "bg-[#166534] text-white" : "bg-[#FDF2F8] text-[#1C1917]"}`}>
                {order.payment_method === "cod" ? "COD" : "Paid"} · {order.payment_status}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-4 gap-2 mb-10" data-testid="order-timeline">
            {STAGES.map((s, ix) => {
              const Icon = s.icon;
              const active = ix <= currentStage;
              return (
                <div key={s.key} className="text-center">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${active ? "bg-[#D4AF37] text-white" : "bg-stone-200 text-stone-400"}`}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <p className={`text-xs mt-2 ${active ? "text-[#1C1917] font-medium" : "text-[#A8A29E]"}`}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Items */}
          <h3 className="text-sm uppercase tracking-widest text-[#57534E] mb-4">Items</h3>
          <div className="space-y-4 mb-6">
            {order.items.map((i, ix) => (
              <div key={ix} className="flex gap-3 items-center" data-testid={`order-item-${ix}`}>
                <img src={i.image} alt={i.name} className="w-14 h-16 object-cover bg-white" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1C1917]">{i.name}</p>
                  <p className="text-xs text-[#57534E]">Qty: {i.quantity} · ₹{formatINR(i.price)}</p>
                </div>
                <p className="text-sm">₹{formatINR(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="border-t border-stone-200 pt-6">
            <h3 className="text-sm uppercase tracking-widest text-[#57534E] mb-3 flex items-center gap-2"><MapPin size={14} /> Shipping To</h3>
            <p className="text-sm text-[#1C1917]">{order.address.full_name}</p>
            <p className="text-sm text-[#57534E]">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
            <p className="text-sm text-[#57534E]">Phone: {order.address.phone}</p>
          </div>
        </div>
      )}

      {!order && !loading && (
        <p className="text-center text-[#A8A29E] text-sm">Enter your order number above to see status.</p>
      )}
    </div>
  );
}
