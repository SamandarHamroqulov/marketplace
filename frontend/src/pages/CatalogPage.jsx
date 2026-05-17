import { useState, useEffect } from 'react';
import api from '../api/client.js';
import { mapProduct } from '../api/mappers.js';
import { SORT_MAP } from '../constants/sortMap.js';
import Icon from '../components/Icon.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

const FALLBACK_BRANDS = [
  { name: 'Apple', count: 0 },
  { name: 'Samsung', count: 0 },
  { name: 'Xiaomi', count: 0 },
  { name: 'Poco', count: 0 },
  { name: 'OPPO', count: 0 },
  { name: 'Honor', count: 0 },
  { name: 'Motorola', count: 0 },
  { name: 'Nokia', count: 0 },
  { name: 'Realme', count: 0 },
];

const FILTER_SECTIONS = ['Battery capacity', 'Screen type', 'Screen diagonal', 'Protection class', 'Built-in memory'];

export default function CatalogPage({ query, onSelectProduct, wishlist, onWishToggle, setPage }) {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sort, setSort] = useState('rating');
  const [searchBrand, setSearchBrand] = useState('');
  const [brands, setBrands] = useState(FALLBACK_BRANDS);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setLocalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({ brand: true });
  const limit = 9;

  useEffect(() => {
    api.getBrands().then((data) => {
      if (data?.length) setBrands(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      search: query || undefined,
      sort: SORT_MAP[sort],
      page,
      limit,
    };
    if (selectedBrands.length === 1) params.brand = selectedBrands[0];
    api
      .getProducts(params)
      .then((res) => {
        let items = (res.items || []).map(mapProduct);
        if (selectedBrands.length > 1) {
          items = items.filter((p) => selectedBrands.includes(p.brand));
        }
        setProducts(items);
        setTotal(res.total ?? items.length);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [query, sort, selectedBrands, page]);

  const toggleBrand = (name) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name],
    );
    setLocalPage(1);
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchBrand.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="store-page">
      <div className="page-content">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <span onClick={() => setPage('home')}>Home</span>
          <Icon d="M9 18l6-6-6-6" size={14} />
          <span onClick={() => setPage('catalog')}>Catalog</span>
          <Icon d="M9 18l6-6-6-6" size={14} />
          <span className="current">Smartphones</span>
        </nav>

        <div className="catalog-page">
          <aside className="sidebar">
            <div className="sidebar-section sidebar-filter">
              <button
                type="button"
                className="filter-head"
                onClick={() => setOpenSections((s) => ({ ...s, brand: !s.brand }))}
              >
                Brand
                <Icon d="M6 9l6 6 6-6" size={16} />
              </button>
              {openSections.brand && (
                <>
                  <input
                    className="sidebar-search"
                    placeholder="Search"
                    value={searchBrand}
                    onChange={(e) => setSearchBrand(e.target.value)}
                  />
                  {filteredBrands.map((b) => (
                    <label key={b.name} className="brand-item">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b.name)}
                        onChange={() => toggleBrand(b.name)}
                      />
                      {b.name}
                      <span>{b.count}</span>
                    </label>
                  ))}
                </>
              )}
            </div>
            {FILTER_SECTIONS.map((title) => (
              <div key={title} className="sidebar-section sidebar-filter">
                <button type="button" className="filter-head">
                  {title}
                  <Icon d="M6 9l6 6 6-6" size={16} />
                </button>
              </div>
            ))}
          </aside>

          <div className="products-area">
            <div className="products-header">
              <div className="products-count">
                Selected Products: <b>{loading ? '...' : total}</b>
              </div>
              <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="rating">By rating</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
            <div className="products-grid">
              {loading && <p className="grid-message">Loading...</p>}
              {!loading && products.length === 0 && <p className="grid-message">No products found</p>}
              {!loading && products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                  onWishToggle={onWishToggle}
                  isWished={wishlist.includes(p.id)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="page-btn"
                  disabled={page <= 1}
                  onClick={() => setLocalPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`page-btn${page === n ? ' active' : ''}`}
                    onClick={() => setLocalPage(n)}
                  >
                    {n}
                  </button>
                ))}
                {totalPages > 5 && <span className="page-btn">...</span>}
                <button
                  type="button"
                  className="page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setLocalPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
