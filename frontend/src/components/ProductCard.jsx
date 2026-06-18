import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { formatINR } from "../lib/api";

export default function ProductCard({ product, testIdPrefix = "product" }) {
  const { addToCart, toggleWishlist, inWishlist } = useShop();
  const wished = inWishlist(product.id);

  return (
    <article className="product-card group" data-testid={`${testIdPrefix}-card-${product.slug}`}>
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden bg-[#FAFAF9] aspect-[4/5]">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="product-img w-full h-full object-cover"
        />
        {product.discount_pct ? (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#1C1917] text-[10px] uppercase tracking-widest px-2.5 py-1" data-testid={`discount-badge-${product.slug}`}>
            -{product.discount_pct}% Off
          </span>
        ) : null}
        {product.badges?.includes("Bestseller") && (
          <span className="absolute top-3 right-3 bg-[#D4AF37] text-white text-[10px] uppercase tracking-widest px-2.5 py-1">Bestseller</span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          aria-label="Toggle wishlist"
          data-testid={`wishlist-toggle-${product.slug}`}
          className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-[#FDF2F8] transition-colors"
        >
          <Heart strokeWidth={1.5} size={16} className={wished ? "fill-[#991B1B] text-[#991B1B]" : ""} />
        </button>
      </Link>

      <div className="pt-4 flex flex-col gap-1.5">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-serif text-base md:text-lg text-[#1C1917] leading-snug hover:text-[#D4AF37] transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-medium text-[#1C1917]" data-testid={`price-${product.slug}`}>₹{formatINR(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-xs text-[#A8A29E] line-through">₹{formatINR(product.compare_at_price)}</span>
          )}
        </div>
        <button
          onClick={() => addToCart(product)}
          data-testid={`add-to-cart-${product.slug}`}
          className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#57534E] hover:text-[#D4AF37] transition-colors w-fit"
        >
          <ShoppingBag size={14} strokeWidth={1.5} /> Add to Cart
        </button>
      </div>
    </article>
  );
}
