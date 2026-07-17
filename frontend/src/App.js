import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { StormProvider } from "./context/StormContext";
import { CartProvider } from "./context/CartContext";
import StormBackground from "./components/StormBackground";
import AmbientAudio from "./components/AmbientAudio.js";
import FeaturedMerchPortal from "./components/FeaturedMerchPortal";
import SeoManager from "./components/SeoManager";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Music from "./pages/Music";
import MusicDetail from "./pages/MusicDetail";
import Videos from "./pages/Videos";
import Store from "./pages/Store";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Story from "./pages/Story";
import News from "./pages/News";
import PostDetail from "./pages/PostDetail";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Account from "./pages/Account";
import LegalPage from "./pages/LegalPage";

function App() {
  return (
    <StormProvider>
      <CartProvider>
        <div className="grain">
          <StormBackground />
          <AmbientAudio />
          <Toaster position="top-center" theme="dark" richColors />
          <BrowserRouter>
            <SeoManager />
            <FeaturedMerchPortal />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/music" element={<Music />} />
                <Route path="/music/:id" element={<MusicDetail />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/shop" element={<Store />} />
                <Route path="/shop/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/story" element={<Story />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<PostDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/account" element={<Account />} />
                <Route path="/privacy" element={<LegalPage slug="privacy" />} />
                <Route path="/terms" element={<LegalPage slug="terms" />} />
                <Route path="/shipping" element={<LegalPage slug="shipping" />} />
                <Route path="/returns" element={<LegalPage slug="returns" />} />
                <Route path="/accessibility" element={<LegalPage slug="accessibility" />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </CartProvider>
    </StormProvider>
  );
}

export default App;
