import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export default function AccountPage({ setPage }) {
  const { user, logout, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPage('login');
      return;
    }
    api
      .getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, setPage]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    setPage('home');
  };

  return (
    <div className="account-page">
      <h1>My account</h1>
      <div className="account-card">
        <p><strong>Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
        <div className="account-actions">
          {isAdmin && (
            <button type="button" className="auth-btn secondary" onClick={() => setPage('admin')}>
              Admin panel
            </button>
          )}
          <button type="button" className="auth-btn outline" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <h2>My orders</h2>
      {loading && <p className="grid-message">Loading orders...</p>}
      {!loading && orders.length === 0 && <p className="grid-message">No orders yet</p>}
      {!loading && orders.map((order) => (
        <div key={order.id} className="order-card">
          <p><strong>Order</strong> #{order.id.slice(0, 8)}</p>
          <p>Total: ${Number(order.totalPrice).toLocaleString()}</p>
          <p>Status: {order.status || 'pending'}</p>
          <p className="order-date">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
