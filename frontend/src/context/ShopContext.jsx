import React, { createContext, useContext, useEffect, useState } from "react";

const ShopContext = createContext(null);

const loadLS = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => loadLS("aavya_cart", []));
  const [wishlist, setWishlist] = useState(() => loadLS("aavya_wishlist", []));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { localStorage.setItem("aavya_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("aavya_wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        slug: product.slug,
        quantity: qty,
      }];
    });
    setDrawerOpen(true);
  };

  const updateQty = (productId, qty) => {
    setCart((prev) => prev.map((i) => i.product_id === productId ? { ...i, quantity: Math.max(1, qty) } : i));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.filter((i) => i.id !== product.id);
      return [...prev, { id: product.id, name: product.name, image: product.images[0], price: product.price, slug: product.slug }];
    });
  };

  const inWishlist = (id) => wishlist.some((i) => i.id === id);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <ShopContext.Provider value={{
      cart, wishlist, drawerOpen, setDrawerOpen,
      addToCart, updateQty, removeFromCart, clearCart,
      toggleWishlist, inWishlist,
      subtotal, itemCount,
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
