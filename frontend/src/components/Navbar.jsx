import { useState } from 'react';
import Icons from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ page, setPage, cartCount, wishCount, query, setQuery }) {
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setPage('catalog');
    }
  };

  const handleLogout = async () => {
    await logout();
    setPage('home');
    setMenuOpen(false);
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="logo" onClick={() => setPage('home')}>cyber</div>

        <div className="search-box desktop-only">
          <span className="s-icon">{Icons.search}</span>
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div className="nav-links desktop-only">
          <a className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Home</a>
          <a onClick={() => setPage('catalog')}>About</a>
          <a onClick={() => setPage('catalog')}>Contact Us</a>
          <a onClick={() => setPage('catalog')}>Blog</a>
          {isAdmin && <a onClick={() => setPage('admin')}>Admin</a>}
        </div>

        <div className="nav-actions">
          <button type="button" className="nav-btn" onClick={() => setPage('wishlist')}>
            {Icons.heart}
            {wishCount > 0 && <span className="badge">{wishCount}</span>}
          </button>
          <button type="button" className="nav-btn" onClick={() => setPage('cart')}>
            {Icons.cart}
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
          {user ? (
            <button type="button" className="nav-btn desktop-only nav-user" onClick={() => setPage('account')} title={user.fullName}>
              {Icons.user}
            </button>
          ) : (
            <button type="button" className="nav-btn desktop-only" onClick={() => setPage('login')}>
              {Icons.user}
            </button>
          )}
          <button type="button" className="nav-btn hamburger mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? Icons.x : Icons.menu}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav-mobile-menu">
          <div className="search-box">
            <span className="s-icon">{Icons.search}</span>
            <input
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <a onClick={() => { setPage('home'); setMenuOpen(false); }}>Home</a>
          <a onClick={() => { setPage('catalog'); setMenuOpen(false); }}>Catalog</a>
          {user ? (
            <>
              <a onClick={() => { setPage('account'); setMenuOpen(false); }}>Account</a>
              {isAdmin && <a onClick={() => { setPage('admin'); setMenuOpen(false); }}>Admin</a>}
              <a onClick={handleLogout}>Log out</a>
            </>
          ) : (
            <>
              <a onClick={() => { setPage('login'); setMenuOpen(false); }}>Sign in</a>
              <a onClick={() => { setPage('register'); setMenuOpen(false); }}>Register</a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
