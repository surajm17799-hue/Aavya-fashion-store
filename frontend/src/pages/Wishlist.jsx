import React from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { formatINR } from "../lib/api";

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  if (wishlist.length === 0) {
    return (
      <div className="px-4 md:px-12 py-32 text-center" data-testid="empty-wishlist">
        <Heart className="mx-auto text-[#D4AF37]" size={48} strokeWidth={1.2} />
        <h1 className="font-serif text-4xl text-[#1C1917] mt-6 font-light">Your wishlist is empty</h1>
        <p className="text-[#57534E] mt-3">Save your favourite pieces for later.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-block">Browse Jewellery</Link>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 py-12" data-testid="wishlist-page">
      <p className="overline">Your wishlist</p>
      <h1 className="font-serif text-4xl md:text-5xl text-[#1C1917] mt-3 font-light mb-10">Saved For Later ({wishlist.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {wishlist.map((item) => (
          <article key={item.id} className="group" data-testid={`wishlist-item-${item.id}`}>
            <Link to={`/product/${item.slug}`} className="block relative aspect-[4/5] bg-[#FAFAF9] overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <button onClick={(e) => { e.preventDefault(); toggleWishlist({ id: item.id }); }} className="absolute top-3 right-3 w-9 h-9 bg-white/90 flex items-center justify-center" data-testid={`remove-wishlist-${item.id}`}>
                <Trash2 size={14} />
              </button>
            </Link>
            <div className="pt-4">
              <h3 className="font-serif text-lg text-[#1C1917]">{item.name}</h3>
              <p className="text-sm text-[#1C1917] mt-1">₹{formatINR(item.price)}</p>
              <button onClick={() => addToCart({ id: item.id, name: item.name, images: [item.image], price: item.price, slug: item.slug })} className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#57534E] hover:text-[#D4AF37]" data-testid={`wishlist-to-cart-${item.id}`}>
                <ShoppingBag size={14} /> Move to Cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
