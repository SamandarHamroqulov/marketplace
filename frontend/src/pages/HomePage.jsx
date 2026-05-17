import { useState, useEffect } from 'react';
import api from '../api/client.js';
import { mapProduct } from '../api/mappers.js';
import ProductCard from '../components/ProductCard.jsx';

export default function HomePage({ setPage, onSelectProduct, wishlist, onWishToggle }) {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProducts({ limit: 3, sort: 'createdAt' })
      .then((res) => setFeatured((res.items || []).map(mapProduct)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <p className="hero-subtitle">Pro.Beyond.</p>
            <h1 className="hero-title">IPhone 14 <b>Pro</b></h1>
            <p className="hero-desc">Created to change everything for the better. For everyone.</p>
            <button type="button" className="hero-btn" onClick={() => setPage('catalog')}>Shop now</button>
          </div>
        </div>
      </section>

      <div className="banners">
        <div className="banner banner-light" onClick={() => setPage('catalog')} role="button" tabIndex={0}>
          <div className="banner-content">
            <p className="banner-label">New arrival</p>
            <h3 className="banner-title">Featured tech</h3>
            <p className="banner-desc">Discover the latest products in our catalog</p>
          </div>
        </div>
        <div className="banner banner-dark" onClick={() => setPage('catalog')} role="button" tabIndex={0}>
          <div className="banner-content">
            <p className="banner-label">Sale</p>
            <h3 className="banner-title">Special offers</h3>
            <p className="banner-desc">Up to 30% off on selected models this week</p>
          </div>
        </div>
      </div>

      <section className="featured-section">
        <div className="featured-header">
          <h2>Featured Products</h2>
          <button type="button" onClick={() => setPage('catalog')}>View all →</button>
        </div>
        <div className="products-grid">
          {loading && <p className="grid-message">Loading...</p>}
          {!loading && featured.length === 0 && <p className="grid-message">No products yet</p>}
          {!loading && featured.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelect={onSelectProduct}
              onWishToggle={onWishToggle}
              isWished={wishlist.includes(p.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
