import axios from "axios";

// Frontend and API are deployed together on Vercel. When no external
// backend URL is supplied, use the current site's /api route.
const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

export const getBooks = (category) => api.get("/books", { params: category ? { category } : {} }).then((r) => r.data);
export const getBook = (id) => api.get(`/books/${id}`).then((r) => r.data);
export const getMusic = () => api.get("/music").then((r) => r.data);
export const getMusicItem = (id) => api.get(`/music/${id}`).then((r) => r.data);
export const getVideos = () => api.get("/videos").then((r) => r.data);
export const getProducts = (category) => api.get("/products", { params: category ? { category } : {} }).then((r) => r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then((r) => r.data);
export const getPosts = () => api.get("/posts").then((r) => r.data);
export const getPost = (id) => api.get(`/posts/${id}`).then((r) => r.data);
export const getFaqs = () => api.get("/faqs").then((r) => r.data);
export const submitContact = (data) => api.post("/contact", data).then((r) => r.data);
export const subscribeNewsletter = (data) => api.post("/newsletter", data).then((r) => r.data);
export const createCheckout = (data) => api.post("/checkout/session", data).then((r) => r.data);
export const getCheckoutStatus = (sid) => api.get(`/checkout/status/${sid}`).then((r) => r.data);

export default api;
