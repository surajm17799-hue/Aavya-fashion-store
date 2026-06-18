import React from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "919999189863";
const WHATSAPP_TEXT = "Hi Aavya! I'd like to know more about your jewellery collection.";

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-floating-button"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_8px_28px_rgba(37,211,102,0.35)] hover:scale-110 transition-transform duration-300">
        <MessageCircle strokeWidth={1.8} size={26} fill="white" />
      </span>
      <span className="absolute right-[68px] top-1/2 -translate-y-1/2 hidden md:block whitespace-nowrap bg-[#1C1917] text-white text-xs px-3 py-2 tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
        Chat with us
      </span>
    </a>
  );
}
