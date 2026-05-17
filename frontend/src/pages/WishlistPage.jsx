import { useState, useEffect } from 'react';
import api from '../api/client.js';
import { mapProduct } from '../api/mappers.js';
import ProductCard from '../components/ProductCard.jsx';

export default function WishlistPage({ wishlist, onSelectProduct, onWishToggle }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      return;
    }
    api
      .getProducts({ limit: 100 })
      .then((res) => {
        const items = (res.items || []).map(mapProduct).filter((p) => wishlist.includes(p.id));
        setProducts(items);
      })
      .catch(() => setProducts([]));
  }, [wishlist]);

  return (
    <div className="wishlist-page">
      <h2>Wishlist ({wishlist.length})</h2>
      {wishlist.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">❤️</p>
          <p className="empty-title">No saved items yet</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelect={onSelectProduct}
              onWishToggle={onWishToggle}
              isWished
            />
          ))}
        </div>
      )}
    </div>
  );
}
