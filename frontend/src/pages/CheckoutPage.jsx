import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';
import { calculateTotals, SHIPPING_OPTIONS, formatShippingLabel } from '../utils/checkout.js';
import CheckoutStepper from '../components/CheckoutStepper.jsx';
import Footer from '../components/Footer.jsx';
import Icons from '../components/Icons.jsx';

export default function CheckoutPage({ cart, setCart, setPage }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressLine: '',
    city: '',
    zipCode: '',
    phoneNumber: '',
  });
  const [shippingMethod, setShippingMethod] = useState('free');
  const [paymentTab, setPaymentTab] = useState('card');
  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
    sameBilling: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setPage('login');
      return;
    }
    if (cart.length === 0) {
      setPage('cart');
      return;
    }
    fetchAddresses();
  }, [user, cart.length, setPage]);

  const fetchAddresses = async () => {
    try {
      const data = await api.getAddresses();
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddressId(data[0].id);
        setSelectedAddress(data[0]);
      }
    } catch {
      setAddresses([]);
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totals = calculateTotals(subtotal, shippingMethod);

  const handleNext = () => {
    if (step === 1 && !selectedAddressId) {
      setError('Please select or add an address');
      return;
    }
    setError('');
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      setPage('cart');
      return;
    }
    setStep((s) => s - 1);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await api.createAddress(newAddress);
      setAddresses((prev) => [...prev, data]);
      setSelectedAddressId(data.id);
      setSelectedAddress(data);
      setIsAddingNew(false);
      setNewAddress({ addressLine: '', city: '', zipCode: '', phoneNumber: '' });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      setLoading(true);
      await api.checkout({ addressId: selectedAddressId, shippingMethod });
      setCart([]);
      setPage('account');
    } catch (err) {
      setError(err.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  const addressText = selectedAddress
    ? `${selectedAddress.addressLine}, ${selectedAddress.city}${selectedAddress.zipCode ? `, ${selectedAddress.zipCode}` : ''}`
    : '';

  return (
    <div className="store-page">
      <div className="page-content">
        <CheckoutStepper step={step} />

        {error && <p className="auth-error" style={{ textAlign: 'center', marginBottom: 16 }}>{error}</p>}

        {step === 1 && (
          <div className="checkout-page-wrap">
            <h2 className="checkout-title">Delivery Address</h2>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`address-card${selectedAddressId === addr.id ? ' selected' : ''}`}
                onClick={() => {
                  setSelectedAddressId(addr.id);
                  setSelectedAddress(addr);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedAddressId(addr.id)}
              >
                <input
                  type="radio"
                  checked={selectedAddressId === addr.id}
                  onChange={() => {
                    setSelectedAddressId(addr.id);
                    setSelectedAddress(addr);
                  }}
                />
                <div>
                  <strong>{addr.city}</strong>
                  <p>{addr.addressLine}</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                    {addr.phoneNumber}{addr.zipCode ? ` • ${addr.zipCode}` : ''}
                  </p>
                </div>
              </div>
            ))}
            {!isAddingNew ? (
              <button type="button" className="add-address-btn" onClick={() => setIsAddingNew(true)}>
                + Add New Address
              </button>
            ) : (
              <form className="address-form" onSubmit={handleSaveAddress}>
                <input
                  placeholder="Address Line"
                  required
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                />
                <input
                  placeholder="City"
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
                <input
                  placeholder="Zip Code"
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                />
                <input
                  placeholder="Phone Number"
                  value={newAddress.phoneNumber}
                  onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                />
                <div className="checkout-actions" style={{ justifyContent: 'flex-start' }}>
                  <button type="submit" className="btn-next" disabled={loading}>Save</button>
                  <button type="button" className="btn-back" onClick={() => setIsAddingNew(false)}>Cancel</button>
                </div>
              </form>
            )}
            <div className="checkout-actions">
              <button type="button" className="btn-back" onClick={handleBack}>Back</button>
              <button type="button" className="btn-next" onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="checkout-page-wrap">
            <h2 className="checkout-title">Shipment Method</h2>
            {SHIPPING_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`shipping-option${shippingMethod === opt.id ? ' selected' : ''}`}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === opt.id}
                  onChange={() => setShippingMethod(opt.id)}
                />
                <div className="shipping-option-body">
                  <strong>{opt.title}</strong>
                  <p>{opt.subtitle}</p>
                </div>
                {opt.id === 'schedule' ? (
                  <button type="button" className="shipping-select-date">
                    Select Date {Icons.chevronDown}
                  </button>
                ) : (
                  <span className="shipping-option-date">{opt.date}</span>
                )}
              </label>
            ))}
            <div className="checkout-actions">
              <button type="button" className="btn-back" onClick={handleBack}>Back</button>
              <button type="button" className="btn-next" onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="payment-layout">
            <div className="payment-summary-card">
              <h3>Summary</h3>
              {cart.map((item) => (
                <div key={item.cartItemId || item.id} className="payment-item">
                  <img src={item.image} alt={item.name} />
                  <span className="payment-item-info">{item.name}</span>
                  <span className="payment-item-price">${(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="payment-meta">
                <p>Address</p>
                <strong>{addressText}</strong>
              </div>
              <div className="payment-meta">
                <p>Shipment method</p>
                <strong>{formatShippingLabel(shippingMethod)}</strong>
              </div>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Tax</span>
                  <span>${totals.tax}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated shipping &amp; Handling</span>
                  <span>${totals.shipping}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${totals.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="checkout-title">Payment</h2>
              <div className="payment-tabs">
                {['card', 'paypal', 'credit'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`payment-tab${paymentTab === tab ? ' active' : ''}`}
                    onClick={() => setPaymentTab(tab)}
                  >
                    {tab === 'card' ? 'Credit Card' : tab === 'paypal' ? 'PayPal' : 'PayPal Credit'}
                  </button>
                ))}
              </div>
              {paymentTab === 'card' && (
                <>
                  <div className="card-preview">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>◆</span>
                      <span>)))</span>
                    </div>
                    <p className="card-number">
                      {cardForm.number || '4085 9536 8475 9530'}
                    </p>
                    <p className="card-holder">Cardholder</p>
                  </div>
                  <form className="payment-form" onSubmit={(e) => e.preventDefault()}>
                    <input
                      placeholder="Cardholder Name"
                      value={cardForm.name}
                      onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    />
                    <input
                      placeholder="Card Number"
                      value={cardForm.number}
                      onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                    />
                    <div className="row-2">
                      <input
                        placeholder="Exp.Date"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                      />
                      <input
                        placeholder="CVV"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      />
                    </div>
                    <label className="payment-checkbox">
                      <input
                        type="checkbox"
                        checked={cardForm.sameBilling}
                        onChange={(e) => setCardForm({ ...cardForm, sameBilling: e.target.checked })}
                      />
                      Same as billing address
                    </label>
                  </form>
                </>
              )}
              <div className="checkout-actions">
                <button type="button" className="btn-back" onClick={handleBack}>Back</button>
                <button type="button" className="btn-pay" onClick={handlePay} disabled={loading}>
                  {loading ? 'Processing...' : 'Pay'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
