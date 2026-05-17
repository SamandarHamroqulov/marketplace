import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';
import { mapProduct } from '../api/mappers.js';

export default function AdminPage({ setPage }) {
  const { user, isAdmin, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [catName, setCatName] = useState('');
  const [prodForm, setProdForm] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    quantity: '1',
    brand: '',
    categoryId: '',
    colors: '',
    storageOptions: '',
  });

  const load = async () => {
    try {
      const [pRes, cats, usrs, ords] = await Promise.all([
        api.getProducts({ limit: 100 }),
        api.getCategories(),
        api.getUsers(),
        api.getAdminOrders().catch(() => []),
      ]);
      setProducts((pRes.items || []).map(mapProduct));
      setCategories(cats);
      setUsers(usrs);
      setOrders(Array.isArray(ords) ? ords : []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!user) {
      setPage('login');
      return;
    }
    if (!isAdmin) {
      setPage('home');
      return;
    }
    load();
  }, [user, isAdmin, setPage]);

  if (!user || !isAdmin) return null;

  const totalRevenue = orders.reduce((s, o) => s + Number(o.totalPrice || 0), 0);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createCategory(catName);
      setCatName('');
      setMessage('Category created');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fileInput = document.getElementById('product-images');
      const files = fileInput?.files;

      await api.createProduct({
        title: prodForm.title,
        description: prodForm.description,
        price: prodForm.price,
        compareAtPrice: prodForm.compareAtPrice || undefined,
        quantity: prodForm.quantity,
        brand: prodForm.brand || undefined,
        categoryId: prodForm.categoryId,
        colors: prodForm.colors
          ? JSON.stringify(prodForm.colors.split(',').map((c) => c.trim()).filter(Boolean))
          : undefined,
        storageOptions: prodForm.storageOptions
          ? JSON.stringify(prodForm.storageOptions.split(',').map((s) => s.trim()).filter(Boolean))
          : undefined,
        images: files,
      });

      setProdForm({
        title: '',
        description: '',
        price: '',
        compareAtPrice: '',
        quantity: '1',
        brand: '',
        categoryId: '',
        colors: '',
        storageOptions: '',
      });
      if (fileInput) fileInput.value = '';
      setMessage('Product created');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.deleteCategory(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'orders', label: 'Orders' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-logo">cyber</p>
        <nav className="admin-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'active' : ''}
              onClick={() => { setTab(t.id); setMessage(''); setError(''); }}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 32 }}>
          <button type="button" className="admin-nav" style={{ width: '100%' }} onClick={() => setPage('home')}>
            ← Store
          </button>
          <button
            type="button"
            className="admin-nav"
            style={{ width: '100%', marginTop: 8 }}
            onClick={async () => { await logout(); setPage('home'); }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Admin panel</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: 24, fontSize: 14 }}>
          Manage catalog, orders, and users
        </p>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}

        {tab === 'dashboard' && (
          <>
            <div className="admin-stats">
              <div className="admin-stat">
                <span>Products</span>
                <strong>{products.length}</strong>
              </div>
              <div className="admin-stat">
                <span>Orders</span>
                <strong>{orders.length}</strong>
              </div>
              <div className="admin-stat">
                <span>Users</span>
                <strong>{users.length}</strong>
              </div>
              <div className="admin-stat">
                <span>Revenue</span>
                <strong>${totalRevenue.toLocaleString()}</strong>
              </div>
            </div>
            <div className="admin-card">
              <h2>Recent orders</h2>
              {orders.length === 0 && <p style={{ color: 'var(--gray-400)' }}>No orders yet</p>}
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="admin-row" style={{ marginBottom: 8 }}>
                  <span>{o.id.slice(0, 8)}...</span>
                  <span>${Number(o.totalPrice).toLocaleString()}</span>
                  <span className="role-badge">{o.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'products' && (
          <div className="admin-card">
            <h2>Add product</h2>
            <form className="admin-grid-form" onSubmit={handleCreateProduct}>
              <input placeholder="Title" value={prodForm.title} onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })} required />
              <input placeholder="Brand" value={prodForm.brand} onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })} />
              <input type="number" placeholder="Price" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} required />
              <input type="number" placeholder="Compare at price" value={prodForm.compareAtPrice} onChange={(e) => setProdForm({ ...prodForm, compareAtPrice: e.target.value })} />
              <input type="number" placeholder="Quantity" value={prodForm.quantity} onChange={(e) => setProdForm({ ...prodForm, quantity: e.target.value })} />
              <select value={prodForm.categoryId} onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })} required>
                <option value="">Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input type="file" id="product-images" multiple accept="image/*" style={{ padding: '4px' }} />
              <input
                placeholder="Colors (vergul bilan: #ff0000, #00ff00)"
                value={prodForm.colors}
                onChange={(e) => setProdForm({ ...prodForm, colors: e.target.value })}
              />
              <input
                placeholder="Xotira variantlari (vergul bilan: 128GB, 256GB, 512GB)"
                value={prodForm.storageOptions}
                onChange={(e) => setProdForm({ ...prodForm, storageOptions: e.target.value })}
              />
              <textarea className="full" placeholder="Description" value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} required />
              <button type="submit" className="auth-btn full">Create product</button>
            </form>
            <h2 style={{ marginTop: 32 }}>Products ({products.length})</h2>
            <div className="admin-table">
              {products.map((p) => (
                <div key={p.id} className="admin-row">
                  <span>{p.name}</span>
                  <span>{p.brand}</span>
                  <span>${p.price}</span>
                  <button type="button" className="danger-btn" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'categories' && (
          <div className="admin-card">
            <h2>Add category</h2>
            <form className="admin-form inline" onSubmit={handleCreateCategory}>
              <input placeholder="Category name" value={catName} onChange={(e) => setCatName(e.target.value)} required />
              <button type="submit" className="auth-btn">Add</button>
            </form>
            <h2 style={{ marginTop: 24 }}>Categories</h2>
            <div className="admin-table">
              {categories.map((c) => (
                <div key={c.id} className="admin-row">
                  <span>{c.name}</span>
                  <button type="button" className="danger-btn" onClick={() => handleDeleteCategory(c.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="admin-card">
            <h2>Orders ({orders.length})</h2>
            <div className="admin-table">
              {orders.map((o) => (
                <div key={o.id} className="admin-row">
                  <span>{o.user?.fullName || o.user?.email || 'Customer'}</span>
                  <span>${Number(o.totalPrice).toLocaleString()}</span>
                  <span className="role-badge">{o.status}</span>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="admin-card">
            <h2>Users ({users.length})</h2>
            <div className="admin-table">
              {users.map((u) => (
                <div key={u.id} className="admin-row">
                  <span>{u.fullName}</span>
                  <span>{u.email}</span>
                  <span className="role-badge">{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
