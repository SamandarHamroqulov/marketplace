const BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const API_ORIGIN =
  BASE_URL.startsWith('http') ? BASE_URL.replace(/\/api\/?$/, '') : '';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

const requestForm = async (endpoint, formData, method = 'POST') => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { method, headers, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

export const saveSession = (data) => {
  if (data.accessToken) localStorage.setItem('token', data.accessToken);
  if (data.user) {
    localStorage.setItem('user', JSON.stringify({
      id: data.user.id,
      fullName: data.user.fullName,
      email: data.user.email,
      role: data.user.role,
      isVerified: data.user.isVerified,
    }));
  }
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const api = {
  getProducts: (params = {}) => {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null);
    const q = new URLSearchParams(entries).toString();
    return request(`/products/all${q ? `?${q}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  getRelatedProducts: (id) => request(`/products/${id}/related`),
  getBrands: () => request('/products/meta/brands'),
  getCategories: () => request('/categories/all'),
  getReviews: (productId) => request(`/reviews?productId=${productId}`),
  createReview: (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  getCart: () => request('/cart'),
  addToCart: (productId, quantity = 1) =>
    request('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (itemId, quantity) =>
    request(`/cart/item/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeFromCart: (itemId) => request(`/cart/item/${itemId}`, { method: 'DELETE' }),
  getMe: () => request('/auth/me'),
  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    saveSession(data);
    return data;
  },
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearSession();
    }
  },
  getUsers: () => request('/users/all'),
  getOrders: () => request('/orders/my-orders'),
  getAdminOrders: () => request('/orders/admin/all'),
  getAddresses: () => request('/address/my-addresses'),
  createAddress: (body) => request('/address', { method: 'POST', body: JSON.stringify(body) }),
  checkout: (body) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(body) }),
  createCategory: (name, description = '') => {
    const fd = new FormData();
    fd.append('name', name);
    if (description) fd.append('description', description);
    return requestForm('/categories/create', fd);
  },
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  createProduct: (fields) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (k === 'images' && v && v.length > 0) {
        Array.from(v).forEach((file) => {
          fd.append('images', file);
        });
      } else if (v !== undefined && v !== null && v !== '') {
        fd.append(k, String(v));
      }
    });
    return requestForm('/products/create', fd);
  },
};

export default api;
