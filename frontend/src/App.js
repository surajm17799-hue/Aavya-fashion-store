import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { ShopProvider } from "@/context/ShopContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import OrderTrack from "@/pages/OrderTrack";
import Wishlist from "@/pages/Wishlist";
import Policy from "@/pages/Policy";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ShopProvider>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/success" element={<OrderSuccess />} />
              <Route path="/track" element={<OrderTrack />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/policy/:slug" element={<Policy />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
          <Toaster position="top-center" richColors closeButton />
        </ShopProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
