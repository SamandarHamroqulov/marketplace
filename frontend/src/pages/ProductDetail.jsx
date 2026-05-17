import { useState, useEffect } from 'react';
import api from '../api/client.js';
import { mapProduct, mapReview } from '../api/mappers.js';
import Icon from '../components/Icon.jsx';
import Icons from '../components/Icons.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

const RATING_LEVEL_LABELS = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

function computeRatingLabels(reviews) {
  const counts = [0, 0, 0, 0, 0]; // index 0 = 1 yulduz, 4 = 5 yulduz
  reviews.forEach((r) => {
    const idx = Math.min(Math.max(Math.round(r.rating) - 1, 0), 4);
    counts[idx]++;
  });
  // 5 yulduzdan 1 yulduzga qadar (Excellent → Poor)
  return counts
    .map((count, i) => ({ label: RATING_LEVEL_LABELS[i], count, star: i + 1 }))
    .reverse();
}

export default function ProductDetail({
  product,
  onAddToCart,
  wishlist,
  onWishToggle,
  setPage,
  onSelectProduct,
}) {
  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(product.storage.length - 1);
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const ratingLabels = computeRatingLabels(reviews);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating;

  const thumbImages = product.images?.length ? product.images : [product.image];

  useEffect(() => {
    api.getRelatedProducts(product.id).then((items) => setRelated(items.map(mapProduct))).catch(() => setRelated([]));
    api.getReviews(product.id).then((items) => setReviews(items.map(mapReview))).catch(() => setReviews([]));
  }, [product.id]);

  const handleAddToCart = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.createReview({ productId: product.id, rating: reviewRating, comment });
      const items = await api.getReviews(product.id);
      setReviews(items.map(mapReview));
      setComment('');
      setReviewRating(5);
    } catch (err) {
      setComment('');
    }
  };

  const specEntries = Object.entries(product.detailSpecs || {});

  return (
    <div className="store-page">
      <div className="page-content">
        <nav className="breadcrumb">
          <span onClick={() => setPage('home')}>Home</span>
          <Icon d="M9 18l6-6-6-6" size={14} />
          <span onClick={() => setPage('catalog')}>Catalog</span>
          <Icon d="M9 18l6-6-6-6" size={14} />
          <span onClick={() => setPage('catalog')}>Smartphones</span>
          <Icon d="M9 18l6-6-6-6" size={14} />
          <span onClick={() => setPage('catalog')}>{product.brand}</span>
          <Icon d="M9 18l6-6-6-6" size={14} />
          <span className="current">{product.name}</span>
        </nav>

        <div className="detail-page">
          <div className="detail-grid">
            <div className="gallery">
              <div className="thumbs">
                {thumbImages.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`thumb${activeThumb === i ? ' active' : ''}`}
                    onClick={() => setActiveThumb(i)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
              <div className="main-img-wrap">
                <img className="main-img" src={thumbImages[activeThumb]} alt={product.name} />
              </div>
            </div>

            <div className="detail-info">
              <h1 className="product-title">{product.name}</h1>
              <div className="price-row">
                <span className="price-new">${product.price.toLocaleString()}</span>
                {product.oldPrice && (
                  <span className="price-old">${product.oldPrice.toLocaleString()}</span>
                )}
              </div>

              <div className="color-picker">
                <p className="picker-label">Select color:</p>
                <div className="colors">
                  {product.colors.map((c, i) => (
                    <button
                      type="button"
                      key={c}
                      className={`color-dot${selectedColor === i ? ' active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setSelectedColor(i)}
                      aria-label={`Color ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="storage-picker">
                <div className="storage-opts">
                  {product.storage.map((s, i) => (
                    <button
                      type="button"
                      key={s}
                      className={`storage-btn${selectedStorage === i ? ' active' : ''}`}
                      onClick={() => setSelectedStorage(i)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="specs-grid">
                <div className="spec-card">
                  <p className="spec-label">Screen size</p>
                  <p className="spec-val">{product.screenSize}</p>
                </div>
                <div className="spec-card">
                  <p className="spec-label">CPU</p>
                  <p className="spec-val">{product.cpu}</p>
                </div>
                <div className="spec-card">
                  <p className="spec-label">Number of Cores</p>
                  <p className="spec-val">{product.cores}</p>
                </div>
                <div className="spec-card">
                  <p className="spec-label">Main camera</p>
                  <p className="spec-val">{product.mainCam}</p>
                </div>
                <div className="spec-card">
                  <p className="spec-label">Front camera</p>
                  <p className="spec-val">{product.frontCam}</p>
                </div>
                <div className="spec-card">
                  <p className="spec-label">Battery capacity</p>
                  <p className="spec-val">{product.battery}</p>
                </div>
              </div>

              <p className="detail-desc">
                {product.description || `Enhanced capabilities thanks to ${product.name}, an even larger display, and a battery that lasts for hours.`}
                {' '}
                <button type="button" className="link-btn">more...</button>
              </p>

              <div className="detail-actions">
                <button type="button" className="btn-wish" onClick={() => onWishToggle(product.id)}>
                  {wishlist.includes(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
                <button type="button" className="btn-cart" onClick={handleAddToCart}>
                  {added ? 'Added!' : 'Add to Cart'}
                </button>
              </div>

              <div className="delivery-info">
                <div className="delivery-card">
                  <div className="delivery-icon">{Icons.delivery}</div>
                  <p className="delivery-title">Free Delivery</p>
                  <p className="delivery-val">1-2 day</p>
                </div>
                <div className="delivery-card">
                  <div className="delivery-icon">{Icons.check}</div>
                  <p className="delivery-title">In Stock</p>
                  <p className="delivery-val">{product.inStock ? 'Today' : 'Unavailable'}</p>
                </div>
                <div className="delivery-card">
                  <div className="delivery-icon">{Icons.shield}</div>
                  <p className="delivery-title">Guaranteed</p>
                  <p className="delivery-val">1 year</p>
                </div>
              </div>
            </div>
          </div>

          <section className="detail-section">
            <h2>Details</h2>
            <p className="detail-desc" style={{ marginBottom: 24 }}>
              The {product.name} features a stunning display and advanced design for everyday use.
            </p>
            {specEntries.slice(0, showAllSpecs ? undefined : 2).map(([group, rows]) => (
              <div key={group} className="spec-table">
                <h3>{group}</h3>
                {Object.entries(rows).map(([key, val]) => (
                  <div key={key} className="spec-row">
                    <span>{key}</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            ))}
            <button type="button" className="view-more-btn" onClick={() => setShowAllSpecs(!showAllSpecs)}>
              View More {Icons.chevronDown}
            </button>
          </section>

          <section className="reviews-section">
            <h2>Reviews</h2>
            <div className="reviews-header">
              <div>
                <div className="reviews-score">
                  {avgRating}
                  <span>of {reviews.length} reviews</span>
                </div>
                <div className="reviews-stars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}>{Icons.starFill}</span>
                  ))}
                </div>
              </div>
              <div className="rating-bars">
                {ratingLabels.map((r) => (
                  <div key={r.label} className="rating-bar-row">
                    <span>{r.label}</span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: reviews.length ? `${(r.count / reviews.length) * 100}%` : '0%' }} />
                    </div>
                    <span>{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: star <= reviewRating ? '#f59e0b' : '#d1d5db' }}
                    aria-label={`${star} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                className="review-comment-input"
                placeholder="Leave Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </form>
            {reviews.map((r) => (
              <article key={r.id} className="review-card">
                <div className="review-avatar">{r.userName.charAt(0)}</div>
                <div className="review-body">
                  <div className="review-meta">
                    <span className="review-name">{r.userName}</span>
                    <span className="review-date">{r.date}</span>
                  </div>
                  <div className="review-stars">
                    {Array.from({ length: r.rating }, (_, i) => (
                      <span key={i}>{Icons.starFill}</span>
                    ))}
                  </div>
                  <p className="review-text">{r.comment}</p>
                </div>
              </article>
            ))}
            <button type="button" className="view-more-btn">
              View More {Icons.chevronDown}
            </button>
          </section>

          {related.length > 0 && (
            <section className="related-section">
              <h2>Related Products</h2>
              <div className="related-grid">
                {related.map((p) => (
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
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
