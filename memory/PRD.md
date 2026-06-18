# Aavya Fashion and Jewellery — PRD

## Original Problem Statement
Build a modern, mobile-first eCommerce site for the Indian artificial jewellery brand "Aavya Fashion and Jewellery". Premium, elegant, feminine design with white background, blush/beige accents, gold highlights. Inspired by top Indian jewellery brands. Full eCommerce: hero, categories, trending, best sellers, why-choose-us, reviews, instagram grid, newsletter, footer. Product detail with gallery zoom, COD badge, styling tips, reviews. WhatsApp button, wishlist, coupons, easy checkout (UPI/COD/cards), order tracking. Logo provided: gold cursive Aavya with lotus.

## User Choices
- Real payment gateway: **Stripe** (sk_test_emergent test key)
- WhatsApp number: **+91 99991 89863**
- Images: high-quality public-domain (Unsplash / Pexels)
- Default coupon: **AAVYA10** (10% off, no min)
- Weekend sale: **WEEKEND15** (15% off, min ₹1,500)
- Bridal coupon: **BRIDAL500** (₹500 off, min ₹3,500)

## Architecture
- **Backend**: FastAPI + MongoDB (motor), emergentintegrations StripeCheckout
- **Frontend**: React 19 + react-router-dom v7 + framer-motion + lucide-react + Tailwind CSS + sonner toasts
- **State**: ShopContext (cart + wishlist persisted to localStorage)
- **Fonts**: Playfair Display (display), Outfit (body), Italianno (logo script)

## Implemented (Feb 2026)
- 8 seeded products across 4 categories (bridal, earrings, necklaces, oxidised)
- 4 seeded reviews with images
- Homepage with hero, marquee, bento categories, trending, weekend banner, best sellers, why-choose, reviews, Instagram grid, newsletter
- Shop with category filter + sort (price low/high, discount)
- Product detail: gallery thumbnails, hover zoom, accordions, COD badge, sticky mobile buy bar, customer reviews
- Cart drawer + full Cart page with coupon validation (server-side)
- Checkout: address validation, payment method selector (Stripe / COD), coupon, server-validated totals
- Stripe checkout: payment_transactions collection, polling for status on /order/success
- COD orders: order created with status `placed`
- Order tracking page (/track) with timeline UI
- Wishlist page with localStorage persistence
- Floating WhatsApp button (+91 99991 89863) + pulsing animation
- Policy pages (about, contact, shipping, returns, FAQ)
- Mobile responsive: hamburger menu, sticky mobile buy bar
- 25/25 backend pytest tests passing, ~95% frontend E2E coverage

## Critical Bug Fixed
- `Address.email` empty string crashed COD checkout. Fixed via Pydantic `field_validator` coercing "" → None, plus frontend now sends `undefined` for empty email and robustly parses array-form validation errors.

## P1 Backlog (Next Phase)
- Admin dashboard to manage products & orders
- Email/SMS order confirmation (Resend / Twilio)
- Real user accounts (login/signup) with order history
- Razorpay as alternate payment method (UPI-first for India)
- Product search with autocomplete
- Related products on PDP
- Size / variant selector for bracelets & rings
- Inventory deduction on order
- Stock warnings / out-of-stock UI

## P2 Backlog
- Internationalization (Hindi, regional languages)
- Loyalty points / referral program
- Gift cards
- Blog/styling content
- SEO meta tags per product
- PWA / app shell

## Files
- `/app/backend/server.py` — full API
- `/app/frontend/src/pages/` — Home, Shop, ProductDetail, Cart, Checkout, OrderSuccess, OrderTrack, Wishlist, Policy
- `/app/frontend/src/components/` — Header, Footer, ProductCard, CartDrawer, WhatsAppButton
- `/app/frontend/src/context/ShopContext.jsx` — cart & wishlist state
- `/app/frontend/src/lib/api.js` — axios client + INR formatter
- `/app/backend/tests/backend_test.py` — pytest regression suite
