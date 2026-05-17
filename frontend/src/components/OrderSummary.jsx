import { calculateTotals } from '../utils/checkout.js';

export default function OrderSummary({
  cart,
  promoCode,
  setPromoCode,
  bonusCard,
  setBonusCard,
  shippingMethod = 'free',
  showCheckoutButton,
  onCheckout,
}) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const { tax, shipping, total } = calculateTotals(subtotal, shippingMethod);

  return (
    <aside className="order-summary">
      <h3>Order Summary</h3>
      <label className="summary-label">Discount code / Promo code</label>
      <input
        className="summary-input"
        placeholder="Code"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
      />
      <label className="summary-label">Your bonus card number</label>
      <div className="summary-input-wrap">
        <input
          className="summary-input"
          placeholder="Enter Card Number"
          value={bonusCard}
          onChange={(e) => setBonusCard(e.target.value)}
        />
        <button type="button" className="summary-apply">Apply</button>
      </div>
      <div className="summary-rows">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Estimated Tax</span>
          <span>${tax}</span>
        </div>
        <div className="summary-row">
          <span>Estimated shipping &amp; Handling</span>
          <span>${shipping}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>${total.toLocaleString()}</span>
        </div>
      </div>
      {showCheckoutButton && (
        <button type="button" className="summary-checkout" onClick={onCheckout}>
          Checkout
        </button>
      )}
    </aside>
  );
}
