import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fetchProducts = (params = {}) => api.get("/products", { params }).then((r) => r.data);
export const fetchProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data);
export const fetchReviews = (params = {}) => api.get("/reviews", { params }).then((r) => r.data);
export const applyCoupon = (code, subtotal) => api.post("/coupon/apply", { code, subtotal }).then((r) => r.data);
export const subscribeNewsletter = (email) => api.post("/newsletter", { email }).then((r) => r.data);
export const initCheckout = (payload) => api.post("/checkout", payload).then((r) => r.data);
export const getCheckoutStatus = (sessionId) => api.get(`/checkout/status/${sessionId}`).then((r) => r.data);
export const trackOrder = (orderNumber) => api.get(`/order/${orderNumber}`).then((r) => r.data);

export const formatINR = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
