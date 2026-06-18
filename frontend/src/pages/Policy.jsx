import React from "react";
import { useParams } from "react-router-dom";

const CONTENT = {
  about: {
    title: "About Aavya",
    body: [
      "Aavya Fashion and Jewellery was born from a love for India's timeless jewellery heritage and the modern woman's desire for elegance without extravagance.",
      "Every piece in our collection is hand-finished by skilled artisans in Jaipur, blending traditional techniques like kundan, polki, and meenakari with contemporary silhouettes that work for festivals, weddings, work, and everyday wear.",
      "We believe luxury isn't about price — it's about presence. Aavya is for the woman who walks into a room and quietly owns it.",
    ],
  },
  contact: {
    title: "Contact Us",
    body: [
      "Email: hello@aavyafashion.in",
      "Phone / WhatsApp: +91 99991 89863",
      "Studio: Johari Bazaar, Jaipur, Rajasthan",
      "Business hours: Mon – Sat · 10 AM – 7 PM IST",
    ],
  },
  shipping: {
    title: "Shipping Policy",
    body: [
      "We ship across India. Standard delivery in 2–5 working days depending on your location.",
      "Free shipping on all orders above ₹999. A flat ₹99 shipping fee applies on orders below ₹999.",
      "Cash on Delivery is available for orders up to ₹5,000.",
      "International shipping coming soon — write to us at hello@aavyafashion.in for special orders.",
    ],
  },
  returns: {
    title: "Return Policy",
    body: [
      "We offer 7-day easy returns on unworn items in original tags and packaging.",
      "Customised, bridal, and clearance items are non-returnable.",
      "To initiate a return, message us on WhatsApp +91 99991 89863 with your order number and reason.",
      "Refunds are processed within 5-7 business days after we receive the returned item.",
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    body: [
      "Is the jewellery real gold? — Our pieces are gold-plated brass and oxidised silver alloys, designed to feel and look like fine jewellery at a fraction of the price.",
      "How long will the gold plating last? — With proper care (avoiding perfume, water, sweat), the plating lasts 12+ months. We use micron-thick plating for durability.",
      "Do you offer COD? — Yes, COD is available on orders up to ₹5,000 across India.",
      "Can I customise a bridal set? — Yes! WhatsApp us at +91 99991 89863 for custom bridal orders. Lead time is 2-3 weeks.",
      "How do I track my order? — Use the Track Order page or click the link in your confirmation email.",
    ],
  },
};

export default function Policy() {
  const { slug } = useParams();
  const data = CONTENT[slug] || CONTENT.about;
  return (
    <div className="px-4 md:px-12 py-20 max-w-3xl mx-auto" data-testid={`policy-page-${slug}`}>
      <p className="overline">Aavya</p>
      <h1 className="font-serif text-4xl md:text-5xl text-[#1C1917] mt-3 font-light mb-10">{data.title}</h1>
      <div className="space-y-6 text-[#57534E] font-light leading-relaxed">
        {data.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}
