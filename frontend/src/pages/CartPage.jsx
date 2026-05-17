import { useState } from 'react';
import Footer from '../components/Footer.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import Icons from '../components/Icons.jsx';

export default function CartPage({ cart, setPage, onUpdateQty, onRemove }) {
  const [promoCode, setPromoCode] = useState('');
  const [bonusCard, setBonusCard] = useState('');

  if (cart.length === 0) {
    return (
      <div className="store-page">
        <div className="page-content">
          <div className="empty-state">
            <p className="empty-icon">🛒</p>
            <p className="empty-title">Your cart is empty</p>
            <button type="button" className="checkout-btn" onClick={() => setPage('catalog')}>
              Browse catalog
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="store-page">
      <div className="page-content">
        <div className="cart-layout">
          <h1>Shopping Cart</h1>
          <div className="cart-items-col">
            {cart.map((item) => (
              <div key={item.cartItemId || item.id} className="cart-row">
                <img src={item.image} alt={item.name} />
                <div className="cart-row-info">
                  <h3>{item.name}</h3>
                  <p>{item.sku}</p>
                </div>
                <div className="qty-control">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => onUpdateQty(item, Math.max(1, item.qty - 1))}
                    aria-label="Decrease"
                  >
                    {Icons.minus}
                  </button>
                  <span className="qty-val">{item.qty}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => onUpdateQty(item, item.qty + 1)}
                    aria-label="Increase"
                  >
                    {Icons.plus}
                  </button>
                </div>
                <p className="cart-row-price">${(item.price * item.qty).toLocaleString()}</p>
                <button
                  type="button"
                  className="cart-remove"
                  onClick={() => onRemove(item)}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <OrderSummary
            cart={cart}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            bonusCard={bonusCard}
            setBonusCard={setBonusCard}
            showCheckoutButton
            onCheckout={() => setPage('checkout')}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
