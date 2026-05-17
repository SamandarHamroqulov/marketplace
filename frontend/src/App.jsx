import { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import api from './api/client.js';
import { mapProduct, mapCartItem } from './api/mappers.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';

const STORE_PAGES = ['home', 'catalog', 'product', 'cart', 'wishlist', 'checkout'];

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch {
      return [];
    }
  });
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState('');

  const syncCartFromApi = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getCart();
      const items = (data.items || []).map(mapCartItem);
      setCart(items);
    } catch {
      /* keep local cart */
    }
  }, [user]);

  useEffect(() => {
    if (user) syncCartFromApi();
  }, [user, syncCartFromApi]);

  const handleSelectProduct = async (product) => {
    try {
      const full = await api.getProduct(product.id);
      setSelectedProduct(mapProduct(full));
    } catch {
      setSelectedProduct(product);
    }
    setPage('product');
  };

  const handleWishToggle = useCallback((productId) => {
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem('wishlist', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleAddToCart = async (product) => {
    if (user) {
      try {
        await api.addToCart(product.id, 1);
        await syncCartFromApi();
        return;
      } catch {
        /* local fallback */
      }
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          ...product,
          qty: 1,
          sku: `#${String(product.id).replace(/-/g, '').slice(0, 14)}`,
        },
      ];
    });
  };

  const handleUpdateQty = async (item, qty) => {
    if (user && item.cartItemId) {
      try {
        await api.updateCartItem(item.cartItemId, qty);
        await syncCartFromApi();
        return;
      } catch {
        /* fallback */
      }
    }
    setCart((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, qty } : i)),
    );
  };

  const handleRemoveFromCart = async (item) => {
    if (user && item.cartItemId) {
      try {
        await api.removeFromCart(item.cartItemId);
        await syncCartFromApi();
        return;
      } catch {
        /* fallback */
      }
    }
    setCart((prev) => prev.filter((i) => i.id !== item.id));
  };

  const showNavbar = STORE_PAGES.includes(page) || page === 'account';
  return (
    <>
      {showNavbar && (
        <Navbar
          page={page}
          setPage={setPage}
          cartCount={cart.reduce((s, i) => s + i.qty, 0)}
          wishCount={wishlist.length}
          query={query}
          setQuery={setQuery}
        />
      )}

      {page === 'home' && (
        <>
          <HomePage
            setPage={setPage}
            onSelectProduct={handleSelectProduct}
            wishlist={wishlist}
            onWishToggle={handleWishToggle}
          />
          <Footer />
        </>
      )}

      {page === 'catalog' && (
        <CatalogPage
          query={query}
          setPage={setPage}
          onSelectProduct={handleSelectProduct}
          wishlist={wishlist}
          onWishToggle={handleWishToggle}
        />
      )}

      {page === 'product' && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          wishlist={wishlist}
          onWishToggle={handleWishToggle}
          setPage={setPage}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {page === 'cart' && (
        <CartPage
          cart={cart}
          setPage={setPage}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemoveFromCart}
        />
      )}

      {page === 'checkout' && (
        <CheckoutPage cart={cart} setCart={setCart} setPage={setPage} />
      )}

      {page === 'wishlist' && (
        <>
          <WishlistPage
            wishlist={wishlist}
            onSelectProduct={handleSelectProduct}
            onWishToggle={handleWishToggle}
            setPage={setPage}
          />
          <Footer />
        </>
      )}

      {page === 'login' && <LoginPage setPage={setPage} />}
      {page === 'register' && <RegisterPage setPage={setPage} />}
      {page === 'account' && <AccountPage setPage={setPage} />}
      {page === 'admin' && <AdminPage setPage={setPage} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
